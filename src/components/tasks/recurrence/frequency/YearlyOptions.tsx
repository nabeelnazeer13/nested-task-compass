
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface YearlyOptionsProps {
  interval: number;
  onIntervalChange: (value: number) => void;
  monthOfYear?: number;
  onMonthOfYearChange: (value: number) => void;
  dayOfMonth?: number;
  onDayOfMonthChange: (value: number | undefined) => void;
}

export const YearlyOptions: React.FC<YearlyOptionsProps> = ({
  interval,
  onIntervalChange,
  monthOfYear,
  onMonthOfYearChange,
  dayOfMonth,
  onDayOfMonthChange
}) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

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
        <span>year(s)</span>
      </div>

      <div>
        <Label htmlFor="month-of-year">Month</Label>
        <Select
          value={monthOfYear?.toString() || '0'}
          onValueChange={(value) => {
            onMonthOfYearChange(parseInt(value, 10));
          }}
        >
          <SelectTrigger id="month-of-year" className="mt-1">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            {months.map((month, index) => (
              <SelectItem key={month} value={index.toString()}>
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="day-of-month-yearly">Day</Label>
        <Input
          id="day-of-month-yearly"
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
