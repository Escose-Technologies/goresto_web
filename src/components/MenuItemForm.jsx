import { useState, useEffect, useRef } from 'react';
import { theme } from '../styles/theme';
import './MenuItemForm.css';

export const MenuItemForm = ({ item, categories, onSave, onCancel }) => {
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    image: '',
    available: true,
    dietary: {
      type: 'veg',
      spiceLevel: 0,
      allergens: [],
      labels: [],
    },
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const allergenOptions = [
    { id: 'nuts', label: 'Nuts' },
    { id: 'dairy', label: 'Dairy' },
    { id: 'gluten', label: 'Gluten' },
    { id: 'shellfish', label: 'Shellfish' },
    { id: 'soy', label: 'Soy' },
    { id: 'eggs', label: 'Eggs' },
    { id: 'fish', label: 'Fish' },
    { id: 'sesame', label: 'Sesame' },
  ];

  const labelOptions = [
    { id: 'vegan', label: 'Vegan' },
    { id: 'gluten-free', label: 'Gluten Free' },
    { id: 'organic', label: 'Organic' },
    { id: 'sugar-free', label: 'Sugar Free' },
    { id: 'keto', label: 'Keto' },
    { id: 'low-calorie', label: 'Low Calorie' },
    { id: 'spicy', label: 'Spicy' },
    { id: 'chef-special', label: 'Chef Special' },
    { id: 'popular', label: 'Popular' },
    { id: 'new', label: 'New' },
  ];

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        price: item.price || '',
        description: item.description || '',
        category: item.category || '',
        image: item.image || '',
        available: item.available !== undefined ? item.available : true,
        dietary: item.dietary || {
          type: 'veg',
          spiceLevel: 0,
          allergens: [],
          labels: [],
        },
      });
      if (item.image) {
        setImagePreview(item.image);
      } else {
        setImagePreview(null);
      }
    } else {
      setImagePreview(null);
    }
  }, [item]);

  const handleImageChange = async (e) => {
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
        setFormData({ ...formData, image: base64String });
        setImagePreview(base64String);
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

  const handleRemoveImage = () => {
    setFormData({ ...formData, image: '' });
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDietaryTypeChange = (type) => {
    setFormData({
      ...formData,
      dietary: { ...formData.dietary, type },
    });
  };

  const handleSpiceLevelChange = (level) => {
    setFormData({
      ...formData,
      dietary: { ...formData.dietary, spiceLevel: level },
    });
  };

  const handleAllergenToggle = (allergenId) => {
    const currentAllergens = formData.dietary.allergens || [];
    const newAllergens = currentAllergens.includes(allergenId)
      ? currentAllergens.filter(a => a !== allergenId)
      : [...currentAllergens, allergenId];

    setFormData({
      ...formData,
      dietary: { ...formData.dietary, allergens: newAllergens },
    });
  };

  const handleLabelToggle = (labelId) => {
    const currentLabels = formData.dietary.labels || [];
    const newLabels = currentLabels.includes(labelId)
      ? currentLabels.filter(l => l !== labelId)
      : [...currentLabels, labelId];

    setFormData({
      ...formData,
      dietary: { ...formData.dietary, labels: newLabels },
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      price: parseFloat(formData.price),
    });
  };

  return (
    <div className="menu-item-form-card">
      <h3>{item ? 'Edit Menu Item' : 'Add New Menu Item'}</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Item Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Price ($) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Category *</label>
          <div className="category-input-wrapper">
            <input
              type="text"
              list="categories-list"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="Type category name (e.g., Appetizers, Main Course, Desserts)"
              className="category-input"
              required
            />
            <datalist id="categories-list">
              {categories.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
            {categories.length > 0 && (
              <div className="category-suggestions">
                <span className="suggestions-label">Suggestions:</span>
                <div className="suggestion-tags">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      className="suggestion-tag"
                      onClick={() => setFormData({ ...formData, category: cat })}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          {formData.category && !categories.includes(formData.category) && (
            <p className="new-category-note">New category will be created: {formData.category}</p>
          )}
          {formData.category && categories.includes(formData.category) && (
            <p className="existing-category-note">Using existing category</p>
          )}
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows="3"
          />
        </div>

        {/* Dietary Type Selection */}
        <div className="form-group">
          <label>Dietary Type *</label>
          <div className="dietary-type-options">
            <button
              type="button"
              className={`dietary-type-btn ${formData.dietary.type === 'veg' ? 'active' : ''}`}
              onClick={() => handleDietaryTypeChange('veg')}
            >
              <span className="dietary-icon dietary-veg"></span>
              Vegetarian
            </button>
            <button
              type="button"
              className={`dietary-type-btn ${formData.dietary.type === 'non-veg' ? 'active' : ''}`}
              onClick={() => handleDietaryTypeChange('non-veg')}
            >
              <span className="dietary-icon dietary-non-veg"></span>
              Non-Veg
            </button>
            <button
              type="button"
              className={`dietary-type-btn ${formData.dietary.type === 'egg' ? 'active' : ''}`}
              onClick={() => handleDietaryTypeChange('egg')}
            >
              <span className="dietary-icon dietary-egg"></span>
              Contains Egg
            </button>
          </div>
        </div>

        {/* Spice Level Selection */}
        <div className="form-group">
          <label>Spice Level</label>
          <div className="spice-level-options">
            {[0, 1, 2, 3].map((level) => (
              <button
                key={level}
                type="button"
                className={`spice-level-btn ${formData.dietary.spiceLevel === level ? 'active' : ''}`}
                onClick={() => handleSpiceLevelChange(level)}
              >
                {level === 0 ? 'None' : '🌶️'.repeat(level)}
                <span className="spice-label">
                  {level === 0 ? 'Mild' : level === 1 ? 'Light' : level === 2 ? 'Medium' : 'Hot'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Allergens */}
        <div className="form-group">
          <label>Allergens</label>
          <p className="form-hint">Select any allergens present in this dish</p>
          <div className="checkbox-group">
            {allergenOptions.map((allergen) => (
              <label key={allergen.id} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={formData.dietary.allergens?.includes(allergen.id) || false}
                  onChange={() => handleAllergenToggle(allergen.id)}
                />
                <span>{allergen.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Optional Labels */}
        <div className="form-group">
          <label>Labels (Optional)</label>
          <p className="form-hint">Add labels to highlight special attributes</p>
          <div className="checkbox-group labels-group">
            {labelOptions.map((labelOption) => (
              <label key={labelOption.id} className="checkbox-item label-item">
                <input
                  type="checkbox"
                  checked={formData.dietary.labels?.includes(labelOption.id) || false}
                  onChange={() => handleLabelToggle(labelOption.id)}
                />
                <span>{labelOption.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Item Image</label>
          <div className="image-upload-container">
            {imagePreview ? (
              <div className="image-preview-wrapper">
                <img src={imagePreview} alt="Preview" className="image-preview" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="remove-image-btn"
                  title="Remove image"
                >
                  x
                </button>
              </div>
            ) : (
              <div className="image-upload-placeholder">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                <p>No image selected</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="image-file-input"
              id="image-upload"
              disabled={isUploading}
            />
            <label htmlFor="image-upload" className="image-upload-label">
              {isUploading ? 'Uploading...' : imagePreview ? 'Change Image' : 'Choose Image from Device'}
            </label>
            <p className="image-upload-hint">
              Supports JPG, PNG, GIF. Max size: 5MB
            </p>
          </div>
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.available}
              onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
            />
            <span>Available</span>
          </label>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn-primary"
            style={{ background: theme.colors.background.gradient }}
          >
            {item ? 'Update' : 'Create'}
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
