
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, List, Calendar as CalendarIcon } from 'lucide-react';
import FilterButton from '@/components/filters/FilterButton';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';

interface CalendarViewHeaderProps {
  selectedDate: Date;
  view: 'day' | 'week' | 'month';
  daysToDisplay: Date[];
  showMiniCalendar: boolean;
  setShowMiniCalendar: (show: boolean) => void;
  setView: (view: 'day' | 'week' | 'month') => void;
  navigatePrevious: () => void;
  navigateNext: () => void;
  navigateToday: () => void;
  showTaskList: boolean;
  setShowTaskList: (show: boolean) => void;
  renderTaskList: () => React.ReactNode;
}

const CalendarViewHeader: React.FC<CalendarViewHeaderProps> = ({
  selectedDate,
  view,
  daysToDisplay,
  showMiniCalendar,
  setShowMiniCalendar,
  setView,
  navigatePrevious,
  navigateNext,
  navigateToday,
  showTaskList,
  setShowTaskList,
  renderTaskList
}) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex justify-between items-center flex-wrap gap-2">
      <h2 className="text-xl md:text-2xl font-bold">Calendar</h2>
      <div className="flex items-center gap-1 md:gap-2 flex-wrap">
        {!isMobile ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTaskList(!showTaskList)}
          >
            <List className="h-4 w-4 mr-2" />
            {showTaskList ? 'Hide Task List' : 'Show Task List'}
          </Button>
        ) : (
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline" size="sm">
                <List className="h-4 w-4" />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <div className="p-4 max-h-[80vh] overflow-auto">
                {renderTaskList()}
              </div>
            </DrawerContent>
          </Drawer>
        )}
        
        <div className="flex border rounded-md overflow-hidden">
          <Button 
            variant={view === 'day' ? 'default' : 'ghost'} 
            size={isMobile ? "sm" : "sm"}
            onClick={() => setView('day')}
            className={`rounded-none px-2 md:px-4 ${isMobile ? "text-xs" : ""}`}
          >
            Day
          </Button>
          <Button 
            variant={view === 'week' ? 'default' : 'ghost'} 
            size={isMobile ? "sm" : "sm"}
            onClick={() => setView('week')}
            className={`rounded-none px-2 md:px-4 ${isMobile ? "text-xs" : ""}`}
          >
            Week
          </Button>
          <Button 
            variant={view === 'month' ? 'default' : 'ghost'} 
            size={isMobile ? "sm" : "sm"}
            onClick={() => setView('month')}
            className={`rounded-none px-2 md:px-4 ${isMobile ? "text-xs" : ""}`}
          >
            Month
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={navigatePrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={navigateNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="text-xs md:text-sm" onClick={navigateToday}>
            Today
          </Button>
          <span className="ml-1 md:ml-2 text-sm md:text-lg font-medium hidden xs:inline">
            {view === 'day' 
              ? format(selectedDate, 'MMM d, yyyy') 
              : `${format(daysToDisplay[0], 'MMM d')} - ${format(daysToDisplay[daysToDisplay.length - 1], 'MMM d')}`
            }
          </span>
        </div>
        
        {!isMobile ? (
          <div className="relative">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setShowMiniCalendar(!showMiniCalendar)}
              className="ml-1"
              aria-label="Show calendar"
            >
              <CalendarIcon className="h-4 w-4" />
            </Button>
            {showMiniCalendar && (
              <div className="absolute right-0 z-20 bg-background border rounded-md shadow-lg mt-2 pointer-events-auto">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      navigateToday();
                      setShowMiniCalendar(false);
                    }
                  }}
                  className="rounded-md border p-2 pointer-events-auto"
                />
              </div>
            )}
          </div>
        ) : (
          <Drawer>
            <DrawerTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                className="h-8 w-8"
                aria-label="Show calendar"
              >
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <div className="p-4 flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      navigateToday();
                    }
                  }}
                  className="rounded-md border p-2"
                />
              </div>
            </DrawerContent>
          </Drawer>
        )}
        
        <FilterButton />
      </div>
    </div>
  );
};

export default CalendarViewHeader;
