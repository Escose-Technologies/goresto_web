import { useState, useEffect } from 'react';
import { TouchButton } from './ui/TouchButton';
import './TableForm.css';

export const TableForm = ({ table, onSave, onCancel, onDelete }) => {
  const [formData, setFormData] = useState({
    number: '',
    capacity: '',
    status: 'available',
    location: 'Indoor',
  });

  useEffect(() => {
    if (table) {
      setFormData({
        number: table.number || '',
        capacity: table.capacity || '',
        status: table.status || 'available',
        location: table.location || 'Indoor',
      });
    }
  }, [table]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      capacity: parseInt(formData.capacity),
    });
  };

  return (
    <div className="table-form-card">
      <h3>{table ? 'Edit Table' : 'Add New Table'}</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Table Number *</label>
            <input
              type="text"
              value={formData.number}
              onChange={(e) => setFormData({ ...formData, number: e.target.value })}
              required
              placeholder="e.g., 1, 2, A1"
            />
          </div>
          <div className="form-group">
            <label>Capacity *</label>
            <input
              type="number"
              min="1"
              max="20"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Status *</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              required
            >
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="reserved">Reserved</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          <div className="form-group">
            <label>Location *</label>
            <select
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
            >
              <option value="Indoor">Indoor</option>
              <option value="Outdoor">Outdoor</option>
              <option value="VIP">VIP</option>
              <option value="Bar">Bar</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <TouchButton type="submit" variant="primary">
            {table ? 'Update' : 'Create'}
          </TouchButton>
          <TouchButton variant="secondary" onClick={onCancel}>
            Cancel
          </TouchButton>
          {table && onDelete && (
            <TouchButton variant="danger" onClick={onDelete} type="button">Delete</TouchButton>
          )}
        </div>
      </form>
    </div>
  );
};


