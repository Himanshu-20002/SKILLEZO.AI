'use client';

import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AlertTriangle, X } from 'lucide-react';

export interface ResumeSwitchConfirmDialogProps {
  isOpen: boolean;
  onStay: () => void;
  onConfirmSwitch: () => void;
}

export const ResumeSwitchConfirmDialog: React.FC<ResumeSwitchConfirmDialogProps> = ({
  isOpen,
  onStay,
  onConfirmSwitch,
}) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onStay()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl duration-200 rounded-2xl text-slate-900 dark:text-slate-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" aria-hidden="true" />
              </div>
              <Dialog.Title className="text-base sm:text-lg font-bold">
                Unsaved Changes
              </Dialog.Title>
            </div>
            <Dialog.Close
              onClick={onStay}
              className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </Dialog.Close>
          </div>

          <Dialog.Description className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            You have unsaved changes that will be lost if you switch variants without saving. Would you like to stay here, or discard your local changes and switch?
          </Dialog.Description>

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onStay}
              className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-300 dark:border-slate-700 bg-transparent text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Stay Here
            </button>
            <button
              type="button"
              onClick={onConfirmSwitch}
              className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer shadow-xs"
            >
              Switch Resume
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
