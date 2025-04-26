
import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface EndDateOptionsProps {
  endType: 'never' | 'on' | 'after';
  onEndTypeChange: (value: 'never' | 'on' | 'after') => void;
  tempEndDate?: Date;
  onEndDateChange: (date: Date | undefined) => void;
  tempOccurrences?: number;
  onOccurrencesChange: (value: number | undefined) => void;
  isCalendarOpen: boolean;
  setIsCalendarOpen: (open: boolean) => void;
}

export const EndDateOptions: React.FC<EndDateOptionsProps> = ({
  endType,
  onEndTypeChange,
  tempEndDate,
  onEndDateChange,
  tempOccurrences,
  onOccurrencesChange,
  isCalendarOpen,
  setIsCalendarOpen
}) => {
  return (
    <div className="space-y-3">
      <Label>Ends</Label>
      <RadioGroup 
        value={endType} 
        onValueChange={(value: 'never' | 'on' | 'after') => onEndTypeChange(value)}
        className="space-y-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="never" id="end-never" />
          <Label htmlFor="end-never">Never</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="on" id="end-on" />
          <Label htmlFor="end-on">On date</Label>
        </div>
        
        {endType === 'on' && (
          <div className="ml-6 mt-2">
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !tempEndDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {tempEndDate ? format(tempEndDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[100]" align="start">
                <Calendar
                  mode="single"
                  selected={tempEndDate}
                  onSelect={onEndDateChange}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="after" id="end-after" />
          <Label htmlFor="end-after">After</Label>
        </div>
        
        {endType === 'after' && (
          <div className="flex items-center ml-6 mt-2 space-x-2">
            <Input
              type="number"
              min="1"
              value={tempOccurrences || ''}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                if (!isNaN(value) && value > 0) {
                  onOccurrencesChange(value);
                }
              }}
              className="w-20"
              placeholder="1"
            />
            <span>occurrences</span>
          </div>
        )}
      </RadioGroup>
    </div>
  );
};
