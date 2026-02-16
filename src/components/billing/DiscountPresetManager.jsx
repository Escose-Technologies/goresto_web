import { useState, useEffect, useCallback } from 'react';
import { discountPresetService } from '../../services/apiService';
import { TouchButton } from '../ui/TouchButton';
import './DiscountPresetManager.css';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SCOPE_LABELS = { bill: 'Bill Level', item: 'Item Level' };

const emptyForm = {
  name: '',
  description: '',
  isActive: true,
  scope: 'bill',
  discountType: 'percentage',
  discountValue: '',
  minBillAmount: '',
  startDate: '',
  endDate: '',
  startTime: '',
  endTime: '',
  activeDays: [0, 1, 2, 3, 4, 5, 6],
  requiresReason: false,
  maxDiscountAmount: '',
  autoSuggest: true,
};

export const DiscountPresetManager = ({ restaurantId, toast }) => {
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null = list view, 'new' or preset object
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  const loadPresets = useCallback(async () => {
    try {
      setLoading(true);
      const data = await discountPresetService.getAll(restaurantId);
      setPresets(Array.isArray(data) ? data : []);
    } catch (err) {
      toast?.error('Failed to load presets: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [restaurantId, toast]);

  useEffect(() => {
    loadPresets();
  }, [loadPresets]);

  const handleNew = () => {
    setForm({ ...emptyForm });
    setEditing('new');
  };

  const handleEdit = (preset) => {
    setForm({
      name: preset.name || '',
      description: preset.description || '',
      isActive: preset.isActive ?? true,
      scope: preset.scope || 'bill',
      discountType: preset.discountType || 'percentage',
      discountValue: preset.discountValue ?? '',
      minBillAmount: preset.minBillAmount ?? '',
      startDate: preset.startDate ? preset.startDate.split('T')[0] : '',
      endDate: preset.endDate ? preset.endDate.split('T')[0] : '',
      startTime: preset.startTime || '',
      endTime: preset.endTime || '',
      activeDays: preset.activeDays?.length ? preset.activeDays : [0, 1, 2, 3, 4, 5, 6],
      requiresReason: preset.requiresReason || false,
      maxDiscountAmount: preset.maxDiscountAmount ?? '',
      autoSuggest: preset.autoSuggest ?? true,
    });
    setEditing(preset);
  };

  const handleCancel = () => {
    setEditing(null);
    setForm({ ...emptyForm });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleDayToggle = (day) => {
    setForm(prev => ({
      ...prev,
      activeDays: prev.activeDays.includes(day)
        ? prev.activeDays.filter(d => d !== day)
        : [...prev.activeDays, day].sort(),
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast?.error('Preset name is required');
      return;
    }
    if (!form.discountValue || Number(form.discountValue) <= 0) {
      toast?.error('Discount value must be greater than 0');
      return;
    }
    if (form.discountType === 'percentage' && Number(form.discountValue) > 100) {
      toast?.error('Percentage discount cannot exceed 100%');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        isActive: form.isActive,
        scope: form.scope,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minBillAmount: form.minBillAmount ? Number(form.minBillAmount) : undefined,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        startTime: form.startTime || undefined,
        endTime: form.endTime || undefined,
        activeDays: form.activeDays,
        requiresReason: form.requiresReason,
        maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : undefined,
        autoSuggest: form.autoSuggest,
      };

      if (editing === 'new') {
        await discountPresetService.create(restaurantId, payload);
        toast?.success('Preset created');
      } else {
        await discountPresetService.update(restaurantId, editing.id, payload);
        toast?.success('Preset updated');
      }
      setEditing(null);
      loadPresets();
    } catch (err) {
      toast?.error('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (preset) => {
    if (!window.confirm(`Delete "${preset.name}"?`)) return;
    try {
      await discountPresetService.remove(restaurantId, preset.id);
      toast?.success('Preset deleted');
      loadPresets();
    } catch (err) {
      toast?.error('Delete failed: ' + err.message);
    }
  };

  const handleToggleActive = async (preset) => {
    try {
      await discountPresetService.update(restaurantId, preset.id, { isActive: !preset.isActive });
      loadPresets();
    } catch (err) {
      toast?.error('Update failed: ' + err.message);
    }
  };

  // ─── Edit Form ─────────────────────────────────

  if (editing !== null) {
    return (
      <div className="preset-form">
        <div className="preset-form-header">
          <h3>{editing === 'new' ? 'New Discount Preset' : 'Edit Preset'}</h3>
          <button className="preset-form-close" onClick={handleCancel}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="preset-form-body">
          <div className="preset-form-row">
            <div className="preset-form-group preset-form-grow">
              <label>Name *</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Happy Hour 20%" maxLength={100} />
            </div>
            <div className="preset-form-group">
              <label>Status</label>
              <label className="preset-toggle-label">
                <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
                <span>{form.isActive ? 'Active' : 'Inactive'}</span>
              </label>
            </div>
          </div>

          <div className="preset-form-group">
            <label>Description</label>
            <input type="text" name="description" value={form.description} onChange={handleChange} placeholder="Optional description" maxLength={200} />
          </div>

          <div className="preset-form-row">
            <div className="preset-form-group">
              <label>Scope</label>
              <select name="scope" value={form.scope} onChange={handleChange}>
                <option value="bill">Bill Level</option>
                <option value="item">Item Level</option>
              </select>
            </div>
            <div className="preset-form-group">
              <label>Type</label>
              <select name="discountType" value={form.discountType} onChange={handleChange}>
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Amount (₹)</option>
              </select>
            </div>
            <div className="preset-form-group">
              <label>Value *</label>
              <input
                type="number"
                name="discountValue"
                value={form.discountValue}
                onChange={handleChange}
                placeholder={form.discountType === 'percentage' ? '10' : '50'}
                min="0"
                max={form.discountType === 'percentage' ? '100' : undefined}
                step="0.01"
              />
            </div>
          </div>

          <div className="preset-form-row">
            <div className="preset-form-group">
              <label>Min Bill Amount</label>
              <input type="number" name="minBillAmount" value={form.minBillAmount} onChange={handleChange} placeholder="No minimum" min="0" step="1" />
            </div>
            <div className="preset-form-group">
              <label>Max Discount Cap</label>
              <input type="number" name="maxDiscountAmount" value={form.maxDiscountAmount} onChange={handleChange} placeholder="No cap" min="0" step="1" />
            </div>
          </div>

          <div className="preset-form-divider" />

          <div className="preset-form-row">
            <div className="preset-form-group">
              <label>Start Date</label>
              <input type="date" name="startDate" value={form.startDate} onChange={handleChange} />
            </div>
            <div className="preset-form-group">
              <label>End Date</label>
              <input type="date" name="endDate" value={form.endDate} onChange={handleChange} />
            </div>
          </div>

          <div className="preset-form-row">
            <div className="preset-form-group">
              <label>Start Time</label>
              <input type="time" name="startTime" value={form.startTime} onChange={handleChange} />
            </div>
            <div className="preset-form-group">
              <label>End Time</label>
              <input type="time" name="endTime" value={form.endTime} onChange={handleChange} />
            </div>
          </div>

          <div className="preset-form-group">
            <label>Active Days</label>
            <div className="preset-days-row">
              {DAYS.map((label, i) => (
                <button
                  key={i}
                  type="button"
                  className={`preset-day-btn ${form.activeDays.includes(i) ? 'active' : ''}`}
                  onClick={() => handleDayToggle(i)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="preset-form-divider" />

          <div className="preset-form-row">
            <div className="preset-form-group">
              <label className="preset-toggle-label">
                <input type="checkbox" name="requiresReason" checked={form.requiresReason} onChange={handleChange} />
                <span>Require reason when applied</span>
              </label>
            </div>
            <div className="preset-form-group">
              <label className="preset-toggle-label">
                <input type="checkbox" name="autoSuggest" checked={form.autoSuggest} onChange={handleChange} />
                <span>Auto-suggest during billing</span>
              </label>
            </div>
          </div>
        </div>

        <div className="preset-form-footer">
          <TouchButton variant="secondary" onClick={handleCancel}>Cancel</TouchButton>
          <TouchButton variant="primary" onClick={handleSave} loading={saving}>
            {editing === 'new' ? 'Create Preset' : 'Save Changes'}
          </TouchButton>
        </div>
      </div>
    );
  }

  // ─── List View ─────────────────────────────────

  return (
    <div className="preset-manager">
      <div className="preset-manager-header">
        <h3>Discount Presets</h3>
        <TouchButton variant="primary" size="sm" onClick={handleNew}>
          + New Preset
        </TouchButton>
      </div>

      {loading ? (
        <div className="preset-loading">Loading presets...</div>
      ) : presets.length === 0 ? (
        <div className="preset-empty">
          No discount presets yet. Create one to speed up billing.
        </div>
      ) : (
        <div className="preset-list">
          {presets.map(preset => (
            <div key={preset.id} className={`preset-card ${!preset.isActive ? 'preset-inactive' : ''}`}>
              <div className="preset-card-main" onClick={() => handleEdit(preset)} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && handleEdit(preset)}>
                <div className="preset-card-top">
                  <span className="preset-card-name">{preset.name}</span>
                  <span className={`preset-card-badge ${preset.isActive ? 'active' : 'inactive'}`}>
                    {preset.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="preset-card-meta">
                  <span className="preset-card-value">
                    {preset.discountType === 'percentage' ? `${preset.discountValue}%` : `₹${preset.discountValue}`}
                  </span>
                  <span className="preset-card-scope">{SCOPE_LABELS[preset.scope] || preset.scope}</span>
                  {preset.minBillAmount > 0 && <span>Min ₹{preset.minBillAmount}</span>}
                  {preset.startDate && (
                    <span>
                      {new Date(preset.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      {preset.endDate && ` – ${new Date(preset.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                    </span>
                  )}
                  {preset.startTime && <span>{preset.startTime}–{preset.endTime}</span>}
                </div>
                {preset.description && (
                  <div className="preset-card-desc">{preset.description}</div>
                )}
              </div>
              <div className="preset-card-actions">
                <button
                  className="preset-action-toggle"
                  onClick={() => handleToggleActive(preset)}
                  title={preset.isActive ? 'Deactivate' : 'Activate'}
                >
                  {preset.isActive ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  )}
                </button>
                <button
                  className="preset-action-delete"
                  onClick={() => handleDelete(preset)}
                  title="Delete"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
