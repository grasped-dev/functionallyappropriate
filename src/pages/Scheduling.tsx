import React, { useState } from 'react';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Clock, Users, ArrowLeft, Eye } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isToday, addDays } from 'date-fns';
import NewIEPMeetingModal from '../components/scheduling/NewIEPMeetingModal';
import DaySlotsModal from '../components/scheduling/DaySlotsModal';
import { IEPMeeting, mockTeamMembers } from '../data/schedulingMockData';
import { calculateTeamAvailability, AvailableSlot } from '../utils/scheduleCalculator';

type ViewMode = 'initial' | 'availability';

const Scheduling: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isNewMeetingModalOpen, setIsNewMeetingModalOpen] = useState(false);
  const [iepMeetings, setIepMeetings] = useState<IEPMeeting[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('initial');
  const [currentMeetingProposal, setCurrentMeetingProposal] = useState<Partial<IEPMeeting> | null>(null);
  const [calculatedAvailability, setCalculatedAvailability] = useState<{
    individualAvailability: any[];
    commonSlots: AvailableSlot[];
    allSlots: AvailableSlot[];
  } | null>(null);

  // State for expanded day view
  const [expandedDay, setExpandedDay] = useState<Date | null>(null);
  const [expandedDaySlots, setExpandedDaySlots] = useState<AvailableSlot[]>([]);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const monthEvents = iepMeetings.filter(meeting => 
    meeting.date && isSameMonth(new Date(meeting.date), currentMonth)
  );

  const handleScheduleMeeting = (meetingDetails: Partial<IEPMeeting>) => {
    console.log('Meeting proposal received:', meetingDetails);
    setCurrentMeetingProposal(meetingDetails);
    
    // Calculate availability for selected team members with desired duration
    if (meetingDetails.teamMemberIds && meetingDetails.teamMemberIds.length > 0 && meetingDetails.durationMinutes) {
      const startDate = new Date();
      const endDate = addDays(startDate, 90); // Calculate 3 months ahead
      
      const availability = calculateTeamAvailability(
        meetingDetails.teamMemberIds,
        startDate,
        endDate,
        meetingDetails.durationMinutes
      );
      
      setCalculatedAvailability(availability);
      console.log('Calculated Availability in handleScheduleMeeting:', availability);
    }
    
    setViewMode('availability');
    setIsNewMeetingModalOpen(false);
  };

  const handleSlotClick = (slot: AvailableSlot) => {
    if (!currentMeetingProposal) return;
    
    // Create final meeting object directly
    const finalMeeting: IEPMeeting = {
      ...currentMeetingProposal,
      date: slot.date,
      time: slot.startTime,
      durationMinutes: currentMeetingProposal.durationMinutes!,
      status: 'scheduled',
    } as IEPMeeting;
    
    // Add to meetings list
    setIepMeetings(prev => [...prev, finalMeeting]);
    
    // Clear states after successful scheduling
    setCurrentMeetingProposal(null);
    setCalculatedAvailability(null);
    setExpandedDay(null);
    setExpandedDaySlots([]);
    setViewMode('initial'); // Return to initial view after scheduling
  };

  const handleDayClick = (day: Date, dayCommonSlots: AvailableSlot[]) => {
    if (dayCommonSlots.length === 0) return;
    
    setExpandedDay(day);
    setExpandedDaySlots(dayCommonSlots);
  };

  const handleBackToInitial = () => {
    setViewMode('initial');
    setCurrentMeetingProposal(null);
    setCalculatedAvailability(null);
    setExpandedDay(null);
    setExpandedDaySlots([]);
    setIsNewMeetingModalOpen(true);
  };

  const getTeamMemberNames = (teamMemberIds: string[]) => {
    return teamMemberIds
      .map(id => mockTeamMembers.find(member => member.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  const formatTime = (timeString: string): string => {
    const [hour, minute] = timeString.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  // Get slots for current month from calculated availability
  const getMonthSlots = () => {
    if (!calculatedAvailability) return { commonSlots: [] };
    
    const monthCommonSlots = calculatedAvailability.commonSlots.filter(slot => 
      isSameMonth(new Date(slot.date), currentMonth)
    );
    
    console.log('Slots for current month:', monthCommonSlots);
    
    return { commonSlots: monthCommonSlots };
  };

  // Initial View
  if (viewMode === 'initial') {
    return (
      <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-medium">Scheduling</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area - Initial View */}
          <div className="lg:col-span-2">
            <div className="card text-center py-12">
              <CalendarIcon className="text-teal mx-auto mb-4" size={64} />
              <h2 className="text-2xl font-medium mb-4">Schedule IEP Meetings</h2>
              <p className="text-text-secondary mb-8 max-w-md mx-auto">
                Select your team members, meeting duration, and we'll show you exactly when 
                everyone is available for that specific time block.
              </p>
              
              <button 
                className="btn bg-accent-teal text-lg px-8 py-4"
                onClick={() => setIsNewMeetingModalOpen(true)}
              >
                <span className="flex items-center gap-2">
                  <Plus size={24} />
                  Schedule New IEP Meeting
                </span>
              </button>
            </div>
          </div>
          
          {/* Upcoming Events Sidebar */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <CalendarIcon className="text-teal" size={20} />
              <h2 className="text-xl font-medium">Upcoming Events</h2>
            </div>
            
            {iepMeetings.length > 0 ? (
              <div className="space-y-4">
                {iepMeetings
                  .filter(meeting => meeting.date && new Date(meeting.date) >= new Date())
                  .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())
                  .slice(0, 5)
                  .map(meeting => (
                    <div key={meeting.id} className="p-3 border border-border rounded-md hover:border-teal transition-all">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium">{meeting.studentName}</h3>
                        <span className="text-sm bg-teal text-white px-2 py-0.5 rounded">
                          {meeting.date && format(new Date(meeting.date), 'MMM d')}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary mt-1">
                        {meeting.time && formatTime(meeting.time)} - {meeting.meetingType}
                      </p>
                      <p className="text-xs text-text-secondary mt-1">
                        Duration: {meeting.durationMinutes} minutes
                      </p>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-text-secondary py-4 text-center">No upcoming events scheduled</p>
            )}
            
            <button 
              className="w-full mt-4 p-2 border border-teal text-teal rounded-md hover:bg-teal hover:bg-opacity-10 transition-all flex items-center justify-center gap-1"
              onClick={() => setIsNewMeetingModalOpen(true)}
            >
              <Plus size={16} />
              Add Event
            </button>
          </div>
        </div>

        <NewIEPMeetingModal
          isOpen={isNewMeetingModalOpen}
          onClose={() => setIsNewMeetingModalOpen(false)}
          onScheduleMeeting={handleScheduleMeeting}
          initialProposal={currentMeetingProposal}
        />
      </div>
    );
  }

  // Availability View
  const { commonSlots: monthCommonSlots } = getMonthSlots();

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackToInitial}
            className="btn border border-border hover:bg-bg-secondary flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <h1 className="text-2xl font-medium">Available {currentMeetingProposal?.durationMinutes}-Minute Slots</h1>
        </div>
      </div>

      {/* Meeting Proposal Summary */}
      {currentMeetingProposal && (
        <div className="card mb-6 bg-teal bg-opacity-5 border-teal">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-teal rounded-full text-white">
              <Users size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-lg mb-2">
                {currentMeetingProposal.meetingType} for {currentMeetingProposal.studentName}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Meeting Type:</span> {currentMeetingProposal.meetingType}
                  {currentMeetingProposal.customMeetingType && ` (${currentMeetingProposal.customMeetingType})`}
                </div>
                <div>
                  <span className="font-medium">Duration:</span> {currentMeetingProposal.durationMinutes} minutes
                </div>
                <div>
                  <span className="font-medium">Team Members:</span> {getTeamMemberNames(currentMeetingProposal.teamMemberIds || [])}
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-teal rounded"></div>
                  <span>Teal slots = {currentMeetingProposal.durationMinutes}-minute blocks where all {currentMeetingProposal.teamMemberIds?.length || 0} members are available</span>
                </div>
              </div>
              <p className="text-text-secondary mt-2 text-sm">
                Click on any day with teal availability to see all {currentMeetingProposal.durationMinutes}-minute time slots for that day.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium">{format(currentMonth, 'MMMM yyyy')}</h2>
            <div className="flex gap-2">
              <button 
                onClick={prevMonth}
                className="p-2 rounded-md hover:bg-bg-secondary transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={nextMonth}
                className="p-2 rounded-md hover:bg-bg-secondary transition-colors"
                aria-label="Next month"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map(day => (
              <div key={day} className="text-center font-medium p-2 text-sm">
                {day}
              </div>
            ))}
            
            {Array.from({ length: getDay(monthStart) }).map((_, index) => (
              <div key={`empty-start-${index}`} className="h-32 p-2 border border-border bg-bg-secondary bg-opacity-30 rounded-md" />
            ))}
            
            {monthDays.map(day => {
              const dayMeetings = iepMeetings.filter(meeting => 
                meeting.date && format(new Date(meeting.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
              );
              
              // Only get common slots for this day
              const dayCommonSlots = monthCommonSlots.filter(slot => 
                format(new Date(slot.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
              );
              
              const isPastDate = day < new Date(new Date().setHours(0, 0, 0, 0));
              const isWeekend = getDay(day) === 0 || getDay(day) === 6;
              const hasCommonSlots = dayCommonSlots.length > 0;
              
              return (
                <div 
                  key={day.toString()} 
                  className={`h-32 p-1 border border-border rounded-md overflow-hidden transition-all ${
                    isPastDate || isWeekend
                      ? 'bg-bg-secondary bg-opacity-50' 
                      : hasCommonSlots
                        ? 'hover:border-teal cursor-pointer hover:bg-teal hover:bg-opacity-5' 
                        : ''
                  } ${
                    isToday(day) ? 'bg-teal bg-opacity-10 border-teal' : ''
                  }`}
                  onClick={() => !isPastDate && !isWeekend && hasCommonSlots && handleDayClick(day, dayCommonSlots)}
                >
                  <div className={`text-sm font-medium mb-1 ${isPastDate ? 'text-text-secondary' : hasCommonSlots ? 'text-teal font-bold' : ''}`}>
                    {format(day, 'd')}
                  </div>
                  
                  <div className="space-y-1">
                    {/* Show existing meetings */}
                    {dayMeetings.map(meeting => (
                      <div key={meeting.id} className="text-xs p-1 bg-gray-500 text-white rounded truncate">
                        {meeting.time && formatTime(meeting.time)}
                        <div className="text-[10px] opacity-80 truncate">{meeting.studentName}</div>
                      </div>
                    ))}
                    
                    {/* Show common slots indicator */}
                    {!isPastDate && !isWeekend && hasCommonSlots && (
                      <div className="text-center">
                        <div className="text-xs text-teal font-bold bg-teal bg-opacity-10 rounded px-1 py-0.5">
                          {dayCommonSlots.length} slot{dayCommonSlots.length !== 1 ? 's' : ''}
                        </div>
                        <div className="text-[10px] text-teal mt-1">
                          {currentMeetingProposal?.durationMinutes}min blocks
                        </div>
                      </div>
                    )}
                    
                    {/* Show message when no common slots but day is available */}
                    {!isPastDate && !isWeekend && !hasCommonSlots && dayMeetings.length === 0 && (
                      <div className="text-xs text-text-secondary text-center py-2">
                        No {currentMeetingProposal?.durationMinutes}min slots
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {Array.from({ length: 6 - getDay(monthEnd) }).map((_, index) => (
              <div key={`empty-end-${index}`} className="h-32 p-2 border border-border bg-bg-secondary bg-opacity-30 rounded-md" />
            ))}
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="text-teal" size={20} />
            <h2 className="text-xl font-medium">{currentMeetingProposal?.durationMinutes}-Min Availability</h2>
          </div>
          
          <div className="space-y-4 text-sm">
            {/* Statistics */}
            {calculatedAvailability && (
              <div className="p-3 bg-bg-secondary rounded-md">
                <h3 className="font-medium mb-2">This Month</h3>
                <div className="space-y-2 text-text-secondary">
                  <div className="flex justify-between">
                    <span>{currentMeetingProposal?.durationMinutes}-min slots found:</span>
                    <span className="font-medium text-teal">{monthCommonSlots.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Team members:</span>
                    <span className="font-medium">{currentMeetingProposal?.teamMemberIds?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Meeting duration:</span>
                    <span className="font-medium">{currentMeetingProposal?.durationMinutes} minutes</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="p-3 bg-bg-secondary rounded-md">
              <h3 className="font-medium mb-2">How to Schedule</h3>
              <ol className="space-y-2 text-text-secondary">
                <li>1. <span className="text-teal font-medium">Click any day</span> with teal availability</li>
                <li>2. <span className="text-teal font-medium">Select a {currentMeetingProposal?.durationMinutes}-minute slot</span> from the list</li>
                <li>3. Meeting is immediately scheduled!</li>
              </ol>
            </div>
            
            {/* Show next few common slots */}
            {monthCommonSlots.length > 0 ? (
              <div className="mt-6">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Eye size={16} />
                  Next Available Slots
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {monthCommonSlots
                    .filter(slot => new Date(slot.date) >= new Date(new Date().setHours(0, 0, 0, 0)))
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .slice(0, 8)
                    .map((slot, index) => (
                      <button
                        key={index}
                        onClick={() => handleSlotClick(slot)}
                        className="w-full text-left text-xs p-2 border border-teal rounded hover:bg-teal hover:bg-opacity-10 transition-colors"
                      >
                        <div className="font-medium">{format(new Date(slot.date), 'MMM d')}</div>
                        <div className="text-text-secondary">
                          {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                        </div>
                        <div className="text-teal text-[10px]">
                          {currentMeetingProposal?.durationMinutes}-min block • All {currentMeetingProposal?.teamMemberIds?.length || 0} members available
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            ) : (
              <div className="mt-6 p-4 bg-bg-secondary rounded-md text-center">
                <Clock className="text-text-secondary mx-auto mb-2" size={24} />
                <h3 className="font-medium mb-1">No {currentMeetingProposal?.durationMinutes}-Minute Slots</h3>
                <p className="text-xs text-text-secondary">
                  No {currentMeetingProposal?.durationMinutes}-minute blocks found when all {currentMeetingProposal?.teamMemberIds?.length || 0} team members are available this month.
                </p>
                <button 
                  onClick={handleBackToInitial}
                  className="mt-3 text-xs text-teal hover:underline"
                >
                  Try different duration or team members
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <NewIEPMeetingModal
        isOpen={isNewMeetingModalOpen}
        onClose={() => setIsNewMeetingModalOpen(false)}
        onScheduleMeeting={handleScheduleMeeting}
        initialProposal={currentMeetingProposal}
      />

      <DaySlotsModal
        isOpen={expandedDay !== null}
        onClose={() => {
          setExpandedDay(null);
          setExpandedDaySlots([]);
        }}
        day={expandedDay}
        commonSlotsForDay={expandedDaySlots}
        onSlotSelect={handleSlotClick}
      />
    </div>
  );
};

export default Scheduling;
