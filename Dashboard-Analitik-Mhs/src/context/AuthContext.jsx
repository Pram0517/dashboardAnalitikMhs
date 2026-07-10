// FRONTEND/src/context/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            const token = localStorage.getItem('token');
            const savedUser = localStorage.getItem('uad_user');
            
            if (token && savedUser) {
                try {
                    // Verifikasi token ke backend
                    const profile = await authService.getProfile();
                    if (profile) {
                        const userData = {
                            id: profile.id,
                            name: profile.name,
                            email: profile.email,
                            role: profile.role,
                            nim: profile.nim || profile.npm || null,
                            mahasiswa_id: profile.mahasiswa_id || null,
                            nama_lengkap: profile.nama_lengkap || null,
                            semester: profile.semester || null,
                            gpa: profile.gpa || null,
                            mahasiswa_status: profile.mahasiswa_status || null,
                            angkatan: profile.angkatan || null
                        };
                        setUser(userData);
                        localStorage.setItem('uad_user', JSON.stringify(userData));
                    } else {
                        // Token invalid
                        localStorage.removeItem('token');
                        localStorage.removeItem('uad_user');
                    }
                } catch (error) {
                    console.error('Session check error:', error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('uad_user');
                }
            }
            setLoading(false);
        };
        
        checkSession();
    }, []);

    // ============ LOGIN ============
    const login = async (username, password) => {
        try {
            const result = await authService.login(username, password);
            
            if (result) {
                const userData = {
                    id: result.user.id,
                    name: result.user.name,
                    email: result.user.email,
                    role: result.user.role,
                    nim: result.user.nim || result.user.npm || null,
                    mahasiswa_id: result.user.mahasiswa_id || null,
                    nama_lengkap: result.user.nama_lengkap || null,
                    semester: result.user.semester || null,
                    gpa: result.user.gpa || null,
                    mahasiswa_status: result.user.mahasiswa_status || null,
                    angkatan: result.user.angkatan || null
                };
                
                // Simpan token dan user data
                localStorage.setItem('token', result.token);
                localStorage.setItem('uad_user', JSON.stringify(userData));
                
                setUser(userData);
                toast.success(`Selamat datang, ${userData.name}!`);
                return userData;
            }
            return null;
        } catch (error) {
            console.error('Login error:', error);
            toast.error(error.message || 'Login gagal');
            return null;
        }
    };

    // ============ LOGOUT ============
    const logout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            localStorage.removeItem('token');
            localStorage.removeItem('uad_user');
            toast.success('Anda telah logout.');
        }
    };

    // ============ UPDATE PROFILE ============
    const updateUserProfile = async (name, email) => {
        try {
            const result = await authService.updateProfile({ name, email });
            if (result) {
                const updatedUser = { ...user, name, email };
                setUser(updatedUser);
                localStorage.setItem('uad_user', JSON.stringify(updatedUser));
                toast.success('Profil berhasil diperbarui');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Update profile error:', error);
            toast.error(error.message || 'Gagal memperbarui profil');
            return false;
        }
    };

    // ============ CHANGE PASSWORD ============
    const changePassword = async (oldPassword, newPassword) => {
        try {
            await authService.changePassword(oldPassword, newPassword);
            toast.success('Password berhasil diubah');
            return true;
        } catch (error) {
            console.error('Change password error:', error);
            toast.error(error.message || 'Gagal mengubah password');
            return false;
        }
    };

    const value = {
        user,
        loading,
        login,
        logout,
        updateUserProfile,
        changePassword,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isKaprodi: user?.role === 'kaprodi',
        isMahasiswa: user?.role === 'mahasiswa',
        isDosen: user?.role === 'dosen'
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};