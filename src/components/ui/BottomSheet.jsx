import { useEffect, useRef, useState } from 'react';
import './BottomSheet.css';

export const BottomSheet = ({
  isOpen,
  onClose,
  children,
  title,
  showHandle = true,
  maxHeight = '90vh',
  closeOnBackdrop = true,
}) => {
  const sheetRef = useRef(null);
  const contentRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleTouchStart = (e) => {
    if (e.target.closest('.bottom-sheet-handle') || !contentRef.current?.scrollTop) {
      setIsDragging(true);
      setStartY(e.touches[0].clientY);
      setCurrentY(0);
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const deltaY = e.touches[0].clientY - startY;
    if (deltaY > 0) {
      setCurrentY(deltaY);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (currentY > 100) {
      onClose();
    }
    setCurrentY(0);
  };

  const handleBackdropClick = () => {
    if (closeOnBackdrop) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="bottom-sheet-overlay" onClick={handleBackdropClick}>
      <div
        ref={sheetRef}
        className={`bottom-sheet ${isDragging ? 'dragging' : ''}`}
        style={{
          maxHeight,
          transform: currentY > 0 ? `translateY(${currentY}px)` : undefined,
        }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {showHandle && (
          <div className="bottom-sheet-handle">
            <div className="bottom-sheet-handle-bar" />
          </div>
        )}

        {title && (
          <div className="bottom-sheet-header">
            <h2 className="bottom-sheet-title">{title}</h2>
            <button
              className="bottom-sheet-close"
              onClick={onClose}
              aria-label="Close"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )}

        <div ref={contentRef} className="bottom-sheet-content">
          {children}
        </div>
      </div>
    </div>
  );
};
