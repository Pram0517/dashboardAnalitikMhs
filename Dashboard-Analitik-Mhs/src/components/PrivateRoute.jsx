// FRONTEND/src/components/PrivateRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = () => {
  const { user, loading } = useAuth();

  // ✅ Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-sans text-accent2">
        Loading...
      </div>
    );
  }

  // ✅ Cek user
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;