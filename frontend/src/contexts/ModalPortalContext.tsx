import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { View, StyleSheet, Platform } from 'react-native';

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
      <View style={styles.portalContainer} pointerEvents="box-none">
        {modalElements}
      </View>
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
