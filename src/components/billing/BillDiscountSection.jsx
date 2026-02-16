import { useEffect } from 'react';

export const BillDiscountSection = ({
  activePresets,
  billDiscountType,
  billDiscountValue,
  billDiscountAmount,
  discountPresetId,
  discountReason,
  afterItemDiscount,
  onBillDiscountChange,
}) => {
  const handlePresetSelect = (preset) => {
    if (discountPresetId === preset.id) {
      // Deselect
      onBillDiscountChange({
        billDiscountType: null,
        billDiscountValue: 0,
        discountPresetId: null,
        discountReason: '',
      });
    } else {
      onBillDiscountChange({
        billDiscountType: preset.discountType,
        billDiscountValue: preset.discountValue,
        discountPresetId: preset.id,
        discountReason: preset.name,
      });
    }
  };

  const handleTypeChange = (type) => {
    onBillDiscountChange({
      billDiscountType: type,
      billDiscountValue: billDiscountValue || 0,
      discountPresetId: null,
      discountReason: discountReason || '',
    });
  };

  const handleValueChange = (value) => {
    const num = parseFloat(value) || 0;
    onBillDiscountChange({
      billDiscountType: billDiscountType || 'percentage',
      billDiscountValue: num,
      discountPresetId: discountPresetId,
      discountReason: discountReason || '',
    });
  };

  const handleReasonChange = (reason) => {
    onBillDiscountChange({
      billDiscountType,
      billDiscountValue,
      discountPresetId,
      discountReason: reason,
    });
  };

  const handleClear = () => {
    onBillDiscountChange({
      billDiscountType: null,
      billDiscountValue: 0,
      discountPresetId: null,
      discountReason: '',
    });
  };

  const hasDiscount = billDiscountType && billDiscountValue > 0;

  return (
    <div className="bill-discount-section">
      <h4>Bill Discount</h4>

      {/* Preset buttons */}
      {activePresets && activePresets.length > 0 && (
        <div className="bill-discount-presets">
          {activePresets.map(preset => (
            <button
              key={preset.id}
              type="button"
              className={`bill-discount-preset-btn${discountPresetId === preset.id ? ' active' : ''}`}
              onClick={() => handlePresetSelect(preset)}
            >
              {preset.name} ({preset.discountType === 'percentage' ? `${preset.discountValue}%` : `₹${preset.discountValue}`})
            </button>
          ))}
        </div>
      )}

      {/* Type selection */}
      <div className="bill-discount-type-row">
        <label>
          <input
            type="radio"
            name="billDiscountType"
            checked={billDiscountType === 'percentage' || !billDiscountType}
            onChange={() => handleTypeChange('percentage')}
          />
          Percentage
        </label>
        <label>
          <input
            type="radio"
            name="billDiscountType"
            checked={billDiscountType === 'flat'}
            onChange={() => handleTypeChange('flat')}
          />
          Flat Amount
        </label>
        {hasDiscount && (
          <button type="button" className="bill-discount-clear" onClick={handleClear}>
            Clear
          </button>
        )}
      </div>

      {/* Value input */}
      <div className="bill-discount-value-row">
        <input
          type="number"
          min="0"
          max={billDiscountType === 'percentage' ? 100 : afterItemDiscount}
          step={billDiscountType === 'percentage' ? 1 : 0.01}
          value={billDiscountValue || ''}
          onChange={(e) => handleValueChange(e.target.value)}
          placeholder={billDiscountType === 'flat' ? '₹ Amount' : '%'}
        />
        <span>{billDiscountType === 'flat' ? '₹' : '%'}</span>
        {hasDiscount && (
          <span className="bill-discount-amount">-₹{(billDiscountAmount || 0).toFixed(2)}</span>
        )}
      </div>

      {/* Reason */}
      {hasDiscount && (
        <div className="bill-discount-reason">
          <input
            type="text"
            value={discountReason || ''}
            onChange={(e) => handleReasonChange(e.target.value)}
            placeholder="Discount reason (optional)"
            maxLength={200}
          />
        </div>
      )}
    </div>
  );
};
