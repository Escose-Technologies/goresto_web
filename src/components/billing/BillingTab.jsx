import { useState, useEffect, useCallback } from 'react';
import { billService } from '../../services/apiService';
import { BillCard } from './BillCard';
import { BillPreview } from './BillPreview';
import { DailySummary } from './DailySummary';
import { PaymentModeSelector } from './PaymentModeSelector';
import { TouchButton } from '../ui/TouchButton';
import './BillingTab.css';

const DATE_PRESETS = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'all', label: 'All Time' },
];

function getDateRange(preset) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (preset) {
    case 'today':
      return { from: today.toISOString(), to: new Date(today.getTime() + 86400000).toISOString() };
    case 'yesterday': {
      const y = new Date(today.getTime() - 86400000);
      return { from: y.toISOString(), to: today.toISOString() };
    }
    case 'week': {
      const day = today.getDay();
      const monday = new Date(today.getTime() - ((day === 0 ? 6 : day - 1) * 86400000));
      return { from: monday.toISOString(), to: new Date(today.getTime() + 86400000).toISOString() };
    }
    case 'month': {
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: first.toISOString(), to: new Date(today.getTime() + 86400000).toISOString() };
    }
    default:
      return {};
  }
}

export const BillingTab = ({ restaurantId, restaurant, toast, refreshTrigger, settings }) => {
  const [billingView, setBillingView] = useState('bills'); // 'bills' | 'reports'
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [datePreset, setDatePreset] = useState('today');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Stats
  const [stats, setStats] = useState(null);

  // Preview modal
  const [previewBill, setPreviewBill] = useState(null);

  // Payment modal
  const [payingBill, setPayingBill] = useState(null);
  const [payMode, setPayMode] = useState('cash');
  const [paySubmitting, setPaySubmitting] = useState(false);

  const loadBills = useCallback(async (pageNum = 1, append = false) => {
    try {
      if (!append) setLoading(true);
      const range = getDateRange(datePreset);
      const query = {
        page: pageNum,
        limit: 20,
        ...(statusFilter && { status: statusFilter }),
        ...(paymentFilter && { paymentMode: paymentFilter }),
        ...(range.from && { from: range.from }),
        ...(range.to && { to: range.to }),
      };
      const result = await billService.getBills(restaurantId, query);

      // API returns { bills, total, page, totalPages } or just an array
      if (Array.isArray(result)) {
        setBills(append ? prev => [...prev, ...result] : result);
        setTotalCount(result.length);
      } else {
        setBills(append ? prev => [...prev, ...(result.bills || [])] : (result.bills || []));
        setTotalCount(result.total || 0);
      }
      setPage(pageNum);
    } catch (err) {
      toast?.error('Failed to load bills: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [restaurantId, statusFilter, datePreset, paymentFilter, toast]);

  const loadStats = useCallback(async () => {
    try {
      const range = getDateRange(datePreset);
      if (!range.from) return;
      const fromDate = range.from.split('T')[0];
      const toDate = range.to ? range.to.split('T')[0] : fromDate;
      const data = await billService.getSummary(restaurantId, fromDate, toDate);
      setStats(data);
    } catch {
      // Stats are nice-to-have, don't block on failure
    }
  }, [restaurantId, datePreset]);

  useEffect(() => {
    loadBills(1);
    loadStats();
  }, [loadBills, loadStats]);

  // Refresh when socket events trigger a change
  useEffect(() => {
    if (refreshTrigger > 0) {
      loadBills(1);
      loadStats();
    }
  }, [refreshTrigger]); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter bills client-side by search query
  const filteredBills = searchQuery.trim()
    ? bills.filter(b => {
        const q = searchQuery.trim().toLowerCase();
        return (
          b.billNumber?.toLowerCase().includes(q) ||
          b.customerName?.toLowerCase().includes(q) ||
          b.customerMobile?.includes(q) ||
          b.tableNumber?.includes(q)
        );
      })
    : bills;

  const handleLoadMore = () => {
    loadBills(page + 1, true);
  };

  const handleView = (bill) => {
    setPreviewBill(bill);
  };

  const handlePay = (bill) => {
    setPayingBill(bill);
    setPayMode('cash');
  };

  const handlePaySubmit = async () => {
    if (!payingBill || paySubmitting) return;
    setPaySubmitting(true);
    try {
      await billService.updatePayment(restaurantId, payingBill.id, {
        paymentMode: payMode,
        paidAmount: payingBill.grandTotal,
      });
      toast?.success(`Payment recorded for ${payingBill.billNumber}`);
      setPayingBill(null);
      loadBills(1);
      loadStats();
    } catch (err) {
      toast?.error('Payment failed: ' + err.message);
    } finally {
      setPaySubmitting(false);
    }
  };

  const handleCancel = (bill) => {
    const reason = prompt('Cancel reason:');
    if (!reason) return;
    billService.cancelBill(restaurantId, bill.id, { cancelReason: reason })
      .then(() => {
        toast?.success(`Bill ${bill.billNumber} cancelled`);
        loadBills(1);
        loadStats();
      })
      .catch(err => toast?.error('Cancel failed: ' + err.message));
  };

  // Public method for parent to call on socket events
  const refresh = useCallback(() => {
    loadBills(1);
    loadStats();
  }, [loadBills, loadStats]);

  // Expose refresh via ref — but since we're using props, parent calls loadBills via onBillCreated
  // which triggers a full data reload anyway

  const overview = stats?.overview || {};
  const hasMore = bills.length < totalCount;

  return (
    <div>
      {/* View Toggle */}
      <div className="billing-view-toggle">
        <button
          className={`billing-view-btn ${billingView === 'bills' ? 'active' : ''}`}
          onClick={() => setBillingView('bills')}
        >
          Bills
        </button>
        <button
          className={`billing-view-btn ${billingView === 'reports' ? 'active' : ''}`}
          onClick={() => setBillingView('reports')}
        >
          Reports
        </button>
      </div>

      {billingView === 'reports' ? (
        <DailySummary restaurantId={restaurantId} toast={toast} />
      ) : (
      <>
      {/* Stats */}
      <div className="billing-stats">
        <div className="billing-stat-card">
          <div className="billing-stat-label">Bills</div>
          <div className="billing-stat-value">{overview.activeBills ?? filteredBills.length}</div>
        </div>
        <div className="billing-stat-card">
          <div className="billing-stat-label">Revenue</div>
          <div className="billing-stat-value revenue">
            ₹{(overview.totalRevenue ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
          </div>
        </div>
        <div className="billing-stat-card">
          <div className="billing-stat-label">Tax Collected</div>
          <div className="billing-stat-value tax">
            ₹{(overview.totalTaxCollected ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
          </div>
        </div>
        <div className="billing-stat-card">
          <div className="billing-stat-label">Pending</div>
          <div className="billing-stat-value pending">
            {stats?.unpaidBills?.count ?? 0}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="billing-filters">
        <select
          className="billing-filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
          <option value="partially_paid">Partial</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          className="billing-filter-select"
          value={datePreset}
          onChange={(e) => setDatePreset(e.target.value)}
        >
          {DATE_PRESETS.map(d => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </select>

        <select
          className="billing-filter-select"
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
        >
          <option value="">All Payments</option>
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="upi">UPI</option>
          <option value="split">Split</option>
        </select>

        <div className="billing-search">
          <svg className="billing-search-icon" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="7" cy="7" r="5" />
            <path d="M13 13L10.5 10.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search bill, customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Bill List */}
      {loading ? (
        <div className="billing-loading">Loading bills...</div>
      ) : filteredBills.length === 0 ? (
        <div className="billing-empty">
          {searchQuery ? 'No bills match your search' : 'No bills found for this period'}
        </div>
      ) : (
        <>
          <div className="billing-list">
            {filteredBills.map(bill => (
              <BillCard
                key={bill.id}
                bill={bill}
                onView={handleView}
                onPay={bill.paymentStatus === 'unpaid' ? handlePay : undefined}
                onCancel={bill.paymentStatus !== 'cancelled' ? handleCancel : undefined}
              />
            ))}
          </div>

          {hasMore && (
            <div className="billing-load-more">
              <button onClick={handleLoadMore}>Load More</button>
            </div>
          )}
        </>
      )}

      </>
      )}

      {/* Bill Preview Modal */}
      {previewBill && (
        <BillPreview
          restaurantId={restaurantId}
          restaurant={restaurant}
          bill={previewBill}
          onClose={() => setPreviewBill(null)}
          toast={toast}
          settings={settings}
        />
      )}

      {/* Payment Modal */}
      {payingBill && (
        <div className="pay-modal-overlay" onClick={() => setPayingBill(null)}>
          <div className="pay-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Record Payment</h3>
            <div className="pay-modal-total">
              {payingBill.billNumber} — ₹{payingBill.grandTotal.toFixed(2)}
            </div>
            <PaymentModeSelector
              paymentMode={payMode}
              onPaymentModeChange={setPayMode}
            />
            <div className="pay-modal-actions">
              <TouchButton variant="secondary" onClick={() => setPayingBill(null)}>
                Cancel
              </TouchButton>
              <TouchButton
                variant="primary"
                onClick={handlePaySubmit}
                loading={paySubmitting}
              >
                Mark as Paid
              </TouchButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
