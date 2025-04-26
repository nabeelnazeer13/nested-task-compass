
import React, { useState, useEffect } from 'react';
import { RecurrencePattern } from '@/context/TaskTypes';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { formatRecurrencePattern } from '@/lib/recurrence-utils';

interface RecurrenceSettingsFormProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  pattern?: RecurrencePattern;
  onPatternChange: (pattern: RecurrencePattern) => void;
}

const defaultPattern: RecurrencePattern = {
  frequency: 'daily',
  interval: 1
};

const RecurrenceSettingsForm: React.FC<RecurrenceSettingsFormProps> = ({
  enabled,
  onEnabledChange,
  pattern,
  onPatternChange
}) => {
  const [currentPattern, setCurrentPattern] = useState<RecurrencePattern>(
    pattern || defaultPattern
  );
  
  const [showDetails, setShowDetails] = useState(false);
  const [endType, setEndType] = useState<'never' | 'on' | 'after'>('never');

  useEffect(() => {
    if (pattern) {
      setCurrentPattern(pattern);
      if (pattern.endDate) {
        setEndType('on');
      } else if (pattern.occurrences) {
        setEndType('after');
      } else {
        setEndType('never');
      }
    } else {
      setCurrentPattern(defaultPattern);
    }
  }, [pattern]);

  useEffect(() => {
    // Remove end properties based on endType
    const updatedPattern = { ...currentPattern };
    
    if (endType !== 'on') {
      delete updatedPattern.endDate;
    }
    
    if (endType !== 'after') {
      delete updatedPattern.occurrences;
    }
    
    onPatternChange(updatedPattern);
  }, [currentPattern, endType, onPatternChange]);

  const handleFrequencyChange = (frequency: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
    const updated = { ...currentPattern, frequency };
    
    // Reset frequency-specific options when changing frequency
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
    
    setCurrentPattern(updated);
  };

  const handleToggleDay = (day: number) => {
    const daysOfWeek = currentPattern.daysOfWeek || [];
    const updated = daysOfWeek.includes(day)
      ? daysOfWeek.filter(d => d !== day)
      : [...daysOfWeek, day].sort();
      
    setCurrentPattern({
      ...currentPattern,
      daysOfWeek: updated
    });
  };

  const handleEndDateChange = (date: Date | undefined) => {
    if (date) {
      setCurrentPattern({
        ...currentPattern,
        endDate: date
      });
    }
  };

  const handleOccurrencesChange = (occurrences: string) => {
    const value = parseInt(occurrences, 10);
    if (!isNaN(value) && value > 0) {
      setCurrentPattern({
        ...currentPattern,
        occurrences: value
      });
    }
  };

  const renderFrequencyOptions = () => {
    const { frequency } = currentPattern;
    
    switch (frequency) {
      case 'weekly':
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const selectedDays = currentPattern.daysOfWeek || [];
        
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
                  onClick={() => handleToggleDay(index)}
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
              value={currentPattern.dayOfMonth || ''}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                if (!isNaN(value) && value > 0 && value <= 31) {
                  setCurrentPattern({
                    ...currentPattern,
                    dayOfMonth: value
                  });
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
                value={currentPattern.monthOfYear?.toString() || '0'}
                onValueChange={(value) => {
                  setCurrentPattern({
                    ...currentPattern,
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
                value={currentPattern.dayOfMonth || ''}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  if (!isNaN(value) && value > 0 && value <= 31) {
                    setCurrentPattern({
                      ...currentPattern,
                      dayOfMonth: value
                    });
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
      <div className="flex items-center space-x-2">
        <Switch
          checked={enabled}
          onCheckedChange={onEnabledChange}
          id="recurring-toggle"
        />
        <Label htmlFor="recurring-toggle" className="cursor-pointer">
          Recurring task
        </Label>
      </div>
      
      {enabled && (
        <div className="space-y-4 pt-2">
          <Button 
            variant="outline" 
            type="button"
            className="w-full flex justify-between"
            onClick={() => setShowDetails(!showDetails)}
          >
            <span>{formatRecurrencePattern(currentPattern)}</span>
            {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>
          
          {showDetails && (
            <div className="space-y-4 pt-2 border-t">
              <div>
                <Label htmlFor="frequency">Repeat</Label>
                <Select
                  value={currentPattern.frequency}
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
                    value={currentPattern.interval}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      if (!isNaN(value) && value > 0) {
                        setCurrentPattern({
                          ...currentPattern,
                          interval: value
                        });
                      }
                    }}
                    className="w-20"
                  />
                  <span>
                    {currentPattern.frequency === 'daily' && 'day(s)'}
                    {currentPattern.frequency === 'weekly' && 'week(s)'}
                    {currentPattern.frequency === 'monthly' && 'month(s)'}
                    {currentPattern.frequency === 'yearly' && 'year(s)'}
                  </span>
                </div>
              </div>
              
              {renderFrequencyOptions()}
              
              <div className="space-y-3">
                <Label>Ends</Label>
                <RadioGroup value={endType} onValueChange={(value) => setEndType(value as any)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="never" id="end-never" />
                    <Label htmlFor="end-never">Never</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="on" id="end-on" />
                    <Label htmlFor="end-on">On date</Label>
                    {endType === 'on' && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "ml-2 w-[130px] justify-start text-left font-normal",
                              !currentPattern.endDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {currentPattern.endDate ? format(currentPattern.endDate, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={currentPattern.endDate}
                            onSelect={handleEndDateChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="after" id="end-after" />
                    <Label htmlFor="end-after">After</Label>
                    {endType === 'after' && (
                      <div className="flex items-center ml-2">
                        <Input
                          type="number"
                          min="1"
                          value={currentPattern.occurrences || ''}
                          onChange={(e) => handleOccurrencesChange(e.target.value)}
                          className="w-16 h-8"
                        />
                        <span className="ml-2">occurrences</span>
                      </div>
                    )}
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecurrenceSettingsForm;
