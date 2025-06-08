import React, { useState } from 'react';
import { X, Clock, Calendar } from 'lucide-react';

interface CommonAvailableSlot {
  date: string; // "YYYY-MM-DD"
  startTime: string; // "HH:MM" (e.g., "09:00")
  endTime: string; // "HH:MM" (e.g., "11:30")
}

interface DurationSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitDuration: (durationMinutes: number) => void;
  selectedSlot: CommonAvailableSlot | null;
}

const DurationSelectionModal: React.FC<DurationSelectionModalProps> = ({
  isOpen,
  onClose,
  onSubmitDuration,
  selectedSlot,
}) => {
  const [selectedDuration, setSelectedDuration] = useState<number>(60);

  const calculateSlotDuration = (slot: CommonAvailableSlot): number => {
    const [startHour, startMin] = slot.startTime.split(':').map(Number);
    const [endHour, endMin] = slot.endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    return endMinutes - startMinutes;
  };

  const getDurationOptions = (): number[] => {
    if (!selectedSlot) return [30, 45, 60, 90];
    
    const maxDuration = calculateSlotDuration(selectedSlot);
    const standardOptions = [30, 45, 60, 90, 120];
    
    // Filter options to not exceed the slot duration
    return standardOptions.filter(duration => duration <= maxDuration);
  };

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitDuration(selectedDuration);
  };

  if (!isOpen || !selectedSlot) return null;

  const durationOptions = getDurationOptions();
  const slotDuration = calculateSlotDuration(selectedSlot);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-bg-primary rounded-lg shadow-lg">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Clock className="text-teal" size={24} />
              <h2 className="text-xl font-medium">Select Meeting Duration</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-bg-secondary rounded-full transition-colors"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {/* Selected Slot Display */}
            <div className="mb-6 p-4 bg-teal bg-opacity-10 border border-teal rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="text-teal" size={16} />
                <h3 className="font-medium">Selected Time Slot</h3>
              </div>
              <div className="text-sm">
                <div className="font-medium">{formatDate(selectedSlot.date)}</div>
                <div className="text-text-secondary">
                  {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
                </div>
                <div className="text-xs text-text-secondary mt-1">
                  Available duration: {slotDuration} minutes
                </div>
              </div>
            </div>

            {/* Duration Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">
                Choose Meeting Duration
              </label>
              <div className="space-y-2">
                {durationOptions.map(duration => (
                  <label
                    key={duration}
                    className="flex items-center gap-3 p-3 border border-border rounded-md hover:border-teal transition-colors cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="duration"
                      value={duration}
                      checked={selectedDuration === duration}
                      onChange={(e) => setSelectedDuration(Number(e.target.value))}
                      className="text-teal focus:ring-teal"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{duration} minutes</div>
                      <div className="text-sm text-text-secondary">
                        {duration === 30 && "Quick check-in or brief discussion"}
                        {duration === 45 && "Standard progress review"}
                        {duration === 60 && "Full IEP meeting (recommended)"}
                        {duration === 90 && "Comprehensive review or initial evaluation"}
                        {duration === 120 && "Extended meeting for complex cases"}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-border rounded-md hover:bg-bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-teal text-white rounded-md hover:bg-opacity-90 transition-colors"
              >
                Confirm Duration
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DurationSelectionModal;