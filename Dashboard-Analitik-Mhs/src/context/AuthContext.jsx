// FRONTEND/src/context/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/authService';
import { API_URL, ENDPOINTS } from '../config/api'; // ← PASTIKAN IMPORT INI
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

    // ============ CHECK SESSION ============
    useEffect(() => {
    const checkSession = async () => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('uad_user');
        
        console.log('🔍 Checking session:', { token: !!token, savedUser: !!savedUser });
        
        if (token && savedUser) {
            try {
                const userData = JSON.parse(savedUser);
                console.log('📦 Saved user data:', userData);
                
                if (userData && userData.role) {
                    // ✅ Cek apakah profileImage ada di localStorage
                    console.log('📦 Profile image in localStorage:', userData.profileImage || userData.profile_image || 'NOT FOUND');
                    
                    // ✅ Jika tidak ada, ambil dari backend
                    if (!userData.profileImage && !userData.profile_image) {
                        console.log('🔄 No profile image in localStorage, fetching from backend...');
                        const profile = await fetchUserProfile(token);
                        if (profile) {
                            const formattedUser = {
                                ...userData,
                                profileImage: profile.profile_image || profile.profileImage || null,
                                profile_image: profile.profile_image || profile.profileImage || null
                            };
                            console.log('✅ Updated user with profile image:', formattedUser);
                            setUser(formattedUser);
                            localStorage.setItem('uad_user', JSON.stringify(formattedUser));
                            setLoading(false);
                            return;
                        }
                    }
                    
                    setUser(userData);
                    setLoading(false);
                    console.log('✅ User restored from localStorage:', userData.role);
                    return;
                }
                
                // Jika data tidak valid, coba verifikasi ke backend
                const profile = await authService.getProfile();
                if (profile) {
                    const formattedUser = {
                        id: profile.id || profile.user_id || null,
                        name: profile.name || profile.nama_lengkap || 'User',
                        email: profile.email || '',
                        role: profile.role || 'mahasiswa',
                        nim: profile.nim || profile.npm || null,
                        mahasiswa_id: profile.mahasiswa_id || null,
                        nama_lengkap: profile.nama_lengkap || profile.name || null,
                        semester: profile.semester || 1,
                        gpa: profile.gpa || null,
                        mahasiswa_status: profile.mahasiswa_status || 'aktif',
                        angkatan: profile.angkatan || null,
                        npm: profile.npm || null,
                        // ✅ AMBIL PROFILE IMAGE DARI BACKEND
                        profileImage: profile.profile_image || profile.profileImage || null,
                        profile_image: profile.profile_image || profile.profileImage || null
                    };
                    console.log('✅ Profile from backend with image:', formattedUser.profileImage);
                    setUser(formattedUser);
                    localStorage.setItem('uad_user', JSON.stringify(formattedUser));
                } else {
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
    
    // Fungsi untuk fetch profile
    const fetchUserProfile = async (token) => {
        try {
            const response = await fetch(`${API_URL}/auth/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                return data.user || data;
            }
            return null;
        } catch (error) {
            console.error('Error fetching profile:', error);
            return null;
        }
    };
    
    checkSession();
}, []);

    // ============ LOGIN ============
    const login = async (username, password) => {
    try {
        console.log('🔐 AuthContext login called');
        
        const result = await authService.login(username, password);
        console.log('🔍 Login result:', result);
        
        if (result && result.token && result.user) {
            const userData = result.user;
            
            // ✅ AMBIL PROFILE IMAGE DARI RESPONSE LOGIN
            const profileImage = userData.profile_image || userData.profileImage || null;
            console.log('📸 Profile image from login:', profileImage);
            
            const formattedUser = {
                id: userData.id || userData.user_id || null,
                name: userData.name || userData.nama_lengkap || userData.username || 'User',
                email: userData.email || userData.username || '',
                role: userData.role || 'mahasiswa',
                nim: userData.nim || userData.npm || null,
                mahasiswa_id: userData.mahasiswa_id || null,
                nama_lengkap: userData.nama_lengkap || userData.name || null,
                semester: userData.semester || 1,
                gpa: userData.gpa || null,
                mahasiswa_status: userData.mahasiswa_status || 'aktif',
                angkatan: userData.angkatan || null,
                npm: userData.npm || null,
                // ✅ SIMPAN PROFILE IMAGE
                profileImage: profileImage,
                profile_image: profileImage
            };
            
            console.log('✅ Formatted user:', formattedUser);
            console.log('✅ Profile image saved:', formattedUser.profileImage);
            
            localStorage.setItem('token', result.token);
            localStorage.setItem('uad_user', JSON.stringify(formattedUser));
            
            setUser(formattedUser);
            toast.success(`Selamat datang, ${formattedUser.name}!`);
            return formattedUser;
        }
        
        throw new Error('Login gagal: data tidak lengkap');
        
    } catch (error) {
        console.error('❌ Login error in context:', error);
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
    const updateUserProfile = async (name, email, profileImage = null) => {
        try {
            const updateData = { name, email };
            
            if (profileImage !== undefined) {
                updateData.profileImage = profileImage;
            }
            
            const result = await authService.updateProfile(updateData);
            
            if (result) {
                const updatedUser = { 
                    ...user, 
                    name, 
                    email,
                    profileImage: profileImage !== undefined ? profileImage : user?.profileImage,
                    profile_image: profileImage !== undefined ? profileImage : user?.profile_image
                };
                
                setUser(updatedUser);
                localStorage.setItem('uad_user', JSON.stringify(updatedUser));
                
                if (profileImage !== undefined) {
                    toast.success('Foto profil berhasil diperbarui');
                } else {
                    toast.success('Profil berhasil diperbarui');
                }
                return true;
            }
            return false;
        } catch (error) {
            console.error('Update profile error:', error);
            toast.error(error.message || 'Gagal memperbarui profil');
            return false;
        }
    };

    // ============ UPLOAD PROFILE IMAGE ============
    const uploadProfileImage = async (file) => {
    try {
        const formData = new FormData();
        formData.append('profileImage', file);

        const token = localStorage.getItem('token');
        const url = `${API_URL}/user/profile-image`;
        
        console.log('📸 Uploading to:', url);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();
        console.log('📸 Upload response:', data);

        if (response.ok) {
            // ✅ Ambil URL dari berbagai kemungkinan response
            const imageUrl = data?.data?.profileImage || 
                            data?.data?.url || 
                            data?.user?.profileImage || 
                            data?.user?.profile_image || 
                            data?.profileImage || 
                            data?.url || 
                            null;
            
            console.log('📸 Extracted imageUrl:', imageUrl);
            
            if (imageUrl) {
                // ✅ UPDATE USER DENGAN FOTO BARU
                const updatedUser = {
                    ...user,
                    profileImage: imageUrl,
                    profile_image: imageUrl
                };
                
                console.log('📸 Updated user:', updatedUser);
                
                setUser(updatedUser);
                localStorage.setItem('uad_user', JSON.stringify(updatedUser));
                
                // ✅ Refresh profile dari database untuk memastikan
                await refreshUser();
                
                toast.success('Foto profil berhasil diupload!');
                return imageUrl;
            } else {
                console.error('❌ No image URL in response:', data);
                toast.error('Gagal mendapatkan URL foto');
                return null;
            }
        } else {
            toast.error(data.message || 'Gagal upload foto');
            return null;
        }
    } catch (error) {
        console.error('❌ Upload error:', error);
        toast.error('Gagal terhubung ke server');
        return null;
    }
};


    // ============ DELETE PROFILE IMAGE ============
    const deleteProfileImage = async () => {
        try {
            const token = localStorage.getItem('token');
            
            // ✅ Gunakan ENDPOINTS.profileImage
            console.log('🗑️ Deleting from:', ENDPOINTS.profileImage);
            
            const response = await fetch(ENDPOINTS.profileImage, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            console.log('🗑️ Delete response:', data);

            if (response.ok) {
                const updatedUser = {
                    ...user,
                    profileImage: null,
                    profile_image: null
                };
                
                setUser(updatedUser);
                localStorage.setItem('uad_user', JSON.stringify(updatedUser));
                
                toast.success('Foto profil berhasil dihapus');
                return true;
            } else {
                toast.error(data.message || 'Gagal hapus foto');
                return false;
            }
        } catch (error) {
            console.error('Delete profile image error:', error);
            toast.error('Gagal terhubung ke server');
            return false;
        }
    };

    // ============ REFRESH USER ============
    const refreshUser = async () => {
    try {
        const token = localStorage.getItem('token');
        console.log('🔄 Refreshing user from database...');
        
        const response = await fetch(`${API_URL}/auth/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            const userData = data.user || data;
            console.log('🔄 User data from database:', userData);
            console.log('🔄 Profile image from database:', userData.profile_image || userData.profileImage);
            
            const formattedUser = {
                ...user,
                id: userData.id || user?.id,
                name: userData.name || userData.nama_lengkap || user?.name,
                email: userData.email || user?.email,
                role: userData.role || user?.role,
                // ✅ AMBIL PROFILE IMAGE DARI DATABASE
                profileImage: userData.profile_image || userData.profileImage || null,
                profile_image: userData.profile_image || userData.profileImage || null
            };
            
            console.log('🔄 Formatted user:', formattedUser);
            console.log('🔄 Profile image set:', formattedUser.profileImage);
            
            setUser(formattedUser);
            localStorage.setItem('uad_user', JSON.stringify(formattedUser));
            return formattedUser;
        }
        return null;
    } catch (error) {
        console.error('Refresh user error:', error);
        return null;
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
        uploadProfileImage,
        deleteProfileImage,
        refreshUser,
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