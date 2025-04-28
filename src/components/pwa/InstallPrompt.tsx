
import React, { useState } from 'react';
import { usePWA } from '@/context/PWAContext';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const InstallPrompt = () => {
  const { isInstallable, promptInstall } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  if (!isInstallable || dismissed) {
    return null;
  }

  const handleInstall = async () => {
    try {
      await promptInstall();
    } catch (error) {
      console.error('Error installing the app:', error);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('installPromptDismissed', Date.now().toString());
  };

  return (
    <Card className="border border-orange-200 bg-orange-50 shadow-md mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-orange-800">Install Khonja</CardTitle>
        <CardDescription className="text-orange-700">
          Add this app to your home screen for a better experience
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <ul className="list-disc pl-5 text-sm text-orange-700">
          <li>Works offline</li>
          <li>Fast access to your tasks</li>
          <li>Notifications for due dates</li>
          <li>No browser interface</li>
        </ul>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <Button variant="ghost" size="sm" onClick={handleDismiss}>
          Maybe Later
        </Button>
        <Button 
          onClick={handleInstall} 
          className="bg-orange-600 hover:bg-orange-700" 
          size="sm"
        >
          <Download className="mr-2 h-4 w-4" />
          Install App
        </Button>
      </CardFooter>
    </Card>
  );
};
