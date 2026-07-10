import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ============ [ROLE BASED ROUTE] ============
// [KOMPONEN] RoleBasedRoute - Wrapper untuk melindungi halaman berdasarkan role user

const RoleBasedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center font-sans text-accent2">Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Jika allowedRoles diberikan dan role user tidak ada di dalam list
  if (allowedRoles && !allowedRoles.includes(user.role.toLowerCase())) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default RoleBasedRoute;
