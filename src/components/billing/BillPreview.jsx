import { useState, useEffect, useRef } from 'react';
import { billService } from '../../services/apiService';
import { ThermalBill } from './ThermalBill';
import { A4Invoice } from './A4Invoice';
import { TouchButton } from '../ui/TouchButton';
import './ThermalBill.css';
import './A4Invoice.css';
import './BillPreview.css';

export const BillPreview = ({ restaurantId, restaurant, bill: initialBill, onClose, toast, settings }) => {
  const [bill, setBill] = useState(initialBill);
  const [loading, setLoading] = useState(!initialBill?.billItems);
  const [downloading, setDownloading] = useState(false);
  const [viewMode, setViewMode] = useState('thermal'); // 'thermal' | 'a4'
  const printRef = useRef(null);

  useEffect(() => {
    // Only fetch full bill if we have summary data without items
    if (initialBill?.billItems) {
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        const fullBill = await billService.getBillById(restaurantId, initialBill.id);
        setBill(fullBill);
      } catch (err) {
        toast?.error('Failed to load bill details: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [restaurantId, initialBill, toast]);

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      toast?.error('Popup blocked — please allow popups for printing.');
      return;
    }

    // Collect all stylesheets from the current page
    const styleSheets = Array.from(document.styleSheets);
    let cssText = '';
    styleSheets.forEach(sheet => {
      try {
        Array.from(sheet.cssRules || []).forEach(rule => {
          cssText += rule.cssText + '\n';
        });
      } catch {
        // Cross-origin stylesheets can't be read — skip
      }
    });

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${bill?.billNumber || 'Bill'}</title>
  <style>
    ${cssText}
    body { margin: 0; padding: 0; }
    @media print {
      body { margin: 0; }
      @page {
        size: ${viewMode === 'thermal' ? '80mm auto' : 'A4'};
        margin: ${viewMode === 'thermal' ? '2mm' : '10mm'};
      }
    }
  </style>
</head>
<body>
  ${content.innerHTML}
  <script>window.onload = function() { window.print(); window.close(); }<\/script>
</body>
</html>`;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleDownloadPdf = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const blob = await billService.downloadPdf(restaurantId, bill.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = (bill.billNumber || 'invoice').replace(/\//g, '_') + '.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      toast?.error('PDF download failed: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bill-preview-overlay" onClick={onClose}>
      <div className="bill-preview-modal" onClick={(e) => e.stopPropagation()}>
        {/* Toolbar */}
        <div className="bill-preview-toolbar">
          <div className="bill-preview-tabs">
            <button
              className={`bill-preview-tab ${viewMode === 'thermal' ? 'active' : ''}`}
              onClick={() => setViewMode('thermal')}
            >
              Thermal
            </button>
            <button
              className={`bill-preview-tab ${viewMode === 'a4' ? 'active' : ''}`}
              onClick={() => setViewMode('a4')}
            >
              A4 Invoice
            </button>
          </div>
          <div className="bill-preview-actions">
            <TouchButton variant="secondary" size="sm" onClick={handleDownloadPdf} disabled={loading || downloading}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {downloading ? 'Downloading...' : 'PDF'}
            </TouchButton>
            <TouchButton variant="primary" size="sm" onClick={handlePrint} disabled={loading}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              Print
            </TouchButton>
            <button className="bill-preview-close" onClick={onClose}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bill-preview-content">
          {loading ? (
            <div className="bill-preview-loading">Loading bill...</div>
          ) : (
            <div ref={printRef}>
              {viewMode === 'thermal' ? (
                <ThermalBill bill={bill} restaurant={restaurant} settings={settings} />
              ) : (
                <A4Invoice bill={bill} restaurant={restaurant} settings={settings} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
