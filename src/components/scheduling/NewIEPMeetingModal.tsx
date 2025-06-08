import React, { useState, useEffect } from 'react';
import { X, Users, Calendar, Clock } from 'lucide-react';
import { TeamMember, MeetingType, IEPMeeting, mockTeamMembers, meetingTypes, StudentProfile, mockStudents } from '../../data/schedulingMockData';

interface NewIEPMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduleMeeting: (meetingDetails: Partial<IEPMeeting>) => void;
  initialProposal?: Partial<IEPMeeting> | null;
}

const NewIEPMeetingModal: React.FC<NewIEPMeetingModalProps> = ({
  isOpen,
  onClose,
  onScheduleMeeting,
  initialProposal,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [meetingType, setMeetingType] = useState<MeetingType | ''>('');
  const [customType, setCustomType] = useState('');
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);
  const [desiredDurationMinutes, setDesiredDurationMinutes] = useState<number>(60);

  const durationOptions = [
    { value: 30, label: '30 minutes', description: 'Quick check-in or brief discussion' },
    { value: 45, label: '45 minutes', description: 'Standard progress review' },
    { value: 60, label: '60 minutes', description: 'Full IEP meeting (recommended)' },
    { value: 90, label: '90 minutes', description: 'Comprehensive review or initial evaluation' },
    { value: 120, label: '120 minutes', description: 'Extended meeting for complex cases' },
  ];

  // Initialize form state from initialProposal when modal opens or proposal changes
  useEffect(() => {
    if (isOpen && initialProposal) {
      setSelectedStudentId(initialProposal.studentId || '');
      setMeetingType(initialProposal.meetingType || '');
      setCustomType(initialProposal.customMeetingType || '');
      setSelectedTeamMembers(initialProposal.teamMemberIds || []);
      setDesiredDurationMinutes(initialProposal.durationMinutes || 60);
    } else if (isOpen && !initialProposal) {
      // Reset to empty state if no proposal exists
      setSelectedStudentId('');
      setMeetingType('');
      setCustomType('');
      setSelectedTeamMembers([]);
      setDesiredDurationMinutes(60);
    }
  }, [isOpen, initialProposal]);

  const handleTeamMemberToggle = (memberId: string) => {
    setSelectedTeamMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const student = mockStudents.find(s => s.id === selectedStudentId);
    const studentNameForMeeting = student ? student.name : 'Unknown Student';
    
    const meetingDetails: Partial<IEPMeeting> = {
      id: Date.now().toString(),
      eventType: 'iep_meeting',
      studentId: selectedStudentId,
      studentName: studentNameForMeeting,
      meetingType: meetingType as MeetingType,
      customMeetingType: meetingType === 'Other' ? customType : undefined,
      teamMemberIds: selectedTeamMembers,
      durationMinutes: desiredDurationMinutes,
      status: 'pending_scheduling',
      createdByUserId: 'currentUserPlaceholderId',
    };

    onScheduleMeeting(meetingDetails);
    onClose();
  };

  const handleClose = () => {
    // Only reset form when closing if there's no active proposal to preserve
    if (!initialProposal) {
      setSelectedStudentId('');
      setMeetingType('');
      setCustomType('');
      setSelectedTeamMembers([]);
      setDesiredDurationMinutes(60);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleClose} />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-bg-primary rounded-lg shadow-lg">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Calendar className="text-teal" size={24} />
              <h2 className="text-xl font-medium">Schedule New IEP Meeting</h2>
            </div>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-bg-secondary rounded-full transition-colors"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              <div>
                <label htmlFor="selectedStudent" className="block text-sm font-medium mb-1">
                  Select Student
                </label>
                <select
                  id="selectedStudent"
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full p-2 border border-border rounded-md bg-bg-primary focus:outline-none focus:ring-2 focus:ring-teal"
                  required
                >
                  <option value="">Select Student</option>
                  {mockStudents.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="meetingType" className="block text-sm font-medium mb-1">
                  Meeting Type
                </label>
                <select
                  id="meetingType"
                  value={meetingType}
                  onChange={(e) => setMeetingType(e.target.value as MeetingType)}
                  className="w-full p-2 border border-border rounded-md bg-bg-primary focus:outline-none focus:ring-2 focus:ring-teal"
                  required
                >
                  <option value="">Select Meeting Type</option>
                  {meetingTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {meetingType === 'Other' && (
                <div>
                  <label htmlFor="customType" className="block text-sm font-medium mb-1">
                    Specify Meeting Type
                  </label>
                  <input
                    type="text"
                    id="customType"
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value)}
                    className="w-full p-2 border border-border rounded-md bg-bg-primary focus:outline-none focus:ring-2 focus:ring-teal"
                    required
                  />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="text-teal" size={20} />
                  <label className="text-sm font-medium">Desired Meeting Duration</label>
                </div>
                <div className="space-y-2">
                  {durationOptions.map(option => (
                    <label
                      key={option.value}
                      className="flex items-center gap-3 p-3 border border-border rounded-md hover:border-teal transition-colors cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="duration"
                        value={option.value}
                        checked={desiredDurationMinutes === option.value}
                        onChange={(e) => setDesiredDurationMinutes(Number(e.target.value))}
                        className="text-teal focus:ring-teal"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-text-secondary">
                          {option.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="text-teal" size={20} />
                  <h3 className="font-medium">Select Team Members</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {mockTeamMembers.map(member => (
                    <label
                      key={member.id}
                      className="flex items-start gap-3 p-3 border border-border rounded-md hover:border-teal transition-colors cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTeamMembers.includes(member.id)}
                        onChange={() => handleTeamMemberToggle(member.id)}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-text-secondary">{member.role}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-border rounded-md hover:bg-bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-teal text-white rounded-md hover:bg-opacity-90 transition-colors"
                disabled={!selectedStudentId || !meetingType || (meetingType === 'Other' && !customType) || selectedTeamMembers.length === 0}
              >
                Next: View Availability
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewIEPMeetingModal;