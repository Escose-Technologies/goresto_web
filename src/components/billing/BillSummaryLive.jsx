import { getCurrencySymbol } from '../../utils/currency';

export const BillSummaryLive = ({ calculation, settings }) => {
  if (!calculation) return null;
  const cur = getCurrencySymbol(settings);

  const {
    subtotal = 0,
    totalItemDiscount = 0,
    afterItemDiscount = 0,
    billDiscountType,
    billDiscountValue = 0,
    billDiscountAmount = 0,
    afterAllDiscounts = 0,
    serviceChargeRate = 0,
    serviceChargeAmount = 0,
    packagingCharge = 0,
    taxableAmount = 0,
    cgstRate = 0,
    cgstAmount = 0,
    sgstRate = 0,
    sgstAmount = 0,
    totalTax = 0,
    roundOff = 0,
    grandTotal = 0,
  } = calculation;

  const isComposition = settings?.gstScheme === 'composition';

  return (
    <div className="bill-summary-live">
      <h4>Bill Summary</h4>

      <div className="bill-summary-row">
        <span>Subtotal</span>
        <span>{cur}{subtotal.toFixed(2)}</span>
      </div>

      {totalItemDiscount > 0 && (
        <div className="bill-summary-row discount">
          <span>Item Discounts</span>
          <span>-{cur}{totalItemDiscount.toFixed(2)}</span>
        </div>
      )}

      {totalItemDiscount > 0 && (
        <div className="bill-summary-row">
          <span>After Item Discounts</span>
          <span>{cur}{afterItemDiscount.toFixed(2)}</span>
        </div>
      )}

      {billDiscountAmount > 0 && (
        <div className="bill-summary-row discount">
          <span>
            Bill Discount
            {billDiscountType === 'percentage' ? ` (${billDiscountValue}%)` : ` (Flat)`}
          </span>
          <span>-{cur}{billDiscountAmount.toFixed(2)}</span>
        </div>
      )}

      {(totalItemDiscount > 0 || billDiscountAmount > 0) && (
        <div className="bill-summary-row">
          <span>After All Discounts</span>
          <span>{cur}{afterAllDiscounts.toFixed(2)}</span>
        </div>
      )}

      {serviceChargeAmount > 0 && (
        <div className="bill-summary-row charge">
          <span>Service Charge ({serviceChargeRate}%)</span>
          <span>+{cur}{serviceChargeAmount.toFixed(2)}</span>
        </div>
      )}

      {packagingCharge > 0 && (
        <div className="bill-summary-row charge">
          <span>Packaging Charge</span>
          <span>+{cur}{packagingCharge.toFixed(2)}</span>
        </div>
      )}

      <hr className="bill-summary-divider" />

      <div className="bill-summary-row">
        <span>Taxable Amount</span>
        <span>{cur}{taxableAmount.toFixed(2)}</span>
      </div>

      {!isComposition && (
        <>
          <div className="bill-summary-row tax">
            <span>CGST ({cgstRate}%)</span>
            <span>{cur}{cgstAmount.toFixed(2)}</span>
          </div>
          <div className="bill-summary-row tax">
            <span>SGST ({sgstRate}%)</span>
            <span>{cur}{sgstAmount.toFixed(2)}</span>
          </div>
        </>
      )}

      {roundOff !== 0 && (
        <div className="bill-summary-row round-off">
          <span>Round Off</span>
          <span>{roundOff > 0 ? '+' : ''}{cur}{roundOff.toFixed(2)}</span>
        </div>
      )}

      <hr className="bill-summary-divider" />

      <div className="bill-summary-total">
        <span>GRAND TOTAL</span>
        <span>{cur}{grandTotal.toFixed(2)}</span>
      </div>

      {serviceChargeAmount > 0 && (
        <div className="bill-summary-note">
          Service charge is voluntary and can be removed on request.
        </div>
      )}

      {isComposition && (
        <div className="bill-summary-scheme-note">
          Composition taxable person, not eligible to collect tax on supplies.
        </div>
      )}
    </div>
  );
};
