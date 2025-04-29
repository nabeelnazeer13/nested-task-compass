
import { Task } from '@/context/TaskTypes';
import { format } from 'date-fns';
import { sendNotification, scheduleNotification, cancelScheduledNotification } from './notificationService';

// Store for notification timeouts
interface ScheduledNotification {
  id: string;
  timeoutId: number;
  taskId?: string;
  type: 'reminder' | 'daily';
  scheduledTime: Date;
}

// In-memory store for active notification timeouts
let scheduledNotifications: ScheduledNotification[] = [];

// Persistent storage key for scheduled notifications
const STORED_NOTIFICATIONS_KEY = 'khonja_scheduled_notifications';

/**
 * Save the current scheduled notifications to localStorage
 */
function persistScheduledNotifications() {
  // We can't store timeoutIds in localStorage, so we just store the metadata
  const storable = scheduledNotifications.map(({ id, taskId, type, scheduledTime }) => ({
    id,
    taskId,
    type,
    scheduledTime: scheduledTime.toISOString(),
  }));
  
  localStorage.setItem(STORED_NOTIFICATIONS_KEY, JSON.stringify(storable));
}

/**
 * Load and reschedule notifications from localStorage
 */
export function loadScheduledNotifications() {
  try {
    const stored = localStorage.getItem(STORED_NOTIFICATIONS_KEY);
    if (!stored) return;
    
    const parsed = JSON.parse(stored);
    // Clear existing scheduled notifications
    clearAllScheduledNotifications();
    
    // Reschedule each notification
    parsed.forEach((item: any) => {
      const scheduledTime = new Date(item.scheduledTime);
      
      // Only reschedule if it's in the future
      if (scheduledTime > new Date()) {
        if (item.type === 'reminder' && item.taskId) {
          scheduleTaskReminder(item.taskId, scheduledTime);
        } else if (item.type === 'daily') {
          scheduleDailySummary(scheduledTime);
        }
      }
    });
    
    console.log(`Restored ${parsed.length} scheduled notifications`);
  } catch (error) {
    console.error('Failed to load scheduled notifications:', error);
  }
}

/**
 * Schedule a notification for a specific task
 */
export function scheduleTaskReminder(taskId: string, taskTime: Date, task?: Task): number | null {
  if (!('Notification' in window)) return null;
  
  try {
    // Schedule 15 minutes before task time
    const reminderTime = new Date(taskTime.getTime() - 15 * 60 * 1000);
    const now = new Date();
    
    // Only schedule if the reminder time is in the future
    if (reminderTime <= now) return null;
    
    // Calculate delay in ms
    const delayMs = reminderTime.getTime() - now.getTime();
    
    // Use the provided task or a placeholder
    const taskTitle = task?.title || 'Upcoming task';
    
    // Schedule the notification
    const timeoutPromise = scheduleNotification({
      title: 'Task Reminder',
      body: `${taskTitle} starts in 15 minutes`,
      icon: '/icons/icon-192x192.png',
      tag: `task-reminder-${taskId}`,
      data: { taskId, type: 'reminder' }
    }, delayMs);
    
    // Store the scheduled notification
    timeoutPromise.then(timeoutId => {
      const notificationId = `task-${taskId}-${reminderTime.getTime()}`;
      
      // Remove any existing notifications for this task
      scheduledNotifications = scheduledNotifications.filter(n => n.id !== notificationId);
      
      // Add the new notification
      scheduledNotifications.push({
        id: notificationId,
        timeoutId,
        taskId,
        type: 'reminder',
        scheduledTime: reminderTime
      });
      
      persistScheduledNotifications();
      console.log(`Scheduled reminder for task ${taskId} at ${format(reminderTime, 'PPpp')}`);
    });
    
    return 1; // Return a placeholder until the actual timeoutId is available
  } catch (error) {
    console.error('Failed to schedule task reminder:', error);
    return null;
  }
}

/**
 * Schedule the daily task summary notification
 * Default time is 8:00 AM
 */
export function scheduleDailySummary(targetTime?: Date): number | null {
  if (!('Notification' in window)) return null;
  
  try {
    const now = new Date();
    let scheduledTime: Date;
    
    if (targetTime) {
      scheduledTime = new Date(targetTime);
    } else {
      // Default to 8:00 AM tomorrow
      scheduledTime = new Date();
      scheduledTime.setHours(8, 0, 0, 0);
      
      // If it's already past 8:00 AM, schedule for tomorrow
      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }
    }
    
    // Calculate delay in ms
    const delayMs = scheduledTime.getTime() - now.getTime();
    
    // Schedule the notification
    const timeoutPromise = scheduleNotification({
      title: 'Daily Task Summary',
      body: 'Review your tasks for today',
      icon: '/icons/icon-192x192.png',
      tag: 'daily-summary',
      requireInteraction: true,
      data: { type: 'daily' }
    }, delayMs);
    
    // Store the scheduled notification
    timeoutPromise.then(timeoutId => {
      const notificationId = `daily-summary-${scheduledTime.getTime()}`;
      
      // Remove any existing daily summary notifications
      scheduledNotifications = scheduledNotifications.filter(n => n.id !== notificationId);
      
      // Add the new notification
      scheduledNotifications.push({
        id: notificationId,
        timeoutId,
        type: 'daily',
        scheduledTime
      });
      
      persistScheduledNotifications();
      console.log(`Scheduled daily summary for ${format(scheduledTime, 'PPpp')}`);
    });
    
    return 1; // Return a placeholder until the actual timeoutId is available
  } catch (error) {
    console.error('Failed to schedule daily summary:', error);
    return null;
  }
}

/**
 * Update task reminders when a task is updated
 */
export function updateTaskReminders(task: Task) {
  if (!task.dueDate || !task.timeSlot) return;
  
  // Cancel existing reminders for this task
  cancelTaskReminders(task.id);
  
  // Create a new Date from the task's due date and time slot
  const taskTime = new Date(task.dueDate);
  const [hours, minutes] = task.timeSlot.split(':').map(Number);
  taskTime.setHours(hours, minutes, 0, 0);
  
  // Schedule a new reminder
  scheduleTaskReminder(task.id, taskTime, task);
}

/**
 * Cancel all reminders for a specific task
 */
export function cancelTaskReminders(taskId: string) {
  const taskReminders = scheduledNotifications.filter(n => n.taskId === taskId);
  
  taskReminders.forEach(notification => {
    cancelScheduledNotification(notification.timeoutId);
  });
  
  // Remove from our tracking array
  scheduledNotifications = scheduledNotifications.filter(n => n.taskId !== taskId);
  persistScheduledNotifications();
}

/**
 * Cancel all scheduled notifications
 */
export function clearAllScheduledNotifications() {
  scheduledNotifications.forEach(notification => {
    cancelScheduledNotification(notification.timeoutId);
  });
  
  scheduledNotifications = [];
  persistScheduledNotifications();
}

/**
 * Generate a notification for today's tasks
 */
export function sendTodaySummaryNotification(tasks: Task[]) {
  // Filter tasks for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const todaysTasks = tasks.filter(task => {
    if (!task.dueDate) return false;
    const taskDate = new Date(task.dueDate);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate.getTime() === today.getTime();
  });
  
  if (todaysTasks.length === 0) {
    sendNotification({
      title: 'Daily Task Summary',
      body: 'You have no tasks scheduled for today.',
      icon: '/icons/icon-192x192.png'
    });
    return;
  }
  
  // Sort by time slot if available
  todaysTasks.sort((a, b) => {
    if (!a.timeSlot && !b.timeSlot) return 0;
    if (!a.timeSlot) return 1;
    if (!b.timeSlot) return -1;
    return a.timeSlot.localeCompare(b.timeSlot);
  });
  
  // Create a summary message
  let summaryBody = `You have ${todaysTasks.length} task${todaysTasks.length > 1 ? 's' : ''} today:\n`;
  
  // Add up to 5 tasks to the summary
  const displayTasks = todaysTasks.slice(0, 5);
  displayTasks.forEach(task => {
    const timePrefix = task.timeSlot ? `${task.timeSlot} - ` : '';
    summaryBody += `• ${timePrefix}${task.title}\n`;
  });
  
  if (todaysTasks.length > 5) {
    summaryBody += `... and ${todaysTasks.length - 5} more`;
  }
  
  sendNotification({
    title: 'Daily Task Summary',
    body: summaryBody,
    icon: '/icons/icon-192x192.png',
    requireInteraction: true,
    data: { type: 'daily-summary' }
  });
}

// Initialize the notification system
export function initNotificationSystem() {
  // Load scheduled notifications from storage
  loadScheduledNotifications();
  
  // Schedule the next daily summary if not already scheduled
  const hasDailySummary = scheduledNotifications.some(n => n.type === 'daily');
  if (!hasDailySummary) {
    scheduleDailySummary();
  }
}
