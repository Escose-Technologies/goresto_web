import { Navigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, requireSuperAdmin = false }) => {
  const { isAuthenticated, isSuperAdmin, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (requireSuperAdmin && !isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

