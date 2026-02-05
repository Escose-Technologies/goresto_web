import { useState, useRef, useEffect } from 'react';
import { theme } from '../../styles/theme';
import './RestaurantProfileForm.css';

const cuisineTypes = [
  'Indian',
  'Chinese',
  'Italian',
  'Mexican',
  'Thai',
  'Japanese',
  'Korean',
  'American',
  'Mediterranean',
  'French',
  'Middle Eastern',
  'Vietnamese',
  'Greek',
  'Spanish',
  'Continental',
  'Fast Food',
  'Cafe',
  'Bakery',
  'Seafood',
  'BBQ',
];

export const RestaurantProfileForm = ({ restaurant, onSave, onCancel }) => {
  const logoInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo: '',
    coverImage: '',
    cuisineTypes: [],
    address: '',
    phone: '',
    email: '',
    website: '',
    socialLinks: {
      instagram: '',
      facebook: '',
      twitter: '',
    },
    openingHours: '',
    discount: null,
  });

  const [logoPreview, setLogoPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (restaurant) {
      setFormData({
        name: restaurant.name || '',
        description: restaurant.description || '',
        logo: restaurant.logo || '',
        coverImage: restaurant.coverImage || '',
        cuisineTypes: restaurant.cuisineTypes || [],
        address: restaurant.address || '',
        phone: restaurant.phone || '',
        email: restaurant.email || '',
        website: restaurant.website || '',
        socialLinks: restaurant.socialLinks || {
          instagram: '',
          facebook: '',
          twitter: '',
        },
        openingHours: restaurant.openingHours || '',
        discount: restaurant.discount || null,
      });
      if (restaurant.logo) setLogoPreview(restaurant.logo);
      if (restaurant.coverImage) setCoverPreview(restaurant.coverImage);
    }
  }, [restaurant]);

  const handleImageUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        if (type === 'logo') {
          setFormData({ ...formData, logo: base64String });
          setLogoPreview(base64String);
        } else {
          setFormData({ ...formData, coverImage: base64String });
          setCoverPreview(base64String);
        }
        setIsUploading(false);
      };
      reader.onerror = () => {
        alert('Error reading image file');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      alert('Error processing image: ' + error.message);
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (type) => {
    if (type === 'logo') {
      setFormData({ ...formData, logo: '' });
      setLogoPreview(null);
      if (logoInputRef.current) logoInputRef.current.value = '';
    } else {
      setFormData({ ...formData, coverImage: '' });
      setCoverPreview(null);
      if (coverInputRef.current) coverInputRef.current.value = '';
    }
  };

  const handleCuisineToggle = (cuisine) => {
    const currentCuisines = formData.cuisineTypes;
    const newCuisines = currentCuisines.includes(cuisine)
      ? currentCuisines.filter((c) => c !== cuisine)
      : [...currentCuisines, cuisine];
    setFormData({ ...formData, cuisineTypes: newCuisines });
  };

  const handleSocialLinkChange = (platform, value) => {
    setFormData({
      ...formData,
      socialLinks: {
        ...formData.socialLinks,
        [platform]: value,
      },
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="restaurant-profile-form">
      <h3>Restaurant Profile</h3>
      <form onSubmit={handleSubmit}>
        {/* Cover Image */}
        <div className="form-group">
          <label>Cover Image</label>
          <div className="cover-image-container">
            {coverPreview ? (
              <div className="cover-preview-wrapper">
                <img src={coverPreview} alt="Cover Preview" className="cover-preview" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage('cover')}
                  className="remove-image-btn"
                  title="Remove cover"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="cover-placeholder">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                <p>Add a cover image</p>
              </div>
            )}
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'cover')}
              className="image-file-input"
              id="cover-upload"
              disabled={isUploading}
            />
            <label htmlFor="cover-upload" className="image-upload-btn">
              {isUploading ? 'Uploading...' : coverPreview ? 'Change Cover' : 'Upload Cover'}
            </label>
          </div>
        </div>

        {/* Logo */}
        <div className="form-group">
          <label>Restaurant Logo</label>
          <div className="logo-upload-container">
            {logoPreview ? (
              <div className="logo-preview-wrapper">
                <img src={logoPreview} alt="Logo Preview" className="logo-preview" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage('logo')}
                  className="remove-logo-btn"
                  title="Remove logo"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="logo-placeholder">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
            )}
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'logo')}
              className="image-file-input"
              id="logo-upload"
              disabled={isUploading}
            />
            <label htmlFor="logo-upload" className="logo-upload-btn">
              {logoPreview ? 'Change' : 'Upload'}
            </label>
          </div>
        </div>

        {/* Basic Info */}
        <div className="form-group">
          <label>Restaurant Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows="3"
            placeholder="Tell customers about your restaurant..."
          />
        </div>

        {/* Cuisine Types */}
        <div className="form-group">
          <label>Cuisine Types</label>
          <p className="form-hint">Select all that apply</p>
          <div className="cuisine-chips">
            {cuisineTypes.map((cuisine) => (
              <button
                key={cuisine}
                type="button"
                className={`cuisine-chip ${formData.cuisineTypes.includes(cuisine) ? 'active' : ''}`}
                onClick={() => handleCuisineToggle(cuisine)}
              >
                {cuisine}
              </button>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <div className="form-section-title">Contact Information</div>

        <div className="form-group">
          <label>Address</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="123 Main Street, City, State"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 123-4567"
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="contact@restaurant.com"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Website</label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            placeholder="https://www.restaurant.com"
          />
        </div>

        {/* Social Links */}
        <div className="form-section-title">Social Media</div>

        <div className="form-group">
          <label>
            <span className="social-icon">📸</span> Instagram
          </label>
          <input
            type="text"
            value={formData.socialLinks.instagram}
            onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
            placeholder="@yourrestaurant"
          />
        </div>

        <div className="form-group">
          <label>
            <span className="social-icon">👤</span> Facebook
          </label>
          <input
            type="text"
            value={formData.socialLinks.facebook}
            onChange={(e) => handleSocialLinkChange('facebook', e.target.value)}
            placeholder="facebook.com/yourrestaurant"
          />
        </div>

        <div className="form-group">
          <label>
            <span className="social-icon">🐦</span> Twitter
          </label>
          <input
            type="text"
            value={formData.socialLinks.twitter}
            onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
            placeholder="@yourrestaurant"
          />
        </div>

        {/* Operating Hours */}
        <div className="form-section-title">Operating Hours</div>

        <div className="form-group">
          <label>Hours</label>
          <input
            type="text"
            value={formData.openingHours}
            onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
            placeholder="Mon-Fri: 11am-10pm, Sat-Sun: 10am-11pm"
          />
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn-primary"
            style={{ background: theme.colors.background.gradient }}
          >
            Save Profile
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel} className="btn-secondary">
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default RestaurantProfileForm;
