
import React from 'react';
import { RecurrencePattern } from '@/context/TaskTypes';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatRecurrencePattern } from '@/lib/recurrence-utils';
import { useRecurrenceForm } from './hooks/useRecurrenceForm';
import { FrequencyOptions } from './recurrence/FrequencyOptions';
import { EndDateOptions } from './recurrence/EndDateOptions';

interface RecurrenceSettingsFormProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  pattern?: RecurrencePattern;
  onPatternChange: (pattern: RecurrencePattern) => void;
}

const RecurrenceSettingsForm: React.FC<RecurrenceSettingsFormProps> = ({
  enabled,
  onEnabledChange,
  pattern,
  onPatternChange
}) => {
  const {
    localPattern,
    showDetails,
    setShowDetails,
    endType,
    setEndType,
    isCalendarOpen,
    setIsCalendarOpen,
    tempEndDate,
    setTempEndDate,
    tempOccurrences,
    setTempOccurrences,
    updatePatternAndNotify
  } = useRecurrenceForm({
    enabled,
    onEnabledChange,
    pattern,
    onPatternChange
  });

  const handleEndTypeChange = (value: 'never' | 'on' | 'after') => {
    setEndType(value);
    
    let updates: Partial<RecurrencePattern> = {};
    
    if (value === 'never') {
      delete updates.endDate;
      delete updates.occurrences;
    } else if (value === 'on' && tempEndDate) {
      updates.endDate = tempEndDate;
      delete updates.occurrences;
    } else if (value === 'after' && tempOccurrences) {
      updates.occurrences = tempOccurrences;
      delete updates.endDate;
    }
    
    updatePatternAndNotify(updates);
  };

  const handleEndDateChange = (date: Date | undefined) => {
    if (date) {
      setTempEndDate(date);
      updatePatternAndNotify({ endDate: date, occurrences: undefined });
    }
    setIsCalendarOpen(false);
  };

  const handleOccurrencesChange = (occurrences: number | undefined) => {
    setTempOccurrences(occurrences);
    if (occurrences) {
      updatePatternAndNotify({ occurrences, endDate: undefined });
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
            <span>{formatRecurrencePattern(localPattern)}</span>
            {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>
          
          {showDetails && (
            <div className="space-y-4 pt-2 border-t">
              <FrequencyOptions
                pattern={localPattern}
                onPatternChange={updatePatternAndNotify}
              />
              
              <EndDateOptions
                endType={endType}
                onEndTypeChange={handleEndTypeChange}
                tempEndDate={tempEndDate}
                onEndDateChange={handleEndDateChange}
                tempOccurrences={tempOccurrences}
                onOccurrencesChange={handleOccurrencesChange}
                isCalendarOpen={isCalendarOpen}
                setIsCalendarOpen={setIsCalendarOpen}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecurrenceSettingsForm;
