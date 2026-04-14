import { createContext, useContext, type PropsWithChildren } from 'react';

type CheckoutFlowContextValue = {
  openCheckout: () => void;
};

const CheckoutFlowContext = createContext<CheckoutFlowContextValue | undefined>(undefined);

export function CheckoutFlowProvider({
  children,
  value,
}: PropsWithChildren<{ value: CheckoutFlowContextValue }>) {
  return <CheckoutFlowContext.Provider value={value}>{children}</CheckoutFlowContext.Provider>;
}

export function useCheckoutFlow() {
  const context = useContext(CheckoutFlowContext);
  if (!context) {
    throw new Error('useCheckoutFlow must be used within CheckoutFlowProvider');
  }
  return context;
}
