
import React, { useState, useEffect } from 'react';
import { usePWAContext } from '@/context/PWAContext';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const NotificationPermissionPrompt = () => {
  const { notificationPermission, requestNotificationPermission } = usePWAContext();
  const [dismissed, setDismissed] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    const notificationPromptShown = localStorage.getItem('notificationPromptShown');
    if (notificationPromptShown) {
      setHasShown(true);
    }
  }, []);

  // If permission is already granted or denied, or the prompt has been dismissed
  if (notificationPermission !== 'default' || dismissed || hasShown) {
    return null;
  }

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setDismissed(true);
    }
    localStorage.setItem('notificationPromptShown', 'true');
    setHasShown(true);
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('notificationPromptShown', 'true');
    setHasShown(true);
  };

  return (
    <Card className="border border-blue-200 bg-blue-50 shadow-md mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-blue-800">Enable Notifications</CardTitle>
        <CardDescription className="text-blue-700">
          Get reminders for upcoming tasks and important due dates
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-blue-700">
          Allow Khonja to send you notifications to stay on top of your tasks
        </p>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <Button variant="ghost" size="sm" onClick={handleDismiss}>
          Not Now
        </Button>
        <Button 
          onClick={handleRequestPermission} 
          className="bg-blue-600 hover:bg-blue-700" 
          size="sm"
        >
          <Bell className="mr-2 h-4 w-4" />
          Enable Notifications
        </Button>
      </CardFooter>
    </Card>
  );
};
