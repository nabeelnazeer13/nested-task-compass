
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Check, X } from 'lucide-react';

interface EditableDescriptionProps {
  description?: string;
  onSave: (description: string | undefined) => void;
  onCancel: () => void;
}

export const EditableDescription: React.FC<EditableDescriptionProps> = ({
  description,
  onSave,
  onCancel,
}) => {
  const [value, setValue] = useState(description || '');

  return (
    <div className="space-y-2">
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="min-h-[100px]"
        placeholder="Add a description..."
      />
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" onClick={() => onSave(value || undefined)}>
          Save
        </Button>
      </div>
    </div>
  );
};
