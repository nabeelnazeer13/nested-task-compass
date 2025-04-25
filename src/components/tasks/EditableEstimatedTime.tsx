
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, X } from 'lucide-react';

interface EditableEstimatedTimeProps {
  time?: number;
  onSave: (time: number | undefined) => void;
  onCancel: () => void;
}

export const EditableEstimatedTime: React.FC<EditableEstimatedTimeProps> = ({
  time,
  onSave,
  onCancel,
}) => {
  const [value, setValue] = useState(time?.toString() || '');

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        min="0"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-[120px]"
        placeholder="Minutes"
      />
      <Button 
        size="icon" 
        variant="ghost" 
        onClick={() => onSave(value ? parseInt(value) : undefined)}
      >
        <Check className="h-4 w-4" />
      </Button>
      <Button size="icon" variant="ghost" onClick={onCancel}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};
