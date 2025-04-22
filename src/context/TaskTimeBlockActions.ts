
import { useState } from 'react';
import { TimeBlock } from './TaskTypes';
import { generateId } from './TaskHelpers';

export function useTimeBlockActions(timeBlocksInit: TimeBlock[], setTimeBlocks: (blocks: TimeBlock[]) => void) {
  const addTimeBlock = (timeBlock: Omit<TimeBlock, 'id'>) => {
    const newTimeBlock = { ...timeBlock, id: generateId() };
    setTimeBlocks([...timeBlocksInit, newTimeBlock]);
  };

  const updateTimeBlock = (timeBlock: TimeBlock) => {
    setTimeBlocks(timeBlocksInit.map((tb) => (tb.id === timeBlock.id ? timeBlock : tb)));
  };

  const deleteTimeBlock = (timeBlockId: string) => {
    setTimeBlocks(timeBlocksInit.filter((tb) => tb.id !== timeBlockId));
  };

  return { addTimeBlock, updateTimeBlock, deleteTimeBlock };
}
