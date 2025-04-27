
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({
      errorInfo
    });
    
    // Log the error to a service or analytics platform here
    toast({
      title: "Application Error",
      description: `An error occurred: ${error.message}`,
      variant: "destructive",
    });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  }

  private handleReload = () => {
    window.location.reload();
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="p-4 flex flex-col items-center justify-center min-h-[200px]">
          <Alert variant="destructive" className="max-w-lg">
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription className="mt-2">
              <p>{this.state.error?.message || 'An unexpected error occurred'}</p>
              
              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="mt-2 text-xs whitespace-pre-wrap">
                  <summary>Error details (for developers)</summary>
                  <pre className="overflow-auto p-2 bg-black/10 rounded mt-2">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
              
              <div className="flex gap-4 mt-4">
                <Button
                  variant="outline"
                  onClick={this.handleRetry}
                >
                  Try again
                </Button>
                <Button
                  variant="default"
                  onClick={this.handleReload}
                  className="flex items-center"
                >
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Reload page
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
