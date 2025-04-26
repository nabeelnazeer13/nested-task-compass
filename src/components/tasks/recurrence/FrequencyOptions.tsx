
import React from 'react';
import { RecurrencePattern } from '@/context/TaskTypes';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FrequencyOptionsProps {
  pattern: RecurrencePattern;
  onPatternChange: (updates: Partial<RecurrencePattern>) => void;
}

export const FrequencyOptions: React.FC<FrequencyOptionsProps> = ({
  pattern,
  onPatternChange
}) => {
  const handleFrequencyChange = (frequency: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
    const updated = { ...pattern, frequency };
    
    if (frequency !== 'weekly') {
      delete updated.daysOfWeek;
    }
    
    if (frequency !== 'monthly') {
      delete updated.dayOfMonth;
    }
    
    if (frequency !== 'yearly') {
      delete updated.monthOfYear;
      delete updated.dayOfMonth;
    }
    
    onPatternChange(updated);
  };

  const renderFrequencySpecificOptions = () => {
    switch (pattern.frequency) {
      case 'weekly':
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const selectedDays = pattern.daysOfWeek || [];
        
        return (
          <div className="mt-4">
            <Label className="mb-2">Repeat on</Label>
            <div className="flex flex-wrap gap-2">
              {days.map((day, index) => (
                <Button
                  key={day}
                  type="button"
                  variant={selectedDays.includes(index) ? "default" : "outline"}
                  className="w-10 h-10 p-0"
                  onClick={() => {
                    const daysOfWeek = selectedDays.includes(index)
                      ? selectedDays.filter(d => d !== index)
                      : [...selectedDays, index].sort();
                    onPatternChange({ daysOfWeek });
                  }}
                >
                  {day}
                </Button>
              ))}
            </div>
          </div>
        );
        
      case 'monthly':
        return (
          <div className="mt-4">
            <Label htmlFor="day-of-month">Day of month</Label>
            <Input
              id="day-of-month"
              type="number"
              min="1"
              max="31"
              value={pattern.dayOfMonth || ''}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                if (!isNaN(value) && value > 0 && value <= 31) {
                  onPatternChange({ dayOfMonth: value });
                }
              }}
              placeholder="Day of month"
              className="mt-1"
            />
          </div>
        );
        
      case 'yearly':
        const months = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        return (
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="month-of-year">Month</Label>
              <Select
                value={pattern.monthOfYear?.toString() || '0'}
                onValueChange={(value) => {
                  onPatternChange({
                    monthOfYear: parseInt(value, 10)
                  });
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
                value={pattern.dayOfMonth || ''}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  if (!isNaN(value) && value > 0 && value <= 31) {
                    onPatternChange({ dayOfMonth: value });
                  }
                }}
                placeholder="Day of month"
                className="mt-1"
              />
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="frequency">Repeat</Label>
        <Select
          value={pattern.frequency}
          onValueChange={(value) => handleFrequencyChange(value as any)}
        >
          <SelectTrigger id="frequency" className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="interval">Every</Label>
        <div className="flex items-center space-x-2 mt-1">
          <Input
            id="interval"
            type="number"
            min="1"
            max="999"
            value={pattern.interval}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              if (!isNaN(value) && value > 0) {
                onPatternChange({ interval: value });
              }
            }}
            className="w-20"
          />
          <span>
            {pattern.frequency === 'daily' && 'day(s)'}
            {pattern.frequency === 'weekly' && 'week(s)'}
            {pattern.frequency === 'monthly' && 'month(s)'}
            {pattern.frequency === 'yearly' && 'year(s)'}
          </span>
        </div>
      </div>
      
      {renderFrequencySpecificOptions()}
    </div>
  );
};
