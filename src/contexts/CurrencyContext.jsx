import { createContext, useContext } from 'react';
import { getCurrencySymbol } from '../utils/currency';

// Provides the active currency symbol to the dashboard subtree so nested
// billing/order components don't each have to receive `settings` by prop.
const CurrencyContext = createContext('₹');

export const CurrencyProvider = ({ settings, children }) => (
  <CurrencyContext.Provider value={getCurrencySymbol(settings)}>
    {children}
  </CurrencyContext.Provider>
);

// Returns the active currency symbol (defaults to ₹).
export const useCurrency = () => useContext(CurrencyContext);
