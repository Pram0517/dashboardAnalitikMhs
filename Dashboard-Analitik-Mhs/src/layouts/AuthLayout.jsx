import { Outlet } from 'react-router-dom';
import Background from '../assets/Background.png';

// ============ [LAYOUT SECTION] ============
// [KOMPONEN] AuthLayout - Wrapper untuk halaman publik (Login, Reset Password) dengan background estetik

const AuthLayout = () => {
  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center p-4 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${Background})`,
      }}
    >
      {/* Background decoration elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent1/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="z-10 w-full max-w-md">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;