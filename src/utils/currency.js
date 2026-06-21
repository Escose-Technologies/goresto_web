// Single source of truth for currency symbols across the app.
export const CURRENCY_SYMBOLS = {
  USD: '$', EUR: '€', GBP: '£', INR: '₹', CAD: 'C$', AUD: 'A$',
};

// Accepts a settings object ({ currency, currencySymbol }) or a raw currency code.
// Falls back to ₹ so existing INR behaviour is preserved when nothing is set.
export const getCurrencySymbol = (input) => {
  if (!input) return '₹';
  if (typeof input === 'string') return CURRENCY_SYMBOLS[input] || '₹';
  return CURRENCY_SYMBOLS[input.currency] || input.currencySymbol || '₹';
};
