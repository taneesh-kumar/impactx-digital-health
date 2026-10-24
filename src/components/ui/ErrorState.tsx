import React from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Encountered an application error',
  message = 'An unexpected problem occurred while loading or verifying clinical records. The system preserved record integrity.',
  onRetry,
  className = '',
}) => {
  return (
    <div className={`rounded-lg border border-red-200 bg-red-50/50 p-6 text-center ${className}`}>
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 mb-3">
        <AlertOctagon className="h-6 w-6" />
      </div>
      <h4 className="text-base font-semibold text-red-900">{title}</h4>
      <p className="mt-1.5 text-xs text-red-700 max-w-md mx-auto">{message}</p>
      {onRetry && (
        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={onRetry} className="border-red-300 text-red-800 hover:bg-red-100">
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            Retry Request
          </Button>
        </div>
      )}
    </div>
  );
};
