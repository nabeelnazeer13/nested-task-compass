
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface WeeklyOptionsProps {
  interval: number;
  onIntervalChange: (value: number) => void;
  selectedDays: number[];
  onDaysChange: (days: number[]) => void;
}

export const WeeklyOptions: React.FC<WeeklyOptionsProps> = ({
  interval,
  onIntervalChange,
  selectedDays,
  onDaysChange
}) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Input
          type="number"
          min="1"
          max="999"
          value={interval}
          onChange={(e) => {
            const value = parseInt(e.target.value, 10);
            if (!isNaN(value) && value > 0) {
              onIntervalChange(value);
            }
          }}
          className="w-20"
        />
        <span>week(s)</span>
      </div>

      <div>
        <Label className="mb-2">Repeat on</Label>
        <div className="flex flex-wrap gap-2 mt-1">
          {days.map((day, index) => (
            <Button
              key={day}
              type="button"
              variant={selectedDays.includes(index) ? "default" : "outline"}
              className="w-10 h-10 p-0"
              onClick={() => {
                const newDays = selectedDays.includes(index)
                  ? selectedDays.filter(d => d !== index)
                  : [...selectedDays, index].sort();
                onDaysChange(newDays);
              }}
            >
              {day}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
