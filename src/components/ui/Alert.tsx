import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'warning' | 'danger' | 'success';
  title?: string;
  onDismiss?: () => void;
}

export const Alert: React.FC<AlertProps> = ({
  className = '',
  variant = 'info',
  title,
  onDismiss,
  children,
  ...props
}) => {
  const variantStyles = {
    info: 'bg-blue-50 border-blue-200 text-blue-900',
    warning: 'bg-amber-50 border-amber-300 text-amber-900',
    danger: 'bg-red-50 border-red-200 text-red-900',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
  }[variant];

  const Icon = {
    info: Info,
    warning: AlertTriangle,
    danger: AlertCircle,
    success: CheckCircle2,
  }[variant];

  const iconColor = {
    info: 'text-blue-600',
    warning: 'text-amber-600',
    danger: 'text-red-600',
    success: 'text-emerald-600',
  }[variant];

  return (
    <div
      role="alert"
      className={`relative flex items-start gap-3 rounded border p-3.5 text-sm ${variantStyles} ${className}`}
      {...props}
    >
      <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
      <div className="flex-1">
        {title && <h5 className="font-semibold text-sm leading-tight mb-1">{title}</h5>}
        <div className="text-xs leading-relaxed text-slate-700">{children}</div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
