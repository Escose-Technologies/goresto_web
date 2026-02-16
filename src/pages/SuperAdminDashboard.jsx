import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { restaurantService, userService } from '../services/apiService';
import { TouchButton } from '../components/ui/TouchButton';
import { useToast } from '../components/ui/Toast';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import './Dashboard.css';

export const SuperAdminDashboard = () => {
  const { logout } = useAuth();
  const toast = useToast();
  const [restaurants, setRestaurants] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    adminId: '',
  });
  const [confirmModal, setConfirmModal] = useState({ open: false, title: '', message: '', onConfirm: null });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [restaurantsData, usersData] = await Promise.all([
        restaurantService.getAll(),
        userService.getAll(),
      ]);
      setRestaurants(restaurantsData);
      setUsers(usersData.filter(u => u.role === 'restaurant_admin'));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const closeConfirm = () => setConfirmModal({ open: false, title: '', message: '', onConfirm: null });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRestaurant) {
        await restaurantService.update(editingRestaurant.id, formData);
      } else {
        await restaurantService.create(formData);
      }
      await loadData();
      resetForm();
    } catch (error) {
      toast.error('Error saving restaurant: ' + error.message);
    }
  };

  const handleEdit = (restaurant) => {
    setEditingRestaurant(restaurant);
    setFormData({
      name: restaurant.name,
      address: restaurant.address,
      phone: restaurant.phone,
      adminId: restaurant.adminId || '',
    });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setConfirmModal({
      open: true,
      title: 'Delete Restaurant',
      message: 'Are you sure you want to delete this restaurant? This cannot be undone.',
      onConfirm: async () => {
        closeConfirm();
        try {
          await restaurantService.delete(id);
          await loadData();
        } catch (error) {
          toast.error('Error deleting restaurant: ' + error.message);
        }
      },
    });
  };

  const resetForm = () => {
    setFormData({ name: '', address: '', phone: '', adminId: '' });
    setEditingRestaurant(null);
    setShowForm(false);
  };

  const getAdminName = (adminId) => {
    const admin = users.find(u => u.id === adminId);
    return admin ? admin.email : 'Not assigned';
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Super Admin Dashboard</h1>
          <p>Manage restaurants and admins</p>
        </div>
        <button onClick={logout} className="logout-btn">
          Logout
        </button>
      </header>

      <div className="dashboard-content">
        <div className="section-header">
          <h2>Restaurants</h2>
          <TouchButton
            variant="primary"
            onClick={() => setShowForm(true)}
          >
            + Add Restaurant
          </TouchButton>
        </div>

        {showForm && (
          <div className="form-card">
            <h3>{editingRestaurant ? 'Edit Restaurant' : 'Add New Restaurant'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Restaurant Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Assign Admin</label>
                <select
                  value={formData.adminId}
                  onChange={(e) => setFormData({ ...formData, adminId: e.target.value })}
                >
                  <option value="">Select Admin</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.email}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-actions">
                <TouchButton type="submit" variant="primary">
                  {editingRestaurant ? 'Update' : 'Create'}
                </TouchButton>
                <TouchButton variant="secondary" onClick={resetForm}>
                  Cancel
                </TouchButton>
              </div>
            </form>
          </div>
        )}

        <div className="restaurants-grid">
          {restaurants.length === 0 ? (
            <div className="empty-state">No restaurants found. Add your first restaurant!</div>
          ) : (
            restaurants.map((restaurant) => (
              <div key={restaurant.id} className="restaurant-card">
                <h3>{restaurant.name}</h3>
                <p className="restaurant-info">
                  <strong>Address:</strong> {restaurant.address}
                </p>
                <p className="restaurant-info">
                  <strong>Phone:</strong> {restaurant.phone}
                </p>
                <p className="restaurant-info">
                  <strong>Admin:</strong> {getAdminName(restaurant.adminId)}
                </p>
                <div className="card-actions">
                  <button
                    onClick={() => handleEdit(restaurant)}
                    className="btn-icon btn-edit-icon"
                    title="Edit"
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path
                        d="M12.75 2.25C12.9489 2.05109 13.1895 1.95168 13.5 1.95168C13.8105 1.95168 14.0511 2.05109 14.25 2.25L15.75 3.75C15.9489 3.94891 16.0483 4.18951 16.0483 4.5C16.0483 4.81049 15.9489 5.05109 15.75 5.25L6.9375 14.0625L2.25 15.75L3.9375 11.0625L12.75 2.25Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(restaurant.id)}
                    className="btn-icon btn-delete-icon"
                    title="Delete"
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path
                        d="M13.5 4.5L4.5 13.5M4.5 4.5L13.5 13.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <ConfirmModal
        open={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirm}
      />
    </div>
  );
};

