
import React from 'react';
import { RecurrencePattern } from '@/context/TaskTypes';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DailyOptions } from './frequency/DailyOptions';
import { WeeklyOptions } from './frequency/WeeklyOptions';
import { MonthlyOptions } from './frequency/MonthlyOptions';
import { YearlyOptions } from './frequency/YearlyOptions';

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

      {pattern.frequency === 'daily' && (
        <DailyOptions
          interval={pattern.interval}
          onIntervalChange={(interval) => onPatternChange({ interval })}
        />
      )}

      {pattern.frequency === 'weekly' && (
        <WeeklyOptions
          interval={pattern.interval}
          onIntervalChange={(interval) => onPatternChange({ interval })}
          selectedDays={pattern.daysOfWeek || []}
          onDaysChange={(daysOfWeek) => onPatternChange({ daysOfWeek })}
        />
      )}

      {pattern.frequency === 'monthly' && (
        <MonthlyOptions
          interval={pattern.interval}
          onIntervalChange={(interval) => onPatternChange({ interval })}
          dayOfMonth={pattern.dayOfMonth}
          onDayOfMonthChange={(dayOfMonth) => onPatternChange({ dayOfMonth })}
        />
      )}

      {pattern.frequency === 'yearly' && (
        <YearlyOptions
          interval={pattern.interval}
          onIntervalChange={(interval) => onPatternChange({ interval })}
          monthOfYear={pattern.monthOfYear}
          onMonthOfYearChange={(monthOfYear) => onPatternChange({ monthOfYear })}
          dayOfMonth={pattern.dayOfMonth}
          onDayOfMonthChange={(dayOfMonth) => onPatternChange({ dayOfMonth })}
        />
      )}
    </div>
  );
};
