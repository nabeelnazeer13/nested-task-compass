import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Task, RecurrencePattern, Priority } from "@/context/TaskTypes";
import { CalendarDays, Clock, Edit2, List, Repeat } from "lucide-react";
import { format } from 'date-fns';
import { formatMinutes } from '@/lib/time-utils';
import TrackingHistory from '@/components/time-tracking/TrackingHistory';
import { useTaskContext, useTimeTrackingContext } from '@/context/TaskContext';
import { getPriorityColor, getPriorityLabel } from '@/lib/priority-utils';
import { EditablePriority } from './EditablePriority';
import { EditableDateTime } from './EditableDateTime';
import { EditableEstimatedTime } from './EditableEstimatedTime';
import { EditableDescription } from './EditableDescription';
import RecurrenceSettingsForm from './RecurrenceSettingsForm';
import { Separator } from '../ui/separator';
import { formatRecurrencePattern } from '@/lib/recurrence-utils';

interface TaskDetailsContentProps {
  task: Task;
}

export default function TaskDetailsContent({ task }: TaskDetailsContentProps) {
  const { updateTask } = useTaskContext();
  const { timeTrackings } = useTimeTrackingContext();

  const [editingPriority, setEditingPriority] = useState(false);
  const [editingDueDate, setEditingDueDate] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [editingEstimatedTime, setEditingEstimatedTime] = useState(false);
  const [editingRecurrence, setEditingRecurrence] = useState(false);

  const taskTimeTrackings = timeTrackings.filter(
    (tracking) => tracking.taskId === task.id
  );

  const handleUpdatePriority = (newPriority: Priority) => {
    updateTask({
      ...task,
      priority: newPriority
    });
    setEditingPriority(false);
  };

  const handleUpdateDueDate = (newDate: Date | undefined, newTimeSlot?: string) => {
    updateTask({
      ...task,
      dueDate: newDate,
      timeSlot: newTimeSlot
    });
    setEditingDueDate(false);
  };

  const handleUpdateDescription = (newDescription: string) => {
    updateTask({
      ...task,
      description: newDescription
    });
    setEditingDescription(false);
  };

  const handleUpdateEstimatedTime = (newEstimatedTime: number | undefined) => {
    updateTask({
      ...task,
      estimatedTime: newEstimatedTime
    });
    setEditingEstimatedTime(false);
  };

  const handleUpdateRecurrence = (enabled: boolean, pattern?: RecurrencePattern) => {
    if (task.recurrenceParentId) {
      // This is an instance, we should detach it from recurrence
      updateTask({
        ...task,
        recurrenceParentId: undefined
      });
      return;
    }
    
    updateTask({
      ...task,
      isRecurring: enabled,
      recurrencePattern: enabled ? pattern : undefined
    });
    setEditingRecurrence(false);
  };

  return (
    <div className="space-y-6 p-1 pb-16">
      <div>
        <h2 className="text-2xl font-semibold">{task.title}</h2>
        
        {/* Recurring task indicator */}
        {(task.isRecurring || task.recurrenceParentId) && !editingRecurrence && (
          <div className="flex items-center mt-2 text-sm text-primary">
            <Repeat className="mr-1 h-4 w-4" />
            {task.isRecurring && task.recurrencePattern && (
              <span>{formatRecurrencePattern(task.recurrencePattern)}</span>
            )}
            {task.recurrenceParentId && (
              <span>Recurring task instance</span>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 ml-1"
              onClick={() => setEditingRecurrence(true)}
            >
              <Edit2 className="h-3 w-3" />
            </Button>
          </div>
        )}
        
        {editingRecurrence && (
          <div className="mt-4 border p-4 rounded-md">
            {task.recurrenceParentId ? (
              <div className="space-y-4">
                <p className="text-sm">This is an instance of a recurring task.</p>
                <Button onClick={() => handleUpdateRecurrence(false)}>
                  Detach from recurrence
                </Button>
                <Button variant="outline" onClick={() => setEditingRecurrence(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <>
                <RecurrenceSettingsForm
                  enabled={task.isRecurring || false}
                  onEnabledChange={(enabled) => handleUpdateRecurrence(
                    enabled, 
                    enabled ? (task.recurrencePattern || { frequency: 'daily', interval: 1 }) : undefined
                  )}
                  pattern={task.recurrencePattern || { frequency: 'daily', interval: 1 }}
                  onPatternChange={(pattern) => handleUpdateRecurrence(true, pattern)}
                />
                <div className="flex justify-end mt-4">
                  <Button variant="outline" onClick={() => setEditingRecurrence(false)}>
                    Close
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Priority</p>
          {editingPriority ? (
            <EditablePriority 
              priority={task.priority}
              onSave={handleUpdatePriority}
              onCancel={() => setEditingPriority(false)}
            />
          ) : (
            <div className="flex items-center gap-2">
              <Badge className={`${getPriorityColor(task.priority).bg} ${getPriorityColor(task.priority).text}`}>
                {getPriorityLabel(task.priority)}
              </Badge>
              <Button variant="ghost" size="icon" onClick={() => setEditingPriority(true)}>
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground mb-1">Due Date</p>
          {editingDueDate ? (
            <EditableDateTime 
              date={task.dueDate}
              timeSlot={task.timeSlot}
              onSave={handleUpdateDueDate}
              onCancel={() => setEditingDueDate(false)}
            />
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {task.dueDate ? format(new Date(task.dueDate), "MMM d, yyyy") : "Not set"}
                  {task.timeSlot && ` at ${task.timeSlot}`}
                </span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setEditingDueDate(true)}>
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-muted-foreground">Description</p>
          {!editingDescription && (
            <Button variant="ghost" size="icon" onClick={() => setEditingDescription(true)}>
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {editingDescription ? (
          <EditableDescription 
            description={task.description || ''} 
            onSave={handleUpdateDescription}
            onCancel={() => setEditingDescription(false)}
          />
        ) : (
          <div className="border rounded-md p-3 min-h-[100px] text-sm whitespace-pre-wrap">
            {task.description || <span className="text-muted-foreground">No description</span>}
          </div>
        )}
      </div>
      
      <div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Estimated Time</p>
          <div className="flex items-center">
            {task.estimatedTime ? (
              <div className="flex items-center mr-2 text-sm">
                <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                <span>{formatMinutes(task.estimatedTime)}</span>
              </div>
            ) : null}
            {!editingEstimatedTime && (
              <Button variant="ghost" size="icon" onClick={() => setEditingEstimatedTime(true)}>
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {editingEstimatedTime && (
          <EditableEstimatedTime 
            time={task.estimatedTime} 
            onSave={handleUpdateEstimatedTime}
            onCancel={() => setEditingEstimatedTime(false)}
          />
        )}
      </div>
      
      {/* Separator between task details and tracking history */}
      <Separator />
      
      <div>
        <div className="flex items-center gap-2 mb-4">
          <List className="h-5 w-5" />
          <h3 className="text-lg font-medium">Time Tracking History</h3>
        </div>
        <TrackingHistory 
          trackings={taskTimeTrackings} 
          onUpdateTracking={(updatedTracking) => {
            // Handle updating time tracking
          }}
          onDeleteTracking={(trackingId) => {
            // Handle deleting time tracking
          }}
        />
      </div>
    </div>
  );
}
