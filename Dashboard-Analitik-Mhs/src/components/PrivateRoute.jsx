import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ============ [PRIVATE ROUTE] ============
// [KOMPONEN] PrivateRoute - Wrapper untuk melindungi halaman dari akses tanpa login

const PrivateRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
