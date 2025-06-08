// src/utils/scheduleCalculator.ts

import { TeamMember, mockTeamMembers } from '../data/schedulingMockData';
import { format, addDays, getDay } from 'date-fns';

export interface AvailableSlot {
  date: string; // "YYYY-MM-DD"
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  isCommon: boolean; // true if ALL selected team members are available
  availableMembers: string[]; // IDs of team members available during this slot
}

export interface TeamMemberAvailability {
  memberId: string;
  memberName: string;
  slots: {
    date: string;
    startTime: string;
    endTime: string;
  }[];
}

// Convert day number to day name
const getDayName = (dayNumber: number): keyof TeamMember['weeklySchedule'] => {
  const days: (keyof TeamMember['weeklySchedule'])[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayNumber] as keyof TeamMember['weeklySchedule'];
};

// Convert time string to minutes since midnight
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// Convert minutes since midnight to time string
const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

// Generate available slots for a team member on a specific date
const generateMemberSlotsForDate = (member: TeamMember, date: string): { startTime: string; endTime: string }[] => {
  const dayOfWeek = getDay(new Date(date));
  const dayName = getDayName(dayOfWeek);
  
  // Skip weekends
  if (dayName === 'Sunday' || dayName === 'Saturday') {
    return [];
  }
  
  const schedule = member.weeklySchedule[dayName];
  if (!schedule) return [];
  
  const workStart = timeToMinutes(schedule.startTime);
  const workEnd = timeToMinutes(schedule.endTime);
  const unavailableSlots = schedule.unavailableSlots || [];
  
  // Create available time slots (30-minute increments)
  const slots: { startTime: string; endTime: string }[] = [];
  
  // Sort unavailable slots by start time
  const sortedUnavailable = [...unavailableSlots].sort((a, b) => 
    timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );
  
  let currentTime = workStart;
  
  for (const unavailable of sortedUnavailable) {
    const unavailableStart = timeToMinutes(unavailable.startTime);
    const unavailableEnd = timeToMinutes(unavailable.endTime);
    
    // Add slots before this unavailable period
    while (currentTime + 30 <= unavailableStart) {
      slots.push({
        startTime: minutesToTime(currentTime),
        endTime: minutesToTime(currentTime + 30)
      });
      currentTime += 30;
    }
    
    // Skip past the unavailable period
    currentTime = Math.max(currentTime, unavailableEnd);
  }
  
  // Add remaining slots after all unavailable periods
  while (currentTime + 30 <= workEnd) {
    slots.push({
      startTime: minutesToTime(currentTime),
      endTime: minutesToTime(currentTime + 30)
    });
    currentTime += 30;
  }
  
  return slots;
};

// Find contiguous blocks of common availability that fit the desired duration
const findDurationSpecificSlots = (
  commonSlots: AvailableSlot[],
  desiredDurationMinutes: number
): AvailableSlot[] => {
  const durationSpecificSlots: AvailableSlot[] = [];
  
  // Group slots by date
  const slotsByDate = new Map<string, AvailableSlot[]>();
  commonSlots.forEach(slot => {
    if (!slotsByDate.has(slot.date)) {
      slotsByDate.set(slot.date, []);
    }
    slotsByDate.get(slot.date)!.push(slot);
  });
  
  // For each date, find contiguous blocks that can accommodate the desired duration
  slotsByDate.forEach((daySlots, date) => {
    // Sort slots by start time
    const sortedSlots = daySlots.sort((a, b) => 
      timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
    );
    
    // Find contiguous blocks
    const blocks: AvailableSlot[][] = [];
    let currentBlock: AvailableSlot[] = [];
    
    for (const slot of sortedSlots) {
      if (currentBlock.length === 0) {
        currentBlock = [slot];
      } else {
        const lastSlot = currentBlock[currentBlock.length - 1];
        const lastEndTime = timeToMinutes(lastSlot.endTime);
        const currentStartTime = timeToMinutes(slot.startTime);
        
        // If slots are contiguous (no gap), add to current block
        if (currentStartTime === lastEndTime) {
          currentBlock.push(slot);
        } else {
          // Gap found, save current block and start new one
          if (currentBlock.length > 0) {
            blocks.push([...currentBlock]);
          }
          currentBlock = [slot];
        }
      }
    }
    
    // Don't forget the last block
    if (currentBlock.length > 0) {
      blocks.push(currentBlock);
    }
    
    // For each block, generate possible start times for the desired duration
    blocks.forEach(block => {
      if (block.length === 0) return;
      
      const blockStartTime = timeToMinutes(block[0].startTime);
      const blockEndTime = timeToMinutes(block[block.length - 1].endTime);
      const blockDurationMinutes = blockEndTime - blockStartTime;
      
      // If block is long enough for the desired duration
      if (blockDurationMinutes >= desiredDurationMinutes) {
        // Generate possible start times (every 30 minutes)
        let possibleStartTime = blockStartTime;
        
        while (possibleStartTime + desiredDurationMinutes <= blockEndTime) {
          durationSpecificSlots.push({
            date: date,
            startTime: minutesToTime(possibleStartTime),
            endTime: minutesToTime(possibleStartTime + desiredDurationMinutes),
            isCommon: true,
            availableMembers: block[0].availableMembers // All members are available for common slots
          });
          
          possibleStartTime += 30; // Move to next 30-minute increment
        }
      }
    });
  });
  
  return durationSpecificSlots;
};

// Calculate availability for selected team members over a date range
export const calculateTeamAvailability = (
  teamMemberIds: string[],
  startDate: Date,
  endDate: Date,
  desiredDurationMinutes: number = 30
): {
  individualAvailability: TeamMemberAvailability[];
  commonSlots: AvailableSlot[];
  allSlots: AvailableSlot[];
} => {
  const selectedMembers = mockTeamMembers.filter(member => 
    teamMemberIds.includes(member.id)
  );
  
  const individualAvailability: TeamMemberAvailability[] = [];
  const allSlotsMap = new Map<string, AvailableSlot>(); // key: "date-startTime-endTime"
  
  // Calculate individual availability for each team member
  for (const member of selectedMembers) {
    const memberSlots: { date: string; startTime: string; endTime: string }[] = [];
    
    // Generate slots for each date in the range
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      const daySlots = generateMemberSlotsForDate(member, dateStr);
      
      for (const slot of daySlots) {
        memberSlots.push({
          date: dateStr,
          startTime: slot.startTime,
          endTime: slot.endTime
        });
        
        // Add to all slots map
        const slotKey = `${dateStr}-${slot.startTime}-${slot.endTime}`;
        if (!allSlotsMap.has(slotKey)) {
          allSlotsMap.set(slotKey, {
            date: dateStr,
            startTime: slot.startTime,
            endTime: slot.endTime,
            isCommon: false,
            availableMembers: []
          });
        }
        
        const existingSlot = allSlotsMap.get(slotKey)!;
        existingSlot.availableMembers.push(member.id);
      }
      
      currentDate = addDays(currentDate, 1);
    }
    
    individualAvailability.push({
      memberId: member.id,
      memberName: member.name,
      slots: memberSlots
    });
  }
  
  // Convert map to array and determine common slots (30-minute base slots)
  const allSlots = Array.from(allSlotsMap.values());
  const baseCommonSlots = allSlots.filter(slot => 
    slot.availableMembers.length === selectedMembers.length
  );
  
  // Mark common slots
  baseCommonSlots.forEach(slot => {
    slot.isCommon = true;
  });
  
  // Generate duration-specific common slots
  const durationSpecificCommonSlots = findDurationSpecificSlots(baseCommonSlots, desiredDurationMinutes);
  
  return {
    individualAvailability,
    commonSlots: durationSpecificCommonSlots,
    allSlots
  };
};