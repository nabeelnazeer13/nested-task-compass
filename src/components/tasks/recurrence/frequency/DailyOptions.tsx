
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface DailyOptionsProps {
  interval: number;
  onIntervalChange: (value: number) => void;
}

export const DailyOptions: React.FC<DailyOptionsProps> = ({
  interval,
  onIntervalChange
}) => {
  return (
    <div className="flex items-center space-x-2 mt-1">
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
      <span>day(s)</span>
    </div>
  );
};
