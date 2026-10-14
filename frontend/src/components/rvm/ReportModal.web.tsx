import React, { useState, useEffect, useCallback } from 'react';
import { Rvm, RvmStatus, QueueLength } from '../../types';
import { STATUS_CONFIG } from '../../utils/statusColor';

interface Props {
  visible: boolean;
  rvm: Rvm | null;
  onClose: () => void;
  onSubmit: (status: RvmStatus, queueLength: QueueLength | null) => Promise<void>;
}

const STATUS_OPTIONS: RvmStatus[] = ['AVAILABLE', 'BUSY', 'BROKEN'];

const QUEUE_OPTIONS: { value: QueueLength; label: string; description: string }[] = [
  { value: 'NONE', label: 'No queue', description: 'Empty' },
  { value: 'SHORT', label: 'Short', description: '1-3 people' },
  { value: 'LONG', label: 'Long', description: '5+ people' },
];

export function ReportModal({ visible, rvm, onClose, onSubmit }: Props) {
  const [selectedStatus, setSelectedStatus] = useState<RvmStatus | null>(null);
  const [queueLength, setQueueLength] = useState<QueueLength | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (visible) {
      setIsRendered(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setIsRendered(false);
        setSelectedStatus(null);
        setError(null);
        setShowSuccess(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const close = useCallback(() => {
    setIsAnimating(false);
    setTimeout(() => {
      setSelectedStatus(null);
      setQueueLength(null);
      setError(null);
      setShowSuccess(false);
      onClose();
    }, 200);
  }, [onClose]);

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(close, 1800);
      return () => clearTimeout(timer);
    }
  }, [showSuccess, close]);

  const handleSubmit = async () => {
    if (!selectedStatus) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(selectedStatus, queueLength);
      setShowSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !showSuccess) {
      close();
    }
  }, [close, showSuccess]);

  if (!isRendered || !rvm) return null;

  return (
    <div style={styles.container} onClick={handleBackdropClick}>
      <div
        style={{
          ...styles.backdrop,
          opacity: isAnimating ? 1 : 0,
        }}
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

        {showSuccess ? (
          <div style={styles.successContainer}>
            <div style={styles.successIcon}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div style={styles.successTitle}>Thank You!</div>
            <div style={styles.successMessage}>
              Your report helps keep information accurate for everyone.
            </div>
          </div>
        ) : (
          <div style={styles.content}>
            {/* Header */}
            <div style={styles.header}>
              <div style={styles.headerText}>
                <div style={styles.title}>Update Status</div>
                <div style={styles.rvmName}>{rvm.name}</div>
              </div>
              <button onClick={close} style={styles.closeButton}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Status Options */}
            <div style={styles.optionsContainer}>
              {STATUS_OPTIONS.map((status) => {
                const config = STATUS_CONFIG[status];
                const isSelected = selectedStatus === status;

                return (
                  <button
                    key={status}
                    style={{
                      ...styles.option,
                      ...(isSelected ? styles.optionSelected : {}),
                      ...(isSelected ? { borderColor: config.color } : {}),
                    }}
                    onClick={() => setSelectedStatus(status)}
                  >
                    <div
                      style={{
                        ...styles.statusDot,
                        backgroundColor: config.color,
                        ...(isSelected ? styles.statusDotSelected : {}),
                      }}
                    />
                    <span
                      style={{
                        ...styles.optionText,
                        ...(isSelected ? { color: config.color, fontWeight: '600' } : {}),
                      }}
                    >
                      {config.label}
                    </span>
                    {isSelected && (
                      <div style={{ ...styles.checkCircle, backgroundColor: config.color }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Queue Length (Optional) */}
            <div style={styles.queueSection}>
              <div style={styles.queueTitle}>Queue Length (optional)</div>
              <div style={styles.queueOptions}>
                {QUEUE_OPTIONS.map((option) => {
                  const isSelected = queueLength === option.value;
                  return (
                    <button
                      key={option.value}
                      style={{
                        ...styles.queueOption,
                        ...(isSelected ? styles.queueOptionSelected : {}),
                      }}
                      onClick={() => setQueueLength(isSelected ? null : option.value)}
                    >
                      <span
                        style={{
                          ...styles.queueOptionLabel,
                          ...(isSelected ? styles.queueOptionLabelSelected : {}),
                        }}
                      >
                        {option.label}
                      </span>
                      <span
                        style={{
                          ...styles.queueOptionDesc,
                          ...(isSelected ? styles.queueOptionDescSelected : {}),
                        }}
                      >
                        {option.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={styles.errorContainer}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span style={styles.errorText}>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              style={{
                ...styles.submitButton,
                ...(!selectedStatus ? styles.submitButtonDisabled : {}),
              }}
              onClick={handleSubmit}
              disabled={!selectedStatus || isSubmitting}
            >
              {isSubmitting ? (
                <div style={styles.spinner} />
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                  <span style={styles.submitText}>Submit Report</span>
                </>
              )}
            </button>

            {/* Disclaimer */}
            <div style={styles.disclaimer}>
              Reports are anonymous and help others find working machines.
            </div>
          </div>
        )}
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
    zIndex: 1001,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    transition: 'opacity 0.3s ease-out',
  },
  sheet: {
    position: 'relative',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    boxShadow: '0 -8px 24px rgba(0, 0, 0, 0.12)',
    transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
    paddingBottom: 24,
  },
  handleContainer: {
    display: 'flex',
    justifyContent: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  content: {
    padding: '8px 24px 0',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerText: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#059669',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    marginBottom: 4,
  },
  rvmName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: '-0.4px',
  },
  closeButton: {
    padding: 4,
    marginTop: -2,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  optionsContainer: {
    marginBottom: 20,
  },
  option: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '16px 18px',
    borderRadius: 14,
    border: '1.5px solid #F3F4F6',
    backgroundColor: '#FAFAFA',
    marginBottom: 10,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  optionSelected: {
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 14,
    transition: 'all 0.15s ease',
  },
  statusDotSelected: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#4B5563',
    textAlign: 'left',
    transition: 'all 0.15s ease',
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: '12px 14px',
    borderRadius: 10,
    marginBottom: 16,
    gap: 10,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#DC2626',
    lineHeight: '20px',
  },
  submitButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: '#059669',
    padding: 16,
    borderRadius: 14,
    border: 'none',
    gap: 10,
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
    transition: 'all 0.15s ease',
  },
  submitButtonDisabled: {
    backgroundColor: '#D1D5DB',
    boxShadow: 'none',
    cursor: 'not-allowed',
  },
  submitText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  disclaimer: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: '18px',
  },
  successContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '48px 24px',
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#059669',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    boxShadow: '0 8px 16px rgba(5, 150, 105, 0.35)',
  },
  successTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    letterSpacing: '-0.5px',
  },
  successMessage: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: '22px',
    maxWidth: 280,
  },
  spinner: {
    width: 20,
    height: 20,
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTopColor: '#FFFFFF',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  queueSection: {
    marginBottom: 20,
  },
  queueTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
  },
  queueOptions: {
    display: 'flex',
    gap: 10,
  },
  queueOption: {
    flex: 1,
    padding: '12px 8px',
    borderRadius: 12,
    border: '1.5px solid #E5E7EB',
    backgroundColor: '#FAFAFA',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  queueOptionSelected: {
    borderColor: '#059669',
    backgroundColor: '#ECFDF5',
    borderWidth: 2,
  },
  queueOptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 2,
  },
  queueOptionLabelSelected: {
    color: '#059669',
  },
  queueOptionDesc: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  queueOptionDescSelected: {
    color: '#059669',
  },
};
