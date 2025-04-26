
import { useState } from 'react';
import { TimeTracking } from '../TaskTypes';
import { generateId } from '../TaskHelpers';

export function useTimeTrackingActions(
  timeTrackingsInit: TimeTracking[],
  setTimeTrackings: (trackings: TimeTracking[]) => void
) {
  const addTimeTracking = (timeTracking: Omit<TimeTracking, 'id'>) => {
    const newTimeTracking = { ...timeTracking, id: generateId() };
    setTimeTrackings([...timeTrackingsInit, newTimeTracking]);
  };

  const updateTimeTracking = (timeTracking: TimeTracking) => {
    setTimeTrackings(
      timeTrackingsInit.map((t) => (t.id === timeTracking.id ? timeTracking : t))
    );
  };

  const deleteTimeTracking = (timeTrackingId: string) => {
    setTimeTrackings(timeTrackingsInit.filter((t) => t.id !== timeTrackingId));
  };

  return { addTimeTracking, updateTimeTracking, deleteTimeTracking };
}
