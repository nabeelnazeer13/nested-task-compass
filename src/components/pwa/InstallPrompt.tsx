
import React, { useState, useEffect } from 'react';
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
import { useIsMobile } from '@/hooks/use-mobile';

export const InstallPrompt = () => {
  const { isInstallable, promptInstall, isPWA } = usePWA();
  const [dismissed, setDismissed] = useState(false);
  const [showAgain, setShowAgain] = useState(false);
  const isMobile = useIsMobile();

  // Check if the prompt was previously dismissed
  useEffect(() => {
    const checkDismissed = () => {
      const lastDismissed = localStorage.getItem('installPromptDismissed');
      
      if (lastDismissed) {
        const dismissedTime = parseInt(lastDismissed);
        const now = Date.now();
        
        // If it was dismissed more than 3 days ago, show it again
        if (now - dismissedTime > 3 * 24 * 60 * 60 * 1000) {
          localStorage.removeItem('installPromptDismissed');
          setShowAgain(true);
        } else {
          setDismissed(true);
          setShowAgain(false);
        }
      }
    };
    
    checkDismissed();
  }, []);

  if (!isInstallable || isPWA || (dismissed && !showAgain)) {
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
        <CardTitle className="text-lg text-orange-800 flex items-center">
          <Download className="mr-2 h-5 w-5" />
          Install Khonja
        </CardTitle>
        <CardDescription className="text-orange-700">
          Add this app to your {isMobile ? 'home screen' : 'desktop'} for a better experience
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <ul className="list-disc pl-5 text-sm text-orange-700">
          <li>Works offline - access your tasks anytime</li>
          <li>Fast access without opening a browser</li>
          <li>Get notifications for due dates and reminders</li>
          <li>Full-screen experience with no browser interface</li>
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
