import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import ReactDOM from 'react-dom';

interface ModalPortalContextType {
  registerModal: (id: string, element: ReactNode) => void;
  unregisterModal: (id: string) => void;
}

const ModalPortalContext = createContext<ModalPortalContextType | null>(null);

export function useModalPortal() {
  const context = useContext(ModalPortalContext);
  if (!context) {
    throw new Error('useModalPortal must be used within a ModalPortalProvider');
  }
  return context;
}

interface ModalPortalProviderProps {
  children: ReactNode;
}

// Web-specific portal that renders to document.body using ReactDOM.createPortal
function WebPortal({ children }: { children: ReactNode }) {
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Create a dedicated portal container in document.body
    let container = document.getElementById('modal-portal-root');
    if (!container) {
      container = document.createElement('div');
      container.id = 'modal-portal-root';
      container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 999999;
        pointer-events: none;
      `;
      document.body.appendChild(container);
    }
    setPortalRoot(container);

    return () => {
      // Cleanup: remove container if empty
      if (container && container.childNodes.length === 0) {
        container.remove();
      }
    };
  }, []);

  if (!portalRoot) {
    return null;
  }

  return ReactDOM.createPortal(children, portalRoot);
}

export function ModalPortalProvider({ children }: ModalPortalProviderProps) {
  const [modals, setModals] = useState<Map<string, ReactNode>>(new Map());

  const registerModal = useCallback((id: string, element: ReactNode) => {
    setModals((prev) => {
      const next = new Map(prev);
      next.set(id, element);
      return next;
    });
  }, []);

  const unregisterModal = useCallback((id: string) => {
    setModals((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const modalElements = Array.from(modals.values());

  return (
    <ModalPortalContext.Provider value={{ registerModal, unregisterModal }}>
      {children}
      <WebPortal>
        <View style={styles.portalContainer} pointerEvents="box-none">
          {modalElements}
        </View>
      </WebPortal>
    </ModalPortalContext.Provider>
  );
}

const styles = StyleSheet.create({
  portalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'box-none',
  },
});
