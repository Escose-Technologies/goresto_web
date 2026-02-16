import { useState, useCallback, useEffect } from 'react';
import { billService } from '../../services/apiService';
import { TouchButton } from '../ui/TouchButton';
import './DailySummary.css';

const fmt = (n) => (Number(n) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtInt = (n) => (Number(n) || 0).toLocaleString('en-IN');

const RANGE_PRESETS = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'custom', label: 'Custom Range' },
];

function getDateRange(preset) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const toISO = (d) => d.toISOString().split('T')[0];

  switch (preset) {
    case 'today':
      return { from: toISO(today), to: toISO(today) };
    case 'yesterday': {
      const y = new Date(today.getTime() - 86400000);
      return { from: toISO(y), to: toISO(y) };
    }
    case 'week': {
      const day = today.getDay();
      const mon = new Date(today.getTime() - ((day === 0 ? 6 : day - 1) * 86400000));
      return { from: toISO(mon), to: toISO(today) };
    }
    case 'month':
      return { from: toISO(new Date(now.getFullYear(), now.getMonth(), 1)), to: toISO(today) };
    default:
      return { from: toISO(today), to: toISO(today) };
  }
}

const PAYMENT_LABELS = { cash: 'Cash', card: 'Card', upi: 'UPI', split: 'Split' };

export const DailySummary = ({ restaurantId, toast }) => {
  const [preset, setPreset] = useState('today');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const loadSummary = useCallback(async () => {
    try {
      setLoading(true);
      let range;
      if (preset === 'custom') {
        if (!customFrom || !customTo) return;
        range = { from: customFrom, to: customTo };
      } else {
        range = getDateRange(preset);
      }
      const data = await billService.getSummary(restaurantId, range.from, range.to);
      setSummary(data);
    } catch (err) {
      toast?.error('Failed to load summary: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [restaurantId, preset, customFrom, customTo, toast]);

  useEffect(() => {
    if (preset !== 'custom') loadSummary();
  }, [preset]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCustomLoad = () => {
    if (!customFrom || !customTo) {
      toast?.error('Please select both dates');
      return;
    }
    loadSummary();
  };

  const handleExportCsv = async () => {
    if (!summary) return;
    setExporting(true);
    try {
      let range;
      if (preset === 'custom') {
        range = { from: customFrom, to: customTo };
      } else {
        range = getDateRange(preset);
      }
      // Fetch all bills for the period (no pagination)
      const result = await billService.getBills(restaurantId, {
        from: new Date(range.from + 'T00:00:00').toISOString(),
        to: new Date(range.to + 'T23:59:59').toISOString(),
        limit: 10000,
      });
      const bills = result.bills || result || [];

      const headers = [
        'Bill No', 'Date', 'Table', 'Customer', 'Mobile',
        'Subtotal', 'Item Discount', 'Bill Discount', 'After Discounts',
        'Service Charge', 'Taxable Amount', 'CGST', 'SGST', 'Total Tax',
        'Round Off', 'Grand Total', 'Payment Mode', 'Status',
      ];

      const rows = bills.map(b => [
        b.billNumber,
        new Date(b.createdAt).toLocaleString('en-IN'),
        b.tableNumber,
        b.customerName || '',
        b.customerMobile || '',
        b.subtotal,
        b.totalItemDiscount,
        b.billDiscountAmount,
        b.afterAllDiscounts,
        b.serviceChargeAmount,
        b.taxableAmount,
        b.cgstAmount,
        b.sgstAmount,
        b.totalTax,
        b.roundOff,
        b.grandTotal,
        b.paymentMode,
        b.paymentStatus,
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')),
      ].join('\n');

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sales_report_${range.from}_to_${range.to}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast?.success('CSV exported successfully');
    } catch (err) {
      toast?.error('Export failed: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  const o = summary?.overview || {};
  const pay = summary?.paymentBreakdown || {};
  const disc = summary?.discountBreakdown || {};
  const unpaid = summary?.unpaidBills || {};

  return (
    <div className="daily-summary">
      {/* Range selector */}
      <div className="summary-range-bar">
        <div className="summary-range-presets">
          {RANGE_PRESETS.map(p => (
            <button
              key={p.value}
              className={`summary-range-btn ${preset === p.value ? 'active' : ''}`}
              onClick={() => setPreset(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>
        {preset === 'custom' && (
          <div className="summary-custom-range">
            <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} />
            <span>to</span>
            <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} />
            <TouchButton variant="primary" size="sm" onClick={handleCustomLoad}>Load</TouchButton>
          </div>
        )}
        <div className="summary-export">
          <TouchButton variant="secondary" size="sm" onClick={handleExportCsv} disabled={!summary || exporting}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {exporting ? 'Exporting...' : 'Export CSV'}
          </TouchButton>
        </div>
      </div>

      {loading ? (
        <div className="summary-loading">Loading report...</div>
      ) : !summary ? (
        <div className="summary-empty">No data available</div>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="summary-overview">
            <div className="summary-card summary-card-revenue">
              <div className="summary-card-label">Revenue</div>
              <div className="summary-card-value">{fmt(o.totalRevenue)}</div>
            </div>
            <div className="summary-card">
              <div className="summary-card-label">Bills</div>
              <div className="summary-card-value">{fmtInt(o.activeBills)}</div>
              {o.cancelledBills > 0 && (
                <div className="summary-card-sub">{o.cancelledBills} cancelled</div>
              )}
            </div>
            <div className="summary-card">
              <div className="summary-card-label">Avg Bill</div>
              <div className="summary-card-value">{fmt(o.averageBillValue)}</div>
            </div>
            <div className="summary-card summary-card-tax">
              <div className="summary-card-label">Tax Collected</div>
              <div className="summary-card-value">{fmt(o.totalTaxCollected)}</div>
              <div className="summary-card-sub">
                CGST: {fmt(o.totalCgst)} | SGST: {fmt(o.totalSgst)}
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-card-label">Service Charge</div>
              <div className="summary-card-value">{fmt(o.totalServiceCharge)}</div>
            </div>
            <div className="summary-card summary-card-discount">
              <div className="summary-card-label">Total Discounts</div>
              <div className="summary-card-value">{fmt(o.totalDiscount)}</div>
              <div className="summary-card-sub">
                Items: {fmt(o.totalItemDiscounts)} | Bill: {fmt(o.totalBillDiscounts)}
              </div>
            </div>
          </div>

          {/* Payment Breakdown */}
          <div className="summary-section">
            <h3 className="summary-section-title">Payment Breakdown</h3>
            <div className="summary-pay-grid">
              {Object.entries(PAYMENT_LABELS).map(([key, label]) => {
                const p = pay[key] || { count: 0, amount: 0 };
                return (
                  <div key={key} className="summary-pay-card">
                    <div className="summary-pay-label">{label}</div>
                    <div className="summary-pay-amount">{fmt(p.amount)}</div>
                    <div className="summary-pay-count">{p.count} bill{p.count !== 1 ? 's' : ''}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Discount Breakdown */}
          {(disc.presets?.length > 0 || disc.customDiscounts?.count > 0) && (
            <div className="summary-section">
              <h3 className="summary-section-title">Discount Breakdown</h3>
              <div className="summary-disc-list">
                {disc.presets?.map((p, i) => (
                  <div key={i} className="summary-disc-row">
                    <span className="summary-disc-name">{p.name}</span>
                    <span className="summary-disc-count">{p.count}x</span>
                    <span className="summary-disc-amt">-{fmt(p.totalDiscount)}</span>
                  </div>
                ))}
                {disc.customDiscounts?.count > 0 && (
                  <div className="summary-disc-row summary-disc-custom">
                    <span className="summary-disc-name">Custom Discounts</span>
                    <span className="summary-disc-count">{disc.customDiscounts.count}x</span>
                    <span className="summary-disc-amt">-{fmt(disc.customDiscounts.totalDiscount)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Unpaid */}
          {unpaid.count > 0 && (
            <div className="summary-section summary-unpaid-section">
              <h3 className="summary-section-title">Unpaid Bills</h3>
              <div className="summary-unpaid">
                <span>{unpaid.count} bill{unpaid.count !== 1 ? 's' : ''} pending</span>
                <span className="summary-unpaid-amt">{fmt(unpaid.totalDue)}</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
