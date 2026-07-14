import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import RoleBasedRoute from './components/RoleBasedRoute';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import SidebarLayout from './layouts/SidebarLayout';

// Pages
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import EvaluasiStudi from './pages/EvaluasiStudi';
import Capstone from './pages/Capstone';
import Pembimbing from './pages/Pembimbing';
import MahasiswaDetail from './pages/MahasiswaDetail';
import Settings from './pages/Settings';
import Skripsi from './pages/Skripsi';
import Kurikulum from './pages/Kurikulum';
import Unauthorized from './pages/Unauthorized';
import DosenSkripsi from './pages/DosenSkripsi';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          {/* Root Redirect to Login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Public Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
          </Route>

          {/* Protected Routes - Butuh Login */}
          <Route element={<PrivateRoute />}>
            <Route element={<SidebarLayout />}>
              
              {/* Admin & Kaprodi Only */}
              <Route element={<RoleBasedRoute allowedRoles={['admin', 'kaprodi']} />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/evaluasi-studi" element={<EvaluasiStudi />} />
                <Route path="/capstone" element={<Capstone />} />
                <Route path="/skripsi" element={<Skripsi />} />
                <Route path="/dosen-skripsi" element={<DosenSkripsi />} />
              </Route>

              {/* Admin Only */}
              <Route element={<RoleBasedRoute allowedRoles={['admin']} />}>
                <Route path="/kurikulum" element={<Kurikulum />} />
              </Route>

              {/* Mahasiswa Only */}
              <Route element={<RoleBasedRoute allowedRoles={['mahasiswa']} />}>
                <Route path="/mahasiswa/self" element={<MahasiswaDetail />} />
              </Route>

              {/* Semua Role (Admin, Kaprodi, Mahasiswa) */}
              <Route path="/settings" element={<Settings />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/pembimbing" element={<Pembimbing />} />
              <Route path="/mahasiswa/:id" element={<MahasiswaDetail />} />
              
              <Route path="/unauthorized" element={<Unauthorized />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;