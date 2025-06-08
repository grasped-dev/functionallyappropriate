import React from 'react';
import { X, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { AvailableSlot } from '../../utils/scheduleCalculator';

interface DaySlotsModalProps {
  isOpen: boolean;
  onClose: () => void;
  day: Date | null;
  commonSlotsForDay: AvailableSlot[];
  onSlotSelect: (slot: AvailableSlot) => void;
}

const DaySlotsModal: React.FC<DaySlotsModalProps> = ({
  isOpen,
  onClose,
  day,
  commonSlotsForDay,
  onSlotSelect,
}) => {
  const formatTime = (timeString: string): string => {
    const [hour, minute] = timeString.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  const calculateDuration = (startTime: string, endTime: string): number => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    return endMinutes - startMinutes;
  };

  const handleSlotClick = (slot: AvailableSlot) => {
    onSlotSelect(slot);
    onClose();
  };

  if (!isOpen || !day) return null;

  const duration = commonSlotsForDay.length > 0 ? calculateDuration(commonSlotsForDay[0].startTime, commonSlotsForDay[0].endTime) : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-bg-primary rounded-lg shadow-lg">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Calendar className="text-teal" size={24} />
              <h2 className="text-xl font-medium">Available {duration}-Minute Slots</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-bg-secondary rounded-full transition-colors"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6">
            {/* Selected Day Display */}
            <div className="mb-6 p-4 bg-teal bg-opacity-10 border border-teal rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="text-teal" size={16} />
                <h3 className="font-medium">Selected Date</h3>
              </div>
              <div className="text-lg font-medium">
                {format(day, 'EEEE, MMMM d, yyyy')}
              </div>
              <div className="text-sm text-text-secondary mt-1">
                {commonSlotsForDay.length} available {duration}-minute slot{commonSlotsForDay.length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Time Slots List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              <h3 className="font-medium text-sm text-text-secondary uppercase tracking-wide">
                Select a {duration}-Minute Time Slot
              </h3>
              
              {commonSlotsForDay.length > 0 ? (
                commonSlotsForDay.map((slot, index) => (
                  <button
                    key={index}
                    onClick={() => handleSlotClick(slot)}
                    className="w-full p-4 border border-teal rounded-md hover:bg-teal hover:bg-opacity-10 transition-all text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-teal rounded-full text-white group-hover:bg-opacity-90">
                          <Clock size={16} />
                        </div>
                        <div>
                          <div className="font-medium text-lg">
                            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                          </div>
                          <div className="text-sm text-text-secondary">
                            {duration}-minute meeting • All team members available
                          </div>
                        </div>
                      </div>
                      <div className="text-teal opacity-0 group-hover:opacity-100 transition-opacity">
                        →
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8 text-text-secondary">
                  <Clock size={40} className="mx-auto mb-2 opacity-30" />
                  <p>No {duration}-minute slots available for this day</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-border rounded-md hover:bg-bg-secondary transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DaySlotsModal;