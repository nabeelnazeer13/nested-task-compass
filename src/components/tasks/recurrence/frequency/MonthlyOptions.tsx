
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface MonthlyOptionsProps {
  interval: number;
  onIntervalChange: (value: number) => void;
  dayOfMonth?: number;
  onDayOfMonthChange: (value: number | undefined) => void;
}

export const MonthlyOptions: React.FC<MonthlyOptionsProps> = ({
  interval,
  onIntervalChange,
  dayOfMonth,
  onDayOfMonthChange
}) => {
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
        <span>month(s)</span>
      </div>

      <div>
        <Label htmlFor="day-of-month">Day of month</Label>
        <Input
          id="day-of-month"
          type="number"
          min="1"
          max="31"
          value={dayOfMonth || ''}
          onChange={(e) => {
            const value = parseInt(e.target.value, 10);
            if (!isNaN(value) && value > 0 && value <= 31) {
              onDayOfMonthChange(value);
            }
          }}
          placeholder="Day of month"
          className="mt-1"
        />
      </div>
    </div>
  );
};
