
import React, { useState } from 'react';
import { usePWA } from '@/context/PWAContext';
import { Bell, BellOff, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from "sonner";

export const NotificationSettings = () => {
  const { 
    notificationPermission, 
    requestNotificationPermission,
    notificationsEnabled,
    setNotificationsEnabled,
    scheduleDailyNotification
  } = usePWA();
  
  const [dailyTime, setDailyTime] = useState('08:00'); 
  
  const handleRequestPermission = async () => {
    if (notificationPermission === 'default') {
      const granted = await requestNotificationPermission();
      if (granted) {
        setNotificationsEnabled(true);
        toast.success('Notifications enabled successfully!');
      }
    }
  };
  
  const handleToggleNotifications = (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    if (enabled) {
      toast.success('Notifications enabled');
    } else {
      toast.info('Notifications disabled');
    }
  };
  
  const handleUpdateDailyTime = () => {
    scheduleDailyNotification(dailyTime);
    toast.success(`Daily notification set for ${dailyTime}`);
  };

  if (notificationPermission === 'denied') {
    return (
      <Card className="border border-red-200 bg-red-50 shadow-md mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-red-800 flex items-center">
            <BellOff className="mr-2 h-5 w-5" />
            Notifications Blocked
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-sm text-red-700">
            You have blocked notifications for this site. To receive task reminders and daily summaries, 
            please enable notifications in your browser settings.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (notificationPermission === 'default') {
    return (
      <Card className="border border-blue-200 bg-blue-50 shadow-md mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-blue-800 flex items-center">
            <Bell className="mr-2 h-5 w-5" />
            Enable Notifications
          </CardTitle>
          <CardDescription className="text-blue-700">
            Get reminders for upcoming tasks and daily summaries
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-sm text-blue-700">
            Allow Khonja to send you timely notifications about your tasks
          </p>
        </CardContent>
        <CardFooter className="pt-2">
          <Button 
            onClick={handleRequestPermission}
            className="bg-blue-600 hover:bg-blue-700 w-full" 
          >
            <Bell className="mr-2 h-4 w-4" />
            Enable Notifications
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="border mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Bell className="mr-2 h-5 w-5" />
          Notification Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="notifications-toggle" className="font-medium">Enable Notifications</Label>
            <p className="text-sm text-muted-foreground">Get task reminders and daily summaries</p>
          </div>
          <Switch 
            id="notifications-toggle"
            checked={notificationsEnabled}
            onCheckedChange={handleToggleNotifications}
          />
        </div>
        
        {notificationsEnabled && (
          <>
            <div className="space-y-2">
              <Label>Daily Summary Time</Label>
              <div className="flex gap-2">
                <Input
                  type="time"
                  value={dailyTime}
                  onChange={(e) => setDailyTime(e.target.value)}
                  className="w-32"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleUpdateDailyTime}
                  title="Update daily notification time"
                >
                  <Check className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                You'll receive a summary of your daily tasks at this time
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
