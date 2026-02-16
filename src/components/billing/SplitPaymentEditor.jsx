const SPLIT_MODES = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'upi', label: 'UPI' },
];

export const SplitPaymentEditor = ({
  splitPayments,
  onSplitPaymentsChange,
  grandTotal,
}) => {
  const handleModeChange = (index, mode) => {
    const next = [...splitPayments];
    next[index] = { ...next[index], mode };
    onSplitPaymentsChange(next);
  };

  const handleAmountChange = (index, value) => {
    const next = [...splitPayments];
    next[index] = { ...next[index], amount: parseFloat(value) || 0 };
    onSplitPaymentsChange(next);
  };

  const handleRemove = (index) => {
    if (splitPayments.length <= 2) return;
    const next = splitPayments.filter((_, i) => i !== index);
    onSplitPaymentsChange(next);
  };

  const handleAdd = () => {
    // Pick the first mode not already used
    const usedModes = splitPayments.map(s => s.mode);
    const available = SPLIT_MODES.find(m => !usedModes.includes(m.value));
    onSplitPaymentsChange([
      ...splitPayments,
      { mode: available?.value || 'cash', amount: 0 },
    ]);
  };

  const splitTotal = splitPayments.reduce((s, p) => s + (p.amount || 0), 0);
  const difference = Math.round((splitTotal - grandTotal) * 100) / 100;
  const isValid = Math.abs(difference) <= 0.01;

  return (
    <div>
      <div className="split-payment-rows">
        {splitPayments.map((payment, index) => (
          <div key={index} className="split-payment-row">
            <select
              value={payment.mode}
              onChange={(e) => handleModeChange(index, e.target.value)}
            >
              {SPLIT_MODES.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <input
              type="number"
              min="0"
              step="0.01"
              value={payment.amount || ''}
              onChange={(e) => handleAmountChange(index, e.target.value)}
              placeholder="₹ Amount"
            />
            {splitPayments.length > 2 && (
              <button
                type="button"
                className="split-payment-remove"
                onClick={() => handleRemove(index)}
                title="Remove"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      {splitPayments.length < 3 && (
        <button type="button" className="split-payment-add" onClick={handleAdd}>
          + Add another mode
        </button>
      )}

      <div className={`split-payment-total ${isValid ? 'valid' : 'invalid'}`}>
        <span>Split Total: ₹{splitTotal.toFixed(2)}</span>
        <span>
          {isValid
            ? '✓ Matches'
            : difference > 0
              ? `₹${difference.toFixed(2)} over`
              : `₹${Math.abs(difference).toFixed(2)} short`
          }
        </span>
      </div>
    </div>
  );
};
