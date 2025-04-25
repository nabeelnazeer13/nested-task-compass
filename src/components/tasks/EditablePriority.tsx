
import React, { useState } from 'react';
import { Priority } from '@/context/TaskTypes';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { priorityLabels, priorityColors } from '@/lib/priority-utils';

interface EditablePriorityProps {
  priority: Priority;
  onSave: (newPriority: Priority) => void;
  onCancel: () => void;
}

export const EditablePriority: React.FC<EditablePriorityProps> = ({
  priority,
  onSave,
  onCancel,
}) => {
  const [value, setValue] = useState<Priority>(priority);

  return (
    <div className="flex items-center gap-2">
      <Select value={value} onValueChange={(val: Priority) => setValue(val)}>
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(['low', 'medium', 'high'] as Priority[]).map((p) => (
            <SelectItem key={p} value={p}>
              <span className={priorityColors[p]}>{priorityLabels[p]}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button size="icon" variant="ghost" onClick={() => onSave(value)}>
        <Check className="h-4 w-4" />
      </Button>
      <Button size="icon" variant="ghost" onClick={onCancel}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};
