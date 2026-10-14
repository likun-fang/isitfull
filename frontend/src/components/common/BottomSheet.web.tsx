import React, { useEffect, useState } from 'react';

interface Props {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapPoints?: number[];
}

export function BottomSheet({ visible, onClose, children }: Props) {
  const [isRendered, setIsRendered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (visible) {
      setIsRendered(true);
      // Small delay to trigger CSS transition
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setIsRendered(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!isRendered) {
    return null;
  }

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
      <div
        style={{
          ...styles.backdrop,
          opacity: isAnimating ? 1 : 0,
        }}
        onClick={onClose}
      />
      <div
        style={{
          ...styles.sheet,
          transform: isAnimating ? 'translateY(0)' : 'translateY(100%)',
        }}
      >
        <div style={styles.handleContainer}>
          <div style={styles.handle} />
        </div>
        {children}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    transition: 'opacity 0.3s ease-out',
  },
  sheet: {
    position: 'relative',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: 100,
    boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.15)',
    transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
    paddingBottom: 24,
  },
  handleContainer: {
    display: 'flex',
    justifyContent: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
  },
};
