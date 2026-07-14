// FRONTEND/src/layouts/SidebarLayout.jsx
import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Upload, 
  AlertTriangle, 
  GraduationCap, 
  Settings, 
  LogOut,
  Menu,
  X,
  BookOpen,
  FileText,
  UserCheck,
  User,
  Loader
} from 'lucide-react';
import logoUAD from '../assets/logo-uad.png';

const SidebarLayout = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ✅ Debug
  useEffect(() => {
    console.log('🔍 SidebarLayout - User:', user);
    console.log('🔍 SidebarLayout - Loading:', loading);
  }, [user, loading]);

  // ✅ Definisikan navItems dengan aman
  const navItems = [
    { name: 'Data Saya', path: '/mahasiswa/self', icon: User, roles: ['mahasiswa'] },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'kaprodi'] },
    { name: 'Evaluasi Studi', path: '/evaluasi-studi', icon: AlertTriangle, roles: ['admin', 'kaprodi'] },
    { name: 'Capstone', path: '/capstone', icon: GraduationCap, roles: ['admin', 'kaprodi'] },
    { name: 'Skripsi', path: '/skripsi', icon: FileText, roles: ['admin', 'kaprodi'] },
    { name: 'Dosen Skripsi', path: '/dosen-skripsi', icon: UserCheck, roles: ['admin', 'kaprodi'] },
    { name: 'Kurikulum', path: '/kurikulum', icon: BookOpen, roles: ['admin'] },
    { name: 'Pengaturan', path: '/settings', icon: Settings, roles: ['admin', 'kaprodi', 'mahasiswa'] },
  ];

  // ✅ Filter navItems berdasarkan role user dengan aman
  const filteredNavItems = user?.role 
    ? navItems.filter(item => item.roles.includes(user.role))
    : [];

  // ✅ Handle loading state
  if (loading) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <Loader size={40} className="animate-spin text-accent2" />
      </div>
    );
  }

  // ✅ Jika tidak ada user, redirect ke login
  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile Menu Button */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-primary rounded-md shadow-sm"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X size={24} className="text-accent2" /> : <Menu size={24} className="text-accent2" />}
      </button>

      {/* Sidebar */}
      <aside className={`
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 transition-transform duration-300 ease-in-out
        fixed md:static inset-y-0 left-0 z-40
        w-64 bg-accent2 text-white flex flex-col shadow-xl
      `}>
        {/* Logo Area */}
        <div className="p-6 flex justify-center items-center border-b border-white/10">
          <img src={logoUAD} alt="Logo UAD" className="h-20 w-auto object-contain bg-white-0 p-0 rounded-lg" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {filteredNavItems.length > 0 ? (
            filteredNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) => `
                  flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${isActive ? 'bg-accent1 text-white font-medium shadow-md' : 'text-white/70 hover:bg-white/10 hover:text-white'}
                `}
              >
                <item.icon size={20} />
                <span>{item.name}</span>
              </NavLink>
            ))
          ) : (
            <div className="text-white/50 text-sm text-center py-4">No menu available</div>
          )}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-white/10 bg-black/10">
  <div className="flex items-center justify-between">
    <div className="flex flex-col">
      <span className="text-sm font-semibold truncate w-32">
        {user?.name || user?.nama_lengkap || 'User'}
      </span>
      <span className="text-xs text-white/60">
        {user?.role || 'Unknown'}
      </span>
    </div>
    <button 
      onClick={handleLogout}
      className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
      title="Logout"
    >
      <LogOut size={20} />
    </button>
  </div>
</div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-primary border-b border-secondary/20 flex items-center justify-end px-6 shadow-sm md:hidden">
          {/* Empty space for mobile menu toggle */}
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-auto p-6 md:p-8">
          <Outlet />
        </div>
      </main>

      {/* Overlay for mobile sidebar */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default SidebarLayout;