import React, { useEffect } from 'react';
import { PhX } from '../icons/PhosphorIcons';

interface ModalSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const ModalSheet: React.FC<ModalSheetProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    // 40% ink scrim (Design System Ch 7.9)
    <div className="fixed inset-0 z-[999] flex justify-end bg-ink/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative flex h-full w-[460px] max-w-full animate-slide-in flex-col overflow-hidden rounded-l-sheet bg-paper shadow-float"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab handle */}
        <div className="flex justify-center pt-3">
          <div className="h-1.25 w-10 rounded-full bg-line" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between border-b border-line px-6 pb-4 pt-5">
          <div>
            <h2 className="m-0 text-xl font-semibold text-ink">{title}</h2>
            {subtitle && <p className="mt-1 text-[13px] text-slate">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-9 cursor-pointer items-center justify-center rounded-full border-none bg-transparent hover:bg-mist"
          >
            <PhX size={18} color="#5B6B6E" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
};
