import React, { useState } from 'react';
import { Bell, Calendar, Clock, User, Users, AlertCircle, CheckCircle, XCircle, MessageSquare, Crown, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useMeetings } from '../context/MeetingsContext';
import { mockTeamMembers, IEPMeeting, AlternativeTimeProposal } from '../data/schedulingMockData';
import ViewMeetingDetailsModal from '../components/scheduling/ViewMeetingDetailsModal';

interface NotificationItem {
  id: string;
  type: 'new_invitation' | 'meeting_updated' | 'alternative_proposed' | 'rsvp_response';
  meeting: IEPMeeting;
  timestamp: string;
  title: string;
  description: string;
  actionText: string;
  priority: 'high' | 'medium' | 'low';
  proposal?: AlternativeTimeProposal;
  responder?: string;
}

const InboxPage: React.FC = () => {
  // Simulate current user - can be changed to test different perspectives
  const currentUserId = 'tm2'; // David Chen (Teacher) - change to 'tm1', 'tm3', etc. to test different users
  const currentUser = mockTeamMembers.find(member => member.id === currentUserId);
  
  const navigate = useNavigate();
  const { 
    iepMeetings, 
    updateMeetingRSVP, 
    setIepMeetings,
    voteOnAlternative,
    setEditingMeetingId,
    setMeetingToProposeAlternativeFor
  } = useMeetings();
  
  // State for ViewMeetingDetailsModal
  const [viewingMeeting, setViewingMeeting] = useState<IEPMeeting | null>(null);

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

  const getTeamMemberName = (memberId: string): string => {
    const member = mockTeamMembers.find(m => m.id === memberId);
    return member ? member.name : 'Unknown Member';
  };

  // Generate notifications based on current user's involvement
  const generateNotifications = (): NotificationItem[] => {
    const notifications: NotificationItem[] = [];

    // Filter meetings where current user is a participant
    const userMeetings = iepMeetings.filter(meeting => 
      meeting.teamMemberIds.includes(currentUserId) && 
      meeting.status === 'scheduled'
    );

    userMeetings.forEach(meeting => {
      const userRSVP = meeting.participants?.find(p => p.teamMemberId === currentUserId);
      const isOrganizer = meeting.createdByUserId === currentUserId;

      // A. New Meeting Invitations
      if (userRSVP?.status === 'Pending' && !isOrganizer) {
        notifications.push({
          id: `invitation-${meeting.id}`,
          type: 'new_invitation',
          meeting,
          timestamp: new Date().toISOString(), // Use current time as timestamp
          title: `New Meeting Invitation`,
          description: `${meeting.meetingType} for ${meeting.studentName} on ${meeting.date ? formatDate(meeting.date) : 'TBD'} at ${meeting.time ? formatTime(meeting.time) : 'TBD'}`,
          actionText: 'View & RSVP',
          priority: 'high'
        });
      }

      // B. Meeting Updates (when RSVP was reset to Pending after edit)
      if (userRSVP?.status === 'Pending' && !isOrganizer && meeting.participants?.some(p => p.respondedAt)) {
        // This is a heuristic - if some participants have responded but current user is pending,
        // it might indicate the meeting was updated and RSVPs were reset
        const hasOtherResponses = meeting.participants.some(p => 
          p.teamMemberId !== currentUserId && p.status !== 'Pending'
        );
        
        if (hasOtherResponses) {
          notifications.push({
            id: `updated-${meeting.id}`,
            type: 'meeting_updated',
            meeting,
            timestamp: new Date().toISOString(), // Use current time as timestamp
            title: `Meeting Updated`,
            description: `${meeting.meetingType} for ${meeting.studentName} has been updated. New details: ${meeting.date ? formatDate(meeting.date) : 'TBD'} at ${meeting.time ? formatTime(meeting.time) : 'TBD'}. Please re-confirm your attendance.`,
            actionText: 'Review Changes',
            priority: 'high'
          });
        }
      }

      // C. Alternative Time Proposals
      if (meeting.alternativeProposals && meeting.alternativeProposals.length > 0) {
        meeting.alternativeProposals.forEach(proposal => {
          const userVote = proposal.votes.find(v => v.teamMemberId === currentUserId);
          
          if (userVote?.vote === 'Pending') {
            const proposerName = getTeamMemberName(proposal.proposedByMemberId);
            
            notifications.push({
              id: `alternative-${meeting.id}-${proposal.proposalId}`,
              type: 'alternative_proposed',
              meeting,
              proposal,
              timestamp: proposal.proposedAt,
              title: `Alternative Time Proposed`,
              description: `${proposerName} proposed a new time for ${meeting.meetingType} - ${meeting.studentName}. Proposed: ${formatDate(proposal.proposedDate)} at ${formatTime(proposal.proposedTime)}`,
              actionText: 'Vote on Proposal',
              priority: 'medium'
            });
          }
        });
      }

      // D. RSVP Responses for Organizer (Optional)
      if (isOrganizer && meeting.participants) {
        meeting.participants.forEach(participant => {
          if (participant.teamMemberId !== currentUserId && 
              participant.status !== 'Pending' && 
              participant.respondedAt) {
            
            const responderName = getTeamMemberName(participant.teamMemberId);
            const statusText = participant.status === 'Accepted' ? 'accepted' : 
                             participant.status === 'Declined' ? 'declined' : 
                             'responded to';
            
            notifications.push({
              id: `rsvp-${meeting.id}-${participant.teamMemberId}`,
              type: 'rsvp_response',
              meeting,
              responder: participant.teamMemberId,
              timestamp: participant.respondedAt,
              title: `RSVP Response Received`,
              description: `${responderName} has ${statusText} the meeting for ${meeting.studentName}`,
              actionText: 'View Details',
              priority: 'low'
            });
          }
        });
      }
    });

    // Sort by timestamp (newest first)
    return notifications.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return timeB - timeA;
    });
  };

  const notifications = generateNotifications();

  const handleNotificationClick = (notification: NotificationItem) => {
    setViewingMeeting(notification.meeting);
  };

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'new_invitation':
        return <Calendar className="text-blue-500" size={20} />;
      case 'meeting_updated':
        return <AlertCircle className="text-gold" size={20} />;
      case 'alternative_proposed':
        return <Clock className="text-purple" size={20} />;
      case 'rsvp_response':
        return <CheckCircle className="text-green" size={20} />;
      default:
        return <Bell className="text-text-secondary" size={20} />;
    }
  };

  const getPriorityColor = (priority: NotificationItem['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-500 bg-opacity-5';
      case 'medium':
        return 'border-l-gold bg-gold bg-opacity-5';
      case 'low':
        return 'border-l-green bg-green bg-opacity-5';
      default:
        return 'border-l-border';
    }
  };

  const getNotificationStats = () => {
    const stats = {
      total: notifications.length,
      high: notifications.filter(n => n.priority === 'high').length,
      medium: notifications.filter(n => n.priority === 'medium').length,
      low: notifications.filter(n => n.priority === 'low').length,
      invitations: notifications.filter(n => n.type === 'new_invitation').length,
      updates: notifications.filter(n => n.type === 'meeting_updated').length,
      proposals: notifications.filter(n => n.type === 'alternative_proposed').length,
      responses: notifications.filter(n => n.type === 'rsvp_response').length,
    };
    return stats;
  };

  // Handle propose new time
  const handleProposeNewTime = (meeting: IEPMeeting) => {
    console.log('[InboxPage] User clicked Propose New Time for:', meeting);
    
    // Update RSVP status to indicate they're proposing a new time
    updateMeetingRSVP(meeting.id, currentUserId, 'ProposedNewTime', 'User is selecting an alternative time...');
    
    // Set the meeting context for proposing alternative
    setMeetingToProposeAlternativeFor(meeting);
    
    // Navigate to scheduling page
    navigate('/scheduling');
  };

  const handleEditFromModal = (meeting: IEPMeeting) => {
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

  const handleProposeFromModal = (meeting: IEPMeeting) => {
    console.log('[InboxPage] User clicked Propose New Time from modal for:', meeting);
    
    // Update RSVP status to indicate they're proposing a new time
    updateMeetingRSVP(meeting.id, currentUserId, 'ProposedNewTime', 'User is selecting an alternative time...');
    
    // Set the meeting context for proposing alternative
    setMeetingToProposeAlternativeFor(meeting);
    
    // Navigate to scheduling page
    setTimeout(() => {
      navigate('/scheduling');
    }, 50);
  };

  const stats = getNotificationStats();

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-medium">My Inbox</h1>
          <p className="text-text-secondary mt-1">
            Viewing as: <span className="font-medium text-orange-500">{currentUser?.name}</span> ({currentUser?.role})
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Bell className="text-orange-500" size={20} />
          <span className="font-medium">{stats.total} notification{stats.total !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card bg-blue-500 bg-opacity-10 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">New Invitations</p>
              <p className="text-2xl font-medium text-blue-500">{stats.invitations}</p>
            </div>
            <Calendar className="text-blue-500" size={24} />
          </div>
        </div>

        <div className="card bg-gold bg-opacity-10 border-gold">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Meeting Updates</p>
              <p className="text-2xl font-medium text-gold">{stats.updates}</p>
            </div>
            <AlertCircle className="text-gold" size={24} />
          </div>
        </div>

        <div className="card bg-purple bg-opacity-10 border-purple">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Time Proposals</p>
              <p className="text-2xl font-medium text-purple">{stats.proposals}</p>
            </div>
            <Clock className="text-purple" size={24} />
          </div>
        </div>

        <div className="card bg-green bg-opacity-10 border-green">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">RSVP Updates</p>
              <p className="text-2xl font-medium text-green">{stats.responses}</p>
            </div>
            <Users className="text-green" size={24} />
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="card">
        <div className="flex items-center gap-2 mb-6">
          <Bell className="text-orange-500" size={24} />
          <h2 className="text-xl font-medium">Recent Notifications</h2>
          {stats.high > 0 && (
            <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
              {stats.high} urgent
            </span>
          )}
        </div>

        {notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`border-l-4 p-4 rounded-r-md cursor-pointer hover:shadow-md transition-all ${getPriorityColor(notification.priority)}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-lg">{notification.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-text-secondary">
                        {notification.priority === 'high' && (
                          <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                            Urgent
                          </span>
                        )}
                        <span>
                          {format(new Date(notification.timestamp), 'MMM d, h:mm a')}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-text-secondary mb-3 leading-relaxed">
                      {notification.description}
                    </p>

                    {/* Meeting Details Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3 p-3 bg-bg-secondary rounded-md">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="text-text-secondary" size={14} />
                        <span className="font-medium">Student:</span>
                        <span>{notification.meeting.studentName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="text-text-secondary" size={14} />
                        <span className="font-medium">Type:</span>
                        <span>{notification.meeting.meetingType}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="text-text-secondary" size={14} />
                        <span className="font-medium">Duration:</span>
                        <span>{notification.meeting.durationMinutes} min</span>
                      </div>
                    </div>

                    {/* Special content for different notification types */}
                    {notification.type === 'alternative_proposed' && notification.proposal && (
                      <div className="mb-3 p-3 bg-purple bg-opacity-10 border border-purple rounded-md">
                        <h4 className="font-medium text-purple mb-2">Proposed Alternative:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-medium">Original:</span> {notification.meeting.date ? formatDate(notification.meeting.date) : 'TBD'} at {notification.meeting.time ? formatTime(notification.meeting.time) : 'TBD'}
                          </div>
                          <div>
                            <span className="font-medium">Proposed:</span> {formatDate(notification.proposal.proposedDate)} at {formatTime(notification.proposal.proposedTime)}
                          </div>
                        </div>
                      </div>
                    )}

                    {notification.type === 'rsvp_response' && notification.responder && (
                      <div className="mb-3 p-3 bg-green bg-opacity-10 border border-green rounded-md">
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="text-green" size={16} />
                          <span className="font-medium">Response from:</span>
                          <span>{getTeamMemberName(notification.responder)}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-text-secondary">
                        {notification.meeting.createdByUserId === currentUserId && (
                          <div className="flex items-center gap-1">
                            <Crown size={12} />
                            <span>You organized this meeting</span>
                          </div>
                        )}
                      </div>
                      
                      <button className="flex items-center gap-2 text-orange-500 hover:text-orange-600 font-medium text-sm hover:underline">
                        {notification.actionText}
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Bell size={64} className="mx-auto mb-4 text-text-secondary opacity-30" />
            <h3 className="text-xl font-medium mb-2">Your inbox is empty</h3>
            <p className="text-text-secondary">
              You don't have any new notifications at this time.
            </p>
          </div>
        )}
      </div>

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
        onVoteOnProposal={voteOnAlternative}
      />
    </div>
  );
};

export default InboxPage;