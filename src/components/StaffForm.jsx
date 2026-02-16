import { useState, useEffect, useRef } from 'react';
import { TouchButton } from './ui/TouchButton';
import { useToast } from './ui/Toast';
import './StaffForm.css';

const STAFF_ROLES = ['Waiter', 'Chef', 'Manager', 'Bartender', 'Host/Hostess', 'Cashier', 'Kitchen Staff', 'Other'];

export const StaffForm = ({ staff, onSave, onCancel, onDelete }) => {
  const toast = useToast();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    photo: '',
    hireDate: '',
    status: 'active',
    address: '',
    emergencyContact: '',
    notes: '',
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (staff) {
      setFormData({
        name: staff.name || '',
        email: staff.email || '',
        phone: staff.phone || '',
        role: staff.role || '',
        photo: staff.photo || '',
        hireDate: staff.hireDate || '',
        status: staff.status || 'active',
        address: staff.address || '',
        emergencyContact: staff.emergencyContact || '',
        notes: staff.notes || '',
      });
      if (staff.photo) {
        setImagePreview(staff.photo);
      } else {
        setImagePreview(null);
      }
    } else {
      setImagePreview(null);
    }
  }, [staff]);

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.warning('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.warning('Image size should be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setFormData({ ...formData, photo: base64String });
        setImagePreview(base64String);
        setIsUploading(false);
      };
      reader.onerror = () => {
        toast.error('Error reading image file');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Error processing image: ' + error.message);
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, photo: '' });
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="staff-form-card">
      <h3>{staff ? 'Edit Staff Member' : 'Onboard New Staff'}</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Phone *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Role *</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              required
            >
              <option value="">Select Role</option>
              {STAFF_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Hire Date *</label>
            <input
              type="date"
              value={formData.hireDate}
              onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Status *</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              required
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on-leave">On Leave</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Address</label>
          <textarea
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            rows="2"
            placeholder="Street address, City, State, ZIP"
          />
        </div>

        <div className="form-group">
          <label>Emergency Contact</label>
          <input
            type="text"
            value={formData.emergencyContact}
            onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
            placeholder="Name - Phone Number"
          />
        </div>

        <div className="form-group">
          <label>Staff Photo</label>
          <div className="image-upload-container">
            {imagePreview ? (
              <div className="image-preview-wrapper">
                <img src={imagePreview} alt="Preview" className="image-preview" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="remove-image-btn"
                  title="Remove photo"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="image-upload-placeholder">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <p>No photo selected</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="image-file-input"
              id="staff-photo-upload"
              disabled={isUploading}
            />
            <label htmlFor="staff-photo-upload" className="image-upload-label">
              {isUploading ? 'Uploading...' : imagePreview ? 'Change Photo' : 'Choose Photo from Device'}
            </label>
            <p className="image-upload-hint">
              Supports JPG, PNG, GIF. Max size: 5MB
            </p>
          </div>
        </div>

        <div className="form-group">
          <label>Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows="3"
            placeholder="Additional notes about the staff member..."
          />
        </div>

        <div className="form-actions">
          <TouchButton type="submit" variant="primary">
            {staff ? 'Update' : 'Add Staff'}
          </TouchButton>
          <TouchButton variant="secondary" onClick={onCancel}>
            Cancel
          </TouchButton>
          {staff && onDelete && (
            <TouchButton variant="danger" onClick={onDelete} type="button">Delete</TouchButton>
          )}
        </div>
      </form>
    </div>
  );
};


