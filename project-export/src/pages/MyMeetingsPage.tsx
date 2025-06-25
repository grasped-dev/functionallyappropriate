import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, User, Check, X, MessageSquare, AlertCircle, CheckCircle, XCircle, Clock as ClockIcon, Edit, Trash2, Crown } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useMeetings } from '../context/MeetingsContext';
import { mockTeamMembers, MeetingParticipantRSVP } from '../data/schedulingMockData';
import ViewMeetingDetailsModal from '../components/scheduling/ViewMeetingDetailsModal';

const MyMeetingsPage: React.FC = () => {
  // Simulate current user - can be changed to test different perspectives
  const currentUserId = 'tm1'; // Sarah Miller (Case Manager) - change to 'tm2', 'tm3', etc. to test different users
  const currentUser = mockTeamMembers.find(member => member.id === currentUserId);
  
  const navigate = useNavigate();
  const { 
    iepMeetings, 
    updateMeetingRSVP, 
    setIepMeetings, 
    setEditingMeetingId,
    setMeetingToProposeAlternativeFor // NEW: For proposing alternatives
  } = useMeetings();
  const [declineNote, setDeclineNote] = useState('');
  const [showDeclineModal, setShowDeclineModal] = useState<string | null>(null);
  
  // State for ViewMeetingDetailsModal
  const [viewingMeeting, setViewingMeeting] = useState<any | null>(null);

  // Filter meetings where current user is a participant (either organizer or invitee)
  const myMeetings = iepMeetings.filter(meeting => 
    meeting.teamMemberIds.includes(currentUserId) && 
    meeting.status === 'scheduled'
  );

  const formatTime = (timeString: string): string => {
    const [hour, minute] = timeString.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getCurrentRSVPStatus = (meeting: any): MeetingParticipantRSVP | undefined => {
    return meeting.participants?.find((p: MeetingParticipantRSVP) => p.teamMemberId === currentUserId);
  };

  const getStatusIcon = (status: MeetingParticipantRSVP['status']) => {
    switch (status) {
      case 'Accepted':
        return <CheckCircle className="text-green" size={20} />;
      case 'Declined':
        return <XCircle className="text-red-500" size={20} />;
      case 'ProposedNewTime':
        return <ClockIcon className="text-gold" size={20} />;
      case 'VotedOnAlternative':
        return <CheckCircle className="text-blue-500" size={20} />;
      default:
        return <AlertCircle className="text-text-secondary" size={20} />;
    }
  };

  const getStatusColor = (status: MeetingParticipantRSVP['status']) => {
    switch (status) {
      case 'Accepted':
        return 'text-green bg-green bg-opacity-10 border-green';
      case 'Declined':
        return 'text-red-500 bg-red-500 bg-opacity-10 border-red-500';
      case 'ProposedNewTime':
        return 'text-gold bg-gold bg-opacity-10 border-gold';
      case 'VotedOnAlternative':
        return 'text-blue-500 bg-blue-500 bg-opacity-10 border-blue-500';
      default:
        return 'text-text-secondary bg-bg-secondary border-border';
    }
  };

  const handleAccept = (meetingId: string) => {
    updateMeetingRSVP(meetingId, currentUserId, 'Accepted');
  };

  const handleDecline = (meetingId: string) => {
    setShowDeclineModal(meetingId);
  };

  const confirmDecline = (meetingId: string) => {
    updateMeetingRSVP(meetingId, currentUserId, 'Declined', declineNote);
    setShowDeclineModal(null);
    setDeclineNote('');
  };

  // FIXED: Handle propose new time - navigate to Scheduling page
  const handleProposeNewTime = (meeting: any) => {
    console.log('[MyMeetingsPage] User clicked Propose New Time for:', meeting);
    
    // Update RSVP status to indicate they're proposing a new time
    updateMeetingRSVP(meeting.id, currentUserId, 'ProposedNewTime', 'User is selecting an alternative time...');
    
    // CRITICAL: Set the meeting context for proposing alternative FIRST
    console.log('[MyMeetingsPage] Setting meetingToProposeAlternativeFor context state to:', meeting);
    setMeetingToProposeAlternativeFor(meeting);
    
    // Small delay to ensure context state is set before navigation
    setTimeout(() => {
      console.log('[MyMeetingsPage] Navigating to /scheduling for proposal mode');
      navigate('/scheduling');
    }, 50);
  };

  // Handle Edit Meeting - Navigate to Scheduling page with meeting details
  const handleEditMeeting = (meeting: any) => {
    // Set the meeting ID being edited in context
    setEditingMeetingId(meeting.id);
    
    // Navigate to scheduling page - the Scheduling component will detect edit mode
    navigate('/scheduling');
  };

  const handleCancelMeeting = (meetingId: string) => {
    if (confirm('Are you sure you want to cancel this meeting? This action cannot be undone.')) {
      setIepMeetings(prevMeetings => 
        prevMeetings.map(meeting => 
          meeting.id === meetingId 
            ? { ...meeting, status: 'cancelled' as const }
            : meeting
        )
      );
    }
  };

  // Handle meeting card click to open details modal
  const handleMeetingClick = (meeting: any) => {
    setViewingMeeting(meeting);
  };

  // ViewMeetingDetailsModal handlers
  const handleEditFromModal = (meeting: any) => {
    setEditingMeetingId(meeting.id);
    navigate('/scheduling');
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

  // FIXED: Handle propose from modal
  const handleProposeFromModal = (meeting: any) => {
    console.log('[MyMeetingsPage] User clicked Propose New Time from modal for:', meeting);
    
    // Update RSVP status to indicate they're proposing a new time
    updateMeetingRSVP(meeting.id, currentUserId, 'ProposedNewTime', 'User is selecting an alternative time...');
    
    // CRITICAL: Set the meeting context for proposing alternative FIRST
    console.log('[MyMeetingsPage] Setting meetingToProposeAlternativeFor context state from modal to:', meeting);
    setMeetingToProposeAlternativeFor(meeting);
    
    // Small delay to ensure context state is set before navigation
    setTimeout(() => {
      console.log('[MyMeetingsPage] Navigating to /scheduling from modal for proposal mode');
      navigate('/scheduling');
    }, 50);
  };

  const getOtherParticipants = (meeting: any) => {
    return meeting.teamMemberIds
      .filter((id: string) => id !== currentUserId)
      .map((id: string) => mockTeamMembers.find(member => member.id === id))
      .filter(Boolean);
  };

  const getResponseSummary = (meeting: any) => {
    const participants = meeting.participants || [];
    const accepted = participants.filter((p: MeetingParticipantRSVP) => p.status === 'Accepted').length;
    const declined = participants.filter((p: MeetingParticipantRSVP) => p.status === 'Declined').length;
    const pending = participants.filter((p: MeetingParticipantRSVP) => p.status === 'Pending').length;
    const proposed = participants.filter((p: MeetingParticipantRSVP) => p.status === 'ProposedNewTime').length;
    const voted = participants.filter((p: MeetingParticipantRSVP) => p.status === 'VotedOnAlternative').length;
    const total = participants.length;
    
    return { accepted, declined, pending, proposed, voted, total };
  };

  const isOrganizer = (meeting: any): boolean => {
    return meeting.createdByUserId === currentUserId;
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-medium">My Meetings</h1>
          <p className="text-text-secondary mt-1">
            Viewing as: <span className="font-medium text-teal">{currentUser?.name}</span> ({currentUser?.role})
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <CalendarIcon className="text-teal" size={20} />
          <span className="font-medium">{myMeetings.length} meeting{myMeetings.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {myMeetings.length > 0 ? (
        <div className="space-y-6">
          {myMeetings.map(meeting => {
            const rsvpStatus = getCurrentRSVPStatus(meeting);
            const otherParticipants = getOtherParticipants(meeting);
            const responseSummary = getResponseSummary(meeting);
            const userIsOrganizer = isOrganizer(meeting);
            const hasAlternativeProposals = meeting.alternativeProposals && meeting.alternativeProposals.length > 0;
            
            return (
              <div 
                key={meeting.id} 
                className={`card border-l-4 ${userIsOrganizer ? 'border-l-gold' : 'border-l-teal'} cursor-pointer hover:shadow-lg transition-all`}
                onClick={() => handleMeetingClick(meeting)}
              >
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                  {/* Meeting Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-medium">
                            {meeting.meetingType} - {meeting.studentName}
                          </h3>
                          {userIsOrganizer && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-gold bg-opacity-10 border border-gold rounded-full text-xs font-medium text-gold">
                              <Crown size={12} />
                              Organizer
                            </div>
                          )}
                          {hasAlternativeProposals && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-blue-500 bg-opacity-10 border border-blue-500 rounded-full text-xs font-medium text-blue-500">
                              <ClockIcon size={12} />
                              {meeting.alternativeProposals.length} Alternative{meeting.alternativeProposals.length !== 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                        {meeting.customMeetingType && (
                          <p className="text-sm text-text-secondary mb-2">
                            Custom Type: {meeting.customMeetingType}
                          </p>
                        )}
                      </div>
                      
                      {!userIsOrganizer && (
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(rsvpStatus?.status || 'Pending')}`}>
                          {getStatusIcon(rsvpStatus?.status || 'Pending')}
                          {rsvpStatus?.status === 'VotedOnAlternative' ? 'Voted' : rsvpStatus?.status || 'Pending'}
                        </div>
                      )}
                    </div>

                    {/* Meeting Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="text-teal" size={16} />
                        <div>
                          <div className="font-medium">{meeting.date && formatDate(meeting.date)}</div>
                          <div className="text-sm text-text-secondary">Meeting Date</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="text-teal" size={16} />
                        <div>
                          <div className="font-medium">
                            {meeting.time && formatTime(meeting.time)} ({meeting.durationMinutes} min)
                          </div>
                          <div className="text-sm text-text-secondary">Time & Duration</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <User className="text-teal" size={16} />
                        <div>
                          <div className="font-medium">{meeting.teamMemberIds.length} participants</div>
                          <div className="text-sm text-text-secondary">Team Size</div>
                        </div>
                      </div>
                    </div>

                    {/* Response Summary - Always Prominent */}
                    <div className="mb-4 p-4 bg-bg-secondary rounded-md">
                      <h4 className="font-medium mb-3">
                        {userIsOrganizer ? 'Team Response Summary:' : 'Response Summary:'}
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="text-green" size={16} />
                          <span className="font-medium">{responseSummary.accepted}</span>
                          <span className="text-text-secondary">Accepted</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <XCircle className="text-red-500" size={16} />
                          <span className="font-medium">{responseSummary.declined}</span>
                          <span className="text-text-secondary">Declined</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertCircle className="text-text-secondary" size={16} />
                          <span className="font-medium">{responseSummary.pending}</span>
                          <span className="text-text-secondary">Pending</span>
                        </div>
                        {responseSummary.proposed > 0 && (
                          <div className="flex items-center gap-2">
                            <ClockIcon className="text-gold" size={16} />
                            <span className="font-medium">{responseSummary.proposed}</span>
                            <span className="text-text-secondary">Proposed</span>
                          </div>
                        )}
                        {responseSummary.voted > 0 && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="text-blue-500" size={16} />
                            <span className="font-medium">{responseSummary.voted}</span>
                            <span className="text-text-secondary">Voted</span>
                          </div>
                        )}
                      </div>
                      
                      {userIsOrganizer && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <div className="text-xs text-text-secondary">
                            Response Rate: {Math.round(((responseSummary.accepted + responseSummary.declined + responseSummary.proposed + responseSummary.voted) / responseSummary.total) * 100)}%
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Alternative Proposals Summary */}
                    {hasAlternativeProposals && (
                      <div className="mb-4 p-3 bg-blue-500 bg-opacity-10 border border-blue-500 rounded-md">
                        <h4 className="font-medium text-blue-500 mb-2">Alternative Times Proposed</h4>
                        <div className="text-sm text-text-secondary">
                          {meeting.alternativeProposals.length} alternative time{meeting.alternativeProposals.length !== 1 ? 's' : ''} proposed by team members. 
                          <span className="text-blue-500 font-medium"> Click to view details and vote.</span>
                        </div>
                      </div>
                    )}

                    {/* Click to view details hint */}
                    <div className="text-sm text-teal hover:underline">
                      Click to view full details and take actions →
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card text-center py-12">
          <CalendarIcon size={64} className="mx-auto mb-4 text-text-secondary opacity-30" />
          <h2 className="text-xl font-medium mb-2">No Meetings</h2>
          <p className="text-text-secondary">
            You don't have any scheduled meetings at this time.
          </p>
        </div>
      )}

      {/* Decline Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowDeclineModal(null)} />
          
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-bg-primary rounded-lg shadow-lg">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <MessageSquare className="text-red-500" size={20} />
                  <h3 className="text-lg font-medium">Decline Meeting</h3>
                </div>
                <button
                  onClick={() => setShowDeclineModal(null)}
                  className="p-1 hover:bg-bg-secondary rounded-full transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-4">
                <p className="text-text-secondary mb-4">
                  Please provide a reason for declining this meeting invitation (optional):
                </p>
                
                <textarea
                  value={declineNote}
                  onChange={(e) => setDeclineNote(e.target.value)}
                  className="w-full p-3 border border-border rounded-md bg-bg-primary focus:outline-none focus:ring-2 focus:ring-red-500 h-24 resize-none"
                  placeholder="e.g., Schedule conflict, prior commitment, etc."
                />

                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={() => setShowDeclineModal(null)}
                    className="btn border border-border hover:bg-bg-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => confirmDecline(showDeclineModal)}
                    className="btn bg-red-500 text-white hover:bg-opacity-90"
                  >
                    Decline Meeting
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ViewMeetingDetailsModal */}
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

export default MyMeetingsPage;