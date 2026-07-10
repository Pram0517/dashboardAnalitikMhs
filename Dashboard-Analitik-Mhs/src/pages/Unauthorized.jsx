import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ============ [PAGE: UNAUTHORIZED] ============
// [KOMPONEN] Unauthorized - Halaman fallback jika user tidak memiliki akses ke route tertentu

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleBack = () => {
    if (user?.role === 'mahasiswa') {
      navigate(`/mahasiswa/${user.nim}`);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="card text-center max-w-md w-full p-8 animate-fade-in">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-accent2 mb-2">Akses Ditolak</h1>
        <p className="text-text-muted mb-8 text-sm">
          Maaf, Anda tidak memiliki izin untuk mengakses halaman ini.
        </p>
        <button onClick={handleBack} className="btn-primary w-full">
          Kembali ke Dashboard
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
