import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Clock, Users, ArrowLeft, Eye } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isToday, addDays } from 'date-fns';
import NewIEPMeetingModal from '../components/scheduling/NewIEPMeetingModal';
import DaySlotsModal from '../components/scheduling/DaySlotsModal';
import MeetingConfirmationModal from '../components/scheduling/MeetingConfirmationModal';
import ViewMeetingDetailsModal from '../components/scheduling/ViewMeetingDetailsModal';
import { IEPMeeting, mockTeamMembers, AlternativeTimeProposal } from '../data/schedulingMockData';
import { calculateTeamAvailability, AvailableSlot } from '../utils/scheduleCalculator';
import { useMeetings } from '../context/MeetingsContext';

type ViewMode = 'initial' | 'availability';

const Scheduling: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isNewMeetingModalOpen, setIsNewMeetingModalOpen] = useState(false);
  const { 
    iepMeetings, 
    addMeeting, 
    updateMeeting, 
    updateMeetingRSVP, 
    editingMeetingId, 
    setEditingMeetingId, 
    setIepMeetings,
    // NEW: Alternative proposal functions
    addAlternativeProposal,
    meetingToProposeAlternativeFor,
    setMeetingToProposeAlternativeFor
  } = useMeetings();
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

  // State for confirmation modal
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [confirmedMeetingDetails, setConfirmedMeetingDetails] = useState<IEPMeeting | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // NEW: State for proposing alternative mode
  const [isProposingAlternativeFor, setIsProposingAlternativeFor] = useState<string | null>(null);
  const [currentUserId] = useState('tm1'); // Sarah Miller (Case Manager) - could be dynamic

  // State for ViewMeetingDetailsModal
  const [viewingMeeting, setViewingMeeting] = useState<IEPMeeting | null>(null);

  // FIXED: Enhanced logging for initial state from context
  console.log('[Scheduling COMPONENT_LOAD] meetingToProposeAlternativeFor from context:', meetingToProposeAlternativeFor);
  console.log('[Scheduling COMPONENT_LOAD] Current viewMode:', viewMode);
  console.log('[Scheduling COMPONENT_LOAD] Current isProposingAlternativeFor:', isProposingAlternativeFor);

  // Effect to handle edit mode when component loads
  useEffect(() => {
    if (editingMeetingId) {
      const meetingToEdit = iepMeetings.find(meeting => meeting.id === editingMeetingId);
      if (meetingToEdit) {
        // Pre-fill the modal with existing meeting details
        setCurrentMeetingProposal(meetingToEdit);
        setIsEditMode(true);
        setIsNewMeetingModalOpen(true);
      }
    }
  }, [editingMeetingId, iepMeetings]);

  // FIXED: Enhanced useEffect to handle proposing alternative mode
  useEffect(() => {
    const currentContextValue = meetingToProposeAlternativeFor;
    console.log('[Scheduling useEffect_Propose] Fired. Context meetingToProposeAlternativeFor:', currentContextValue);
    console.log('[Scheduling useEffect_Propose] Current viewMode before processing:', viewMode);
    
    if (currentContextValue) {
      console.log('[Scheduling useEffect_Propose] Processing proposal mode. Setting states...');
      
      // Set up the proposal with original meeting details
      const newProposalDetails = {
        studentId: currentContextValue.studentId,
        studentName: currentContextValue.studentName,
        meetingType: currentContextValue.meetingType,
        customMeetingType: currentContextValue.customMeetingType,
        teamMemberIds: currentContextValue.teamMemberIds,
        durationMinutes: currentContextValue.durationMinutes,
      };
      
      console.log('[Scheduling useEffect_Propose] Setting currentMeetingProposal for proposal:', newProposalDetails);
      setCurrentMeetingProposal(newProposalDetails);
      
      // Set proposing mode
      console.log('[Scheduling useEffect_Propose] Setting isProposingAlternativeFor to:', currentContextValue.id);
      setIsProposingAlternativeFor(currentContextValue.id);
      
      console.log('[Scheduling useEffect_Propose] CRITICAL: Setting viewMode to availability.');
      setViewMode('availability');
      
      // Calculate availability for the same team and duration
      if (currentContextValue.teamMemberIds && currentContextValue.durationMinutes) {
        console.log('[Scheduling useEffect_Propose] Triggering availability calculation for proposal.');
        
        const startDate = new Date();
        const endDate = addDays(startDate, 90); // Calculate 3 months ahead
        
        const availability = calculateTeamAvailability(
          currentContextValue.teamMemberIds,
          startDate,
          endDate,
          currentContextValue.durationMinutes
        );
        
        setCalculatedAvailability(availability);
        console.log('[Scheduling useEffect_Propose] Calculated Availability for alternative proposal:', availability);
        console.log('[Scheduling useEffect_Propose] ViewMode should now be availability. Current viewMode:', viewMode);
      }
      
      console.log('[Scheduling useEffect_Propose] Proposal mode setup complete.');
    } else {
      console.log('[Scheduling useEffect_Propose] meetingToProposeAlternativeFor is null/undefined, not entering proposal mode.');
    }
  }, [meetingToProposeAlternativeFor]); // Only depend on the context value

  // FIXED: Additional useEffect to log viewMode changes
  useEffect(() => {
    console.log('[Scheduling viewMode_Change] ViewMode changed to:', viewMode);
  }, [viewMode]);

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
    
    console.log('[Scheduling handleSlotClick] Slot clicked:', slot);
    console.log('[Scheduling handleSlotClick] isProposingAlternativeFor:', isProposingAlternativeFor);
    
    // NEW: Check if we're proposing an alternative time
    if (isProposingAlternativeFor) {
      console.log('[Scheduling handleSlotClick] Creating alternative proposal for meeting:', isProposingAlternativeFor);
      
      // Create alternative proposal
      const proposal: AlternativeTimeProposal = {
        proposalId: Date.now().toString(),
        proposedDate: slot.date,
        proposedTime: slot.startTime,
        proposedByMemberId: currentUserId,
        proposedAt: new Date().toISOString(),
        votes: (currentMeetingProposal.teamMemberIds || []).map(teamMemberId => ({
          teamMemberId,
          vote: teamMemberId === currentUserId ? 'AcceptAlternative' as const : 'Pending' as const,
        })),
      };
      
      console.log('[Scheduling handleSlotClick] Adding alternative proposal:', proposal);
      
      // Add the proposal to the original meeting
      addAlternativeProposal(isProposingAlternativeFor, proposal);
      
      // Create confirmation details for the proposal
      const proposalConfirmation: IEPMeeting = {
        ...currentMeetingProposal,
        id: isProposingAlternativeFor, // Use original meeting ID for reference
        date: slot.date,
        time: slot.startTime,
        durationMinutes: currentMeetingProposal.durationMinutes!,
        status: 'scheduled',
        participants: [],
      } as IEPMeeting;
      
      setConfirmedMeetingDetails(proposalConfirmation);
      setIsConfirmationModalOpen(true);
      
      // Clear expanded day states
      setExpandedDay(null);
      setExpandedDaySlots([]);
      
      return;
    }
    
    // Original meeting creation/editing logic
    const finalMeeting: IEPMeeting = {
      ...currentMeetingProposal,
      date: slot.date,
      time: slot.startTime,
      durationMinutes: currentMeetingProposal.durationMinutes!,
      status: 'scheduled',
      // Initialize participants array with all team members set to 'Pending'
      participants: (currentMeetingProposal.teamMemberIds || []).map(teamMemberId => ({
        teamMemberId,
        status: 'Pending' as const,
      })),
    } as IEPMeeting;
    
    // Check if we're editing or creating
    if (isEditMode && editingMeetingId) {
      // Update existing meeting
      updateMeeting(finalMeeting);
    } else {
      // Add new meeting
      addMeeting(finalMeeting);
    }
    
    // Set confirmation modal details and open it
    setConfirmedMeetingDetails(finalMeeting);
    setIsConfirmationModalOpen(true);
    
    // Clear expanded day states
    setExpandedDay(null);
    setExpandedDaySlots([]);
  };

  const handleConfirmationClose = () => {
    console.log('[Scheduling handleConfirmationClose] Closing confirmation and resetting states');
    
    // Reset all states and return to initial view
    setIsConfirmationModalOpen(false);
    setConfirmedMeetingDetails(null);
    setCurrentMeetingProposal(null);
    setCalculatedAvailability(null);
    setExpandedDay(null);
    setExpandedDaySlots([]);
    setViewMode('initial');
    
    // Clear edit mode states
    setIsEditMode(false);
    setEditingMeetingId(null);
    
    // NEW: Clear proposing alternative states
    setIsProposingAlternativeFor(null);
    setMeetingToProposeAlternativeFor(null);
    
    console.log('[Scheduling handleConfirmationClose] All states reset');
  };

  const handleSendInvitations = (meeting: IEPMeeting) => {
    console.log("Sending invitations for meeting:", meeting);
    
    // NEW: Different message for edit vs new vs alternative proposal
    const actionType = isProposingAlternativeFor ? "alternative" : isEditMode ? "updated" : "new";
    
    // Simulate sending emails to team members
    meeting.teamMemberIds?.forEach(memberId => {
      const teamMember = mockTeamMembers.find(member => member.id === memberId);
      if (teamMember) {
        const formattedDate = meeting.date ? new Date(meeting.date).toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }) : '';
        
        const formattedTime = meeting.time ? (() => {
          const [hour, minute] = meeting.time.split(':').map(Number);
          const period = hour >= 12 ? 'PM' : 'AM';
          const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
          return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
        })() : '';
        
        let emailSubject, emailBody;
        
        if (isProposingAlternativeFor) {
          emailSubject = `Alternative Time Proposed: IEP Meeting for ${meeting.studentName}`;
          emailBody = `A team member has proposed an alternative time for the IEP meeting for ${meeting.studentName}. Proposed time: ${formattedDate} at ${formattedTime} for ${meeting.durationMinutes} minutes. Please vote on this proposal.`;
        } else if (isEditMode) {
          emailSubject = `UPDATED: IEP Meeting for ${meeting.studentName}`;
          emailBody = `The IEP meeting for ${meeting.studentName} has been updated. New details: ${meeting.meetingType} on ${formattedDate} at ${formattedTime} for ${meeting.durationMinutes} minutes. Please confirm your availability.`;
        } else {
          emailSubject = `IEP Meeting Invitation - ${meeting.studentName}`;
          emailBody = `You are invited to an IEP meeting for ${meeting.studentName} (${meeting.meetingType}) on ${formattedDate} at ${formattedTime} for ${meeting.durationMinutes} minutes. Please RSVP.`;
        }
        
        console.log(`Simulated email to ${teamMember.name} <${teamMember.email}>: ${emailSubject} - ${emailBody}`);
      }
    });
    
    console.log(`All ${actionType} meeting invitations sent successfully!`);
  };

  const handleDayClick = (day: Date, dayCommonSlots: AvailableSlot[]) => {
    if (dayCommonSlots.length === 0) return;
    
    setExpandedDay(day);
    setExpandedDaySlots(dayCommonSlots);
  };

  const handleBackToInitial = () => {
    console.log('[Scheduling handleBackToInitial] Back button clicked');
    console.log('[Scheduling handleBackToInitial] isProposingAlternativeFor:', isProposingAlternativeFor);
    
    // NEW: Updated back button behavior for proposing alternative mode
    if (isProposingAlternativeFor) {
      console.log('[Scheduling handleBackToInitial] Back button clicked during proposal mode - clearing proposal state');
      setIsProposingAlternativeFor(null);
      setMeetingToProposeAlternativeFor(null);
      setViewMode('initial');
      setCurrentMeetingProposal(null);
      setCalculatedAvailability(null);
      setExpandedDay(null);
      setExpandedDaySlots([]);
      // Navigate back to my-meetings instead of opening modal
      window.history.back();
      return;
    }
    
    setViewMode('initial');
    setCurrentMeetingProposal(null);
    setCalculatedAvailability(null);
    setExpandedDay(null);
    setExpandedDaySlots([]);
    
    if (isEditMode) {
      setIsNewMeetingModalOpen(true);
    } else {
      setIsNewMeetingModalOpen(true);
    }
  };

  // Handle modal close - clear edit state if needed
  const handleModalClose = () => {
    setIsNewMeetingModalOpen(false);
    if (isEditMode) {
      setIsEditMode(false);
      setEditingMeetingId(null);
      setCurrentMeetingProposal(null);
    }
  };

  // Handle meeting click in upcoming events
  const handleMeetingClick = (meeting: IEPMeeting) => {
    setViewingMeeting(meeting);
  };

  // ViewMeetingDetailsModal handlers
  const handleEditFromModal = (meeting: IEPMeeting) => {
    setEditingMeetingId(meeting.id);
    // The useEffect will handle opening the edit modal
  };

  const handleCancelFromModal = (meetingId: string) => {
    setIepMeetings(prevMeetings => 
      prevMeetings.map(meeting => 
        meeting.id === meetingId 
          ? { ...meeting, status: 'cancelled' as const }
          : meeting
      )
    );
  };

  const handleAcceptFromModal = (meetingId: string) => {
    updateMeetingRSVP(meetingId, currentUserId, 'Accepted');
  };

  const handleDeclineFromModal = (meetingId: string) => {
    updateMeetingRSVP(meetingId, currentUserId, 'Declined');
  };

  const handleProposeFromModal = (meeting: IEPMeeting) => {
    updateMeetingRSVP(meeting.id, currentUserId, 'ProposedNewTime', 'Requested alternative time');
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

  // NEW: Determine the current mode for UI display
  const getCurrentMode = () => {
    if (isProposingAlternativeFor) return 'proposing';
    if (isEditMode) return 'editing';
    return 'creating';
  };

  const currentMode = getCurrentMode();

  console.log('[Scheduling RENDER] Current viewMode:', viewMode);
  console.log('[Scheduling RENDER] Current mode:', currentMode);
  console.log('[Scheduling RENDER] isProposingAlternativeFor:', isProposingAlternativeFor);

  // Initial View
  if (viewMode === 'initial') {
    console.log('[Scheduling RENDER] Rendering initial view');
    return (
      <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-medium">
            {currentMode === 'editing' ? 'Edit IEP Meeting' : 'Scheduling'}
          </h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area - Initial View */}
          <div className="lg:col-span-2">
            <div className="card text-center py-12">
              <CalendarIcon className="text-teal mx-auto mb-4" size={64} />
              <h2 className="text-2xl font-medium mb-4">
                {currentMode === 'editing' ? 'Edit IEP Meeting' : 'Schedule IEP Meetings'}
              </h2>
              <p className="text-text-secondary mb-8 max-w-md mx-auto">
                {currentMode === 'editing' 
                  ? 'Modify the meeting details below. Team members will be re-notified of any changes.'
                  : 'Select your team members, meeting duration, and we\'ll show you exactly when everyone is available for that specific time block.'
                }
              </p>
              
              <button 
                className="btn bg-accent-teal text-lg px-8 py-4"
                onClick={() => setIsNewMeetingModalOpen(true)}
              >
                <span className="flex items-center gap-2">
                  <Plus size={24} />
                  {currentMode === 'editing' ? 'Continue Editing Meeting' : 'Schedule New IEP Meeting'}
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
                    <div 
                      key={meeting.id} 
                      className="p-3 border border-border rounded-md hover:border-teal transition-all cursor-pointer"
                      onClick={() => handleMeetingClick(meeting)}
                    >
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
                      <p className="text-xs text-teal mt-1 hover:underline">
                        Click to view details
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
          onClose={handleModalClose}
          onScheduleMeeting={handleScheduleMeeting}
          initialProposal={currentMeetingProposal}
        />

        <MeetingConfirmationModal
          isOpen={isConfirmationModalOpen}
          onClose={handleConfirmationClose}
          onSendInvitations={handleSendInvitations}
          meeting={confirmedMeetingDetails}
          isEditMode={isEditMode}
          isProposingAlternative={isProposingAlternativeFor !== null}
        />

        <ViewMeetingDetailsModal
          isOpen={viewingMeeting !== null}
          onClose={() => setViewingMeeting(null)}
          meeting={viewingMeeting}
          currentUserId={currentUserId}
          onEdit={handleEditFromModal}
          onCancelMeeting={handleCancelFromModal}
          onAccept={handleAcceptFromModal}
          onDecline={handleDeclineFromModal}
          onProposeNewTime={handleProposeFromModal}
        />
      </div>
    );
  }

  // Availability View
  console.log('[Scheduling RENDER] Rendering availability view');
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
          <h1 className="text-2xl font-medium">
            {currentMode === 'proposing' && 'Propose Alternative - '}
            {currentMode === 'editing' && 'Edit Meeting - '}
            Available {currentMeetingProposal?.durationMinutes}-Minute Slots
          </h1>
        </div>
      </div>

      {/* Meeting Proposal Summary */}
      {currentMeetingProposal && (
        <div className={`card mb-6 ${
          currentMode === 'proposing' ? 'bg-blue-500 bg-opacity-5 border-blue-500' :
          currentMode === 'editing' ? 'bg-gold bg-opacity-5 border-gold' : 
          'bg-teal bg-opacity-5 border-teal'
        }`}>
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-full text-white ${
              currentMode === 'proposing' ? 'bg-blue-500' :
              currentMode === 'editing' ? 'bg-gold' : 
              'bg-teal'
            }`}>
              <Users size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-lg mb-2">
                {currentMode === 'proposing' && <span className="text-blue-500">[PROPOSING ALTERNATIVE] </span>}
                {currentMode === 'editing' && <span className="text-gold">[EDITING] </span>}
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
                  <div className={`w-4 h-4 rounded ${
                    currentMode === 'proposing' ? 'bg-blue-500' :
                    currentMode === 'editing' ? 'bg-gold' : 
                    'bg-teal'
                  }`}></div>
                  <span>
                    {currentMode === 'proposing' ? 'Blue' :
                     currentMode === 'editing' ? 'Gold' : 
                     'Teal'} slots = {currentMeetingProposal.durationMinutes}-minute blocks where all {currentMeetingProposal.teamMemberIds?.length || 0} members are available
                  </span>
                </div>
              </div>
              <p className="text-text-secondary mt-2 text-sm">
                {currentMode === 'proposing' && <span className="text-blue-500 font-medium">Proposing Alternative: </span>}
                {currentMode === 'editing' && <span className="text-gold font-medium">Editing Mode: </span>}
                Click on any day with {
                  currentMode === 'proposing' ? 'blue' :
                  currentMode === 'editing' ? 'gold' : 
                  'teal'
                } availability to see all {currentMeetingProposal.durationMinutes}-minute time slots for that day.
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
              const slotColor = currentMode === 'proposing' ? 'blue-500' :
                               currentMode === 'editing' ? 'gold' : 
                               'teal';
              
              return (
                <div 
                  key={day.toString()} 
                  className={`h-32 p-1 border border-border rounded-md overflow-hidden transition-all ${
                    isPastDate || isWeekend
                      ? 'bg-bg-secondary bg-opacity-50' 
                      : hasCommonSlots
                        ? `hover:border-${slotColor} cursor-pointer hover:bg-${slotColor} hover:bg-opacity-5` 
                        : ''
                  } ${
                    isToday(day) ? `bg-${slotColor} bg-opacity-10 border-${slotColor}` : ''
                  }`}
                  onClick={() => !isPastDate && !isWeekend && hasCommonSlots && handleDayClick(day, dayCommonSlots)}
                >
                  <div className={`text-sm font-medium mb-1 ${isPastDate ? 'text-text-secondary' : hasCommonSlots ? `text-${slotColor} font-bold` : ''}`}>
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
                        <div className={`text-xs text-${slotColor} font-bold bg-${slotColor} bg-opacity-10 rounded px-1 py-0.5`}>
                          {dayCommonSlots.length} slot{dayCommonSlots.length !== 1 ? 's' : ''}
                        </div>
                        <div className={`text-[10px] text-${slotColor} mt-1`}>
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
            <Clock className={
              currentMode === 'proposing' ? 'text-blue-500' :
              currentMode === 'editing' ? 'text-gold' : 
              'text-teal'
            } size={20} />
            <h2 className="text-xl font-medium">{currentMeetingProposal?.durationMinutes}-Min Availability</h2>
          </div>
          
          <div className="space-y-4 text-sm">
            {/* Mode Indicator */}
            {currentMode !== 'creating' && (
              <div className={`p-3 bg-opacity-10 border rounded-md ${
                currentMode === 'proposing' ? 'bg-blue-500 border-blue-500' :
                'bg-gold border-gold'
              }`}>
                <h3 className={`font-medium mb-1 ${
                  currentMode === 'proposing' ? 'text-blue-500' : 'text-gold'
                }`}>
                  {currentMode === 'proposing' ? 'Proposing Alternative Time' : 'Edit Mode Active'}
                </h3>
                <p className="text-xs text-text-secondary">
                  {currentMode === 'proposing' 
                    ? 'You\'re proposing an alternative time for an existing meeting. Team members will vote on your proposal.'
                    : 'You\'re editing an existing meeting. Selecting a new time will update the meeting and reset all participant RSVPs.'
                  }
                </p>
              </div>
            )}
            
            {/* Statistics */}
            {calculatedAvailability && (
              <div className="p-3 bg-bg-secondary rounded-md">
                <h3 className="font-medium mb-2">This Month</h3>
                <div className="space-y-2 text-text-secondary">
                  <div className="flex justify-between">
                    <span>{currentMeetingProposal?.durationMinutes}-min slots found:</span>
                    <span className={`font-medium ${
                      currentMode === 'proposing' ? 'text-blue-500' :
                      currentMode === 'editing' ? 'text-gold' : 
                      'text-teal'
                    }`}>{monthCommonSlots.length}</span>
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
              <h3 className="font-medium mb-2">How to {
                currentMode === 'proposing' ? 'Propose' :
                currentMode === 'editing' ? 'Update' : 
                'Schedule'
              }</h3>
              <ol className="space-y-2 text-text-secondary">
                <li>1. <span className={`font-medium ${
                  currentMode === 'proposing' ? 'text-blue-500' :
                  currentMode === 'editing' ? 'text-gold' : 
                  'text-teal'
                }`}>Click any day</span> with {
                  currentMode === 'proposing' ? 'blue' :
                  currentMode === 'editing' ? 'gold' : 
                  'teal'
                } availability</li>
                <li>2. <span className={`font-medium ${
                  currentMode === 'proposing' ? 'text-blue-500' :
                  currentMode === 'editing' ? 'text-gold' : 
                  'text-teal'
                }`}>Select a {currentMeetingProposal?.durationMinutes}-minute slot</span> from the list</li>
                <li>3. {
                  currentMode === 'proposing' ? 'Alternative time is proposed!' :
                  currentMode === 'editing' ? 'Meeting is updated' : 
                  'Meeting is scheduled'
                } immediately!</li>
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
                        className={`w-full text-left text-xs p-2 border rounded hover:bg-opacity-10 transition-colors ${
                          currentMode === 'proposing' ? 'border-blue-500 hover:bg-blue-500' :
                          currentMode === 'editing' ? 'border-gold hover:bg-gold' : 
                          'border-teal hover:bg-teal'
                        }`}
                      >
                        <div className="font-medium">{format(new Date(slot.date), 'MMM d')}</div>
                        <div className="text-text-secondary">
                          {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                        </div>
                        <div className={`text-[10px] ${
                          currentMode === 'proposing' ? 'text-blue-500' :
                          currentMode === 'editing' ? 'text-gold' : 
                          'text-teal'
                        }`}>
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
                  className={`mt-3 text-xs hover:underline ${
                    currentMode === 'proposing' ? 'text-blue-500' :
                    currentMode === 'editing' ? 'text-gold' : 
                    'text-teal'
                  }`}
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
        onClose={handleModalClose}
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

      <MeetingConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={handleConfirmationClose}
        onSendInvitations={handleSendInvitations}
        meeting={confirmedMeetingDetails}
        isEditMode={isEditMode}
        isProposingAlternative={isProposingAlternativeFor !== null}
      />

      <ViewMeetingDetailsModal
        isOpen={viewingMeeting !== null}
        onClose={() => setViewingMeeting(null)}
        meeting={viewingMeeting}
        currentUserId={currentUserId}
        onEdit={handleEditFromModal}
        onCancelMeeting={handleCancelFromModal}
        onAccept={handleAcceptFromModal}
        onDecline={handleDeclineFromModal}
        onProposeNewTime={handleProposeFromModal}
      />
    </div>
  );
};

export default Scheduling;