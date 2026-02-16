const PAYMENT_MODES = [
  { value: 'cash', label: 'Cash', icon: '💵' },
  { value: 'card', label: 'Card', icon: '💳' },
  { value: 'upi', label: 'UPI', icon: '📱' },
  { value: 'split', label: 'Split', icon: '⇄' },
];

export const PaymentModeSelector = ({ paymentMode, onPaymentModeChange }) => {
  return (
    <div className="payment-mode-section">
      <h4>Payment</h4>
      <div className="payment-mode-buttons">
        {PAYMENT_MODES.map(mode => (
          <button
            key={mode.value}
            type="button"
            className={`payment-mode-btn${paymentMode === mode.value ? ' active' : ''}`}
            onClick={() => onPaymentModeChange(mode.value)}
          >
            <span className="payment-mode-btn-icon">{mode.icon}</span>
            {mode.label}
          </button>
        ))}
      </div>
    </div>
  );
};
