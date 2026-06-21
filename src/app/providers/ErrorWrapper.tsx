import type { ReactNode } from 'react';
import React, { Component } from 'react';
import { Card, Button } from '@heroui/react';
import { AlertCircle } from 'lucide-react';

import { addDangerToaster } from '../../shared/ui';

interface ErrorWrapperProps {
  children: ReactNode;
  fallbackTitle?: string;
}

interface ErrorWrapperState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorWrapper extends Component<ErrorWrapperProps, ErrorWrapperState> {
  state: ErrorWrapperState = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    addDangerToaster('Caught by ErrorWrapper:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReload = () => window.location.reload();

  handleCopy = () => {
    const text = `${this.state.error?.message}\n${this.state.errorInfo?.componentStack}`;
    navigator.clipboard.writeText(text);
    alert('Error copied to clipboard!');
  };

  handleReport = () => window.open('https://github.com/your-repo/issues/new', '_blank');

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallbackTitle } = this.props;

    if (!hasError) return children;

    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900">
        {/* Логотип */}
        <div className="mb-4">
          <img src="/assets/icon.png" alt="App Logo" className="h-16 w-16" />
        </div>

        <Card className="w-full max-w-2xl p-6 shadow-lg border border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <h2 className="text-xl font-bold text-white">
              {fallbackTitle || 'Oops! Something went wrong.'}
            </h2>
          </div>

          <p className="text-gray-300 mb-2">
            An unexpected error occurred. You can reload the app, copy the error, or report it.
          </p>

          <pre className="text-red-500 whitespace-pre-wrap max-h-80 overflow-y-auto p-2 bg-gray-800 rounded mb-4">
            {error?.message}
            {'\n'}
            {errorInfo?.componentStack}
          </pre>

          <div className="flex flex-wrap gap-2">
            <Button variant="flat" color="secondary" onClick={this.handleReload}>
              Reload
            </Button>
            <Button variant="flat" color="secondary" onClick={this.handleCopy}>
              Copy Error
            </Button>
            <Button variant="flat" color="secondary" onClick={this.handleReport}>
              Report
            </Button>
          </div>
        </Card>

        <p className="mt-4 text-gray-400 text-sm text-center">
          If the issue persists, please contact support or report the problem.
        </p>
      </div>
    );
  }
}
