import React, { useEffect } from 'react';
import { PhX } from '../icons/PhosphorIcons';

interface ModalSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: number | string;
}

export const ModalSheet: React.FC<ModalSheetProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = 460,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(11, 31, 34, 0.40)', // 40% ink scrim (Design System Ch 7.9)
        zIndex: 999,
        display: 'flex',
        justifyContent: 'flex-end',
        backdropFilter: 'blur(4px)',
        transition: 'opacity 0.2s ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: typeof width === 'number' ? `${width}px` : width,
          maxWidth: '100%',
          height: '100%',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 12px 32px -10px rgba(11,31,34,.28)',
          borderTopLeftRadius: '28px',
          borderBottomLeftRadius: '28px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          animation: 'slideInRight 0.3s cubic-bezier(.2,.8,.2,1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab Handle bar for organic mobile/desktop affordance (Ch 7.9) */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '5px',
              borderRadius: '9999px',
              backgroundColor: '#DDE5E1',
            }}
          />
        </div>

        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            padding: '20px 24px 16px 24px',
            borderBottom: '1px solid #DDE5E1',
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: 600,
                color: '#0B1F22',
                fontFamily: 'var(--ui)',
              }}
            >
              {title}
            </h2>
            {subtitle && (
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#5B6B6E' }}>
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-icon btn-icon-ghost"
            style={{ width: '36px', height: '36px' }}
          >
            <PhX size={18} color="#5B6B6E" />
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

