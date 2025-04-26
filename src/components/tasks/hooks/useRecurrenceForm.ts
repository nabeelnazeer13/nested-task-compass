
import { useState, useEffect } from 'react';
import { RecurrencePattern } from '@/context/TaskTypes';

interface UseRecurrenceFormProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  pattern?: RecurrencePattern;
  onPatternChange: (pattern: RecurrencePattern) => void;
}

export const useRecurrenceForm = ({
  enabled,
  pattern,
  onPatternChange
}: UseRecurrenceFormProps) => {
  const [localPattern, setLocalPattern] = useState<RecurrencePattern>(pattern || {
    frequency: 'daily',
    interval: 1
  });
  const [showDetails, setShowDetails] = useState(false);
  const [endType, setEndType] = useState<'never' | 'on' | 'after'>('never');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [tempEndDate, setTempEndDate] = useState<Date | undefined>(pattern?.endDate);
  const [tempOccurrences, setTempOccurrences] = useState<number | undefined>(pattern?.occurrences);

  useEffect(() => {
    if (pattern) {
      setLocalPattern(pattern);
      if (pattern.endDate) {
        setEndType('on');
        setTempEndDate(pattern.endDate);
      } else if (pattern.occurrences) {
        setEndType('after');
        setTempOccurrences(pattern.occurrences);
      } else {
        setEndType('never');
      }
    }
  }, [pattern]);

  const updatePatternAndNotify = (updates: Partial<RecurrencePattern>) => {
    const updatedPattern = { ...localPattern, ...updates };
    setLocalPattern(updatedPattern);
    onPatternChange(updatedPattern);
  };

  return {
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
  };
};
