import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { SuperAdminDashboard } from './pages/SuperAdminDashboard';
import { RestaurantAdminDashboard } from './pages/RestaurantAdminDashboard';
import { PublicMenu } from './pages/PublicMenu';
import { KitchenDisplay } from './pages/KitchenDisplay';
import './styles/global.css';

const AppRoutes = () => {
  const { isAuthenticated, isSuperAdmin } = useAuth();

  return (
    <Routes>
      <Route path="/goresto-admin" element={!isAuthenticated ? <Login /> : <Navigate to={isSuperAdmin ? '/super-admin' : '/dashboard'} replace />} />
      <Route
        path="/super-admin"
        element={
          <ProtectedRoute requireSuperAdmin>
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <RestaurantAdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/menu/:restaurantId" element={<PublicMenu />} />
      <Route path="/kitchen/:restaurantId" element={<KitchenDisplay />} />
      <Route path="/" element={<LandingPage />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;


