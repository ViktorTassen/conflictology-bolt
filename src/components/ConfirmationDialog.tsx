import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationDialogProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationDialog({
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel
}: ConfirmationDialogProps) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center animate-in fade-in">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      
      {/* Dialog box */}
      <div className="relative bg-zinc-900 rounded-xl border border-zinc-800/50 w-full max-w-sm mx-4 shadow-2xl animate-in fade-in zoom-in-95">
        {/* Warning icon */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-6">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
          </div>
        </div>

        <div className="p-6 pt-8">
          {/* Title */}
          <h3 className="text-lg font-bold text-white text-center mb-2">{title}</h3>
          
          {/* Message */}
          <p className="text-zinc-400 text-center mb-6">
            {message}
          </p>
          
          {/* Buttons */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg bg-zinc-800 text-white hover:bg-zinc-700 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-500 transition-colors"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}