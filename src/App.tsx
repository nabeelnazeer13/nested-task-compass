
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { Toaster } from "@/components/ui/toaster";

import Index from './pages/Index';
import NotFound from './pages/NotFound';
import { PWAProvider } from './context/PWAContext';
import { ViewModeProvider } from './context/providers/ViewModeProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HybridTaskProvider } from './context/TaskContext';
import { TimeTrackingProvider } from './context/providers/TimeTrackingProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  console.log('App rendering with configured providers');
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <ThemeProvider attribute="class" defaultTheme="system">
            <ErrorBoundary>
              <HybridTaskProvider>
                <ViewModeProvider>
                  <PWAProvider>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </PWAProvider>
                </ViewModeProvider>
              </HybridTaskProvider>
            </ErrorBoundary>
          </ThemeProvider>
        </BrowserRouter>
      </TooltipProvider>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
