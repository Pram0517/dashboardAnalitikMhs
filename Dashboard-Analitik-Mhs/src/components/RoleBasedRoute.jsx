// FRONTEND/src/components/RoleBasedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleBasedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  // ✅ Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-sans text-accent2">
        Loading...
      </div>
    );
  }

  // ✅ Jika tidak ada user
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Jika allowedRoles diberikan dan role user tidak ada di dalam list
  // ✅ GUNAKAN optional chaining (?.) untuk menghindari error
  if (allowedRoles && !allowedRoles.includes(user.role?.toLowerCase())) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default RoleBasedRoute;