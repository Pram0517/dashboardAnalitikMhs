// FRONTEND/src/context/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/authService';
import { API_URL, ENDPOINTS } from '../config/api';
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

    // ============ FETCH PROFILE IMAGE LANGSUNG DARI API ============
    const fetchProfileImage = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return null;
            
            console.log('📸 Fetching profile image directly from API...');
            
            const response = await fetch(`${API_URL}/user/profile-image`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                const imageUrl = data?.data?.profileImage || null;
                console.log('📸 Profile image from API:', imageUrl);
                return imageUrl;
            }
            return null;
        } catch (error) {
            console.error('Error fetching profile image:', error);
            return null;
        }
    };

    // ============ CHECK SESSION ============
    useEffect(() => {
        const checkSession = async () => {
            const token = localStorage.getItem('token');
            const savedUser = localStorage.getItem('uad_user');
            
            console.log('🔍 Checking session:', { token: !!token, savedUser: !!savedUser });
            
            if (token) {
                try {
                    let userData = null;
                    
                    // Coba ambil dari localStorage dulu
                    if (savedUser) {
                        userData = JSON.parse(savedUser);
                        console.log('📦 Saved user data:', userData);
                    }
                    
                    // Jika tidak ada di localStorage atau data tidak lengkap, ambil dari backend
                    if (!userData || !userData.role) {
                        console.log('🔄 Fetching user profile from backend...');
                        const profile = await authService.getProfile();
                        if (profile) {
                            userData = {
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
                            };
                            console.log('✅ User profile from backend:', userData);
                        }
                    }
                    
                    if (userData) {
                        // ✅ AMBIL PROFILE IMAGE LANGSUNG DARI API
                        const profileImage = await fetchProfileImage();
                        console.log('📸 Profile image from API:', profileImage);
                        
                        // ✅ GABUNGKAN DATA USER DENGAN PROFILE IMAGE
                        const formattedUser = {
                            ...userData,
                            profileImage: profileImage,
                            profile_image: profileImage
                        };
                        
                        console.log('✅ Final user with profile image:', formattedUser);
                        console.log('📸 Profile image set:', formattedUser.profileImage);
                        
                        setUser(formattedUser);
                        localStorage.setItem('uad_user', JSON.stringify(formattedUser));
                    } else {
                        // Jika tidak ada data user sama sekali
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
            console.log('🔐 AuthContext login called');
            
            const result = await authService.login(username, password);
            console.log('🔍 Login result:', result);
            
            if (result && result.token && result.user) {
                const userData = result.user;
                
                // Buat formatted user dari data login
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
                };
                
                console.log('✅ Formatted user from login:', formattedUser);
                
                // ✅ Simpan token dulu
                localStorage.setItem('token', result.token);
                
                // ✅ Ambil profile image dari API
                const profileImage = await fetchProfileImage();
                console.log('📸 Profile image from API after login:', profileImage);
                
                // ✅ Gabungkan dengan profile image
                const finalUser = {
                    ...formattedUser,
                    profileImage: profileImage,
                    profile_image: profileImage
                };
                
                console.log('✅ Final user after login:', finalUser);
                console.log('📸 Profile image set:', finalUser.profileImage);
                
                localStorage.setItem('uad_user', JSON.stringify(finalUser));
                
                setUser(finalUser);
                toast.success(`Selamat datang, ${finalUser.name}!`);
                return finalUser;
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
                // ✅ Ambil profile image terbaru
                const latestImage = await fetchProfileImage();
                
                const updatedUser = { 
                    ...user, 
                    name, 
                    email,
                    profileImage: latestImage !== null ? latestImage : (profileImage !== undefined ? profileImage : user?.profileImage),
                    profile_image: latestImage !== null ? latestImage : (profileImage !== undefined ? profileImage : user?.profile_image)
                };
                
                console.log('✅ Updated user profile:', updatedUser);
                
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

    // ============ UPLOAD PROFILE IMAGE ============
    const uploadProfileImage = async (file) => {
        try {
            const formData = new FormData();
            formData.append('profileImage', file);

            const token = localStorage.getItem('token');
            const url = `${API_URL}/user/profile-image`;
            
            console.log('📸 Uploading to:', url);
            console.log('📸 File:', file.name, file.size, file.type);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            console.log('📸 Response status:', response.status);
            
            const data = await response.json();
            console.log('📸 Upload response:', JSON.stringify(data, null, 2));

            if (response.ok) {
                // ✅ Ambil URL dari response
                const imageUrl = data?.data?.profileImage || 
                                data?.data?.url || 
                                data?.user?.profileImage || 
                                data?.user?.profile_image || 
                                data?.profileImage || 
                                data?.url || 
                                null;
                
                console.log('📸 Extracted imageUrl:', imageUrl);
                
                if (imageUrl) {
                    // ✅ Ambil profile image terbaru dari API untuk memastikan
                    const latestImage = await fetchProfileImage();
                    console.log('📸 Latest image from API:', latestImage);
                    
                    const finalImage = latestImage || imageUrl;
                    
                    // ✅ UPDATE USER DENGAN FOTO BARU
                    const updatedUser = {
                        ...user,
                        profileImage: finalImage,
                        profile_image: finalImage
                    };
                    
                    console.log('📸 Updated user:', updatedUser);
                    
                    setUser(updatedUser);
                    localStorage.setItem('uad_user', JSON.stringify(updatedUser));
                    
                    toast.success('Foto profil berhasil diupload!');
                    return finalImage;
                } else {
                    console.error('❌ No image URL in response:', data);
                    toast.error('Gagal mendapatkan URL foto');
                    return null;
                }
            } else {
                console.error('❌ Upload failed:', data);
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
            console.log('🗑️ Deleting profile image...');
            
            const response = await fetch(`${API_URL}/user/profile-image`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            console.log('🗑️ Delete response:', data);

            if (response.ok) {
                // ✅ Ambil profile image terbaru (harusnya null)
                const latestImage = await fetchProfileImage();
                console.log('📸 Latest image after delete:', latestImage);
                
                const updatedUser = {
                    ...user,
                    profileImage: null,
                    profile_image: null
                };
                
                console.log('🗑️ Updated user after delete:', updatedUser);
                
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
            if (!token) return null;
            
            console.log('🔄 Refreshing user data...');
            
            // ✅ Ambil profile dari backend
            const profile = await authService.getProfile();
            if (!profile) return null;
            
            // ✅ Ambil profile image dari API
            const profileImage = await fetchProfileImage();
            console.log('📸 Profile image from refresh:', profileImage);
            
            const formattedUser = {
                id: profile.id || profile.user_id || null,
                name: profile.name || profile.nama_lengkap || user?.name || 'User',
                email: profile.email || user?.email || '',
                role: profile.role || user?.role || 'mahasiswa',
                nim: profile.nim || profile.npm || null,
                mahasiswa_id: profile.mahasiswa_id || null,
                nama_lengkap: profile.nama_lengkap || profile.name || null,
                semester: profile.semester || 1,
                gpa: profile.gpa || null,
                mahasiswa_status: profile.mahasiswa_status || 'aktif',
                angkatan: profile.angkatan || null,
                npm: profile.npm || null,
                profileImage: profileImage,
                profile_image: profileImage
            };
            
            console.log('🔄 Refreshed user:', formattedUser);
            console.log('📸 Profile image refreshed:', formattedUser.profileImage);
            
            setUser(formattedUser);
            localStorage.setItem('uad_user', JSON.stringify(formattedUser));
            return formattedUser;
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
        fetchProfileImage,
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