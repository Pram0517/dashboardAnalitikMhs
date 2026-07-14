// FRONTEND/src/pages/Settings.jsx
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL, ENDPOINTS } from '../config/api';
import { User, Lock, Bell, Camera, Save, CheckCircle2, Mail, Shield, Eye, EyeOff, Loader, X, ZoomIn } from 'lucide-react';
import toast from 'react-hot-toast';

// ============ [DESIGN TOKENS] ============
const T = {
  navy:        '#06446B',
  navyDeep:    '#042F4D',
  mid:         '#5790AB',
  sky:         '#9CCDDB',
  skyLight:    '#C8E8F0',
  white:       '#FFFFFF',
  glass:       'rgba(255,255,255,0.78)',
  glassBorder: 'rgba(151,205,219,0.30)',
  muted:       'rgba(6,68,107,0.42)',
  pageBg:      `radial-gradient(ellipse 130% 80% at 8% 0%, #D2EDF5 0%, #EAF5F9 32%, #F7FBFC 60%)`,
};

const avatarGradient = `linear-gradient(135deg, ${T.mid} 0%, ${T.navy} 100%)`;

// ============ [COMPONENTS] ============
const NavItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: '11px',
      padding: '11px 16px',
      borderRadius: '14px',
      border: active ? `1.5px solid rgba(151,205,219,0.40)` : '1.5px solid transparent',
      background: active ? `linear-gradient(135deg, rgba(255,255,255,0.90) 0%, rgba(234,245,249,0.85) 100%)` : 'transparent',
      backdropFilter: active ? 'blur(12px)' : 'none',
      WebkitBackdropFilter: active ? 'blur(12px)' : 'none',
      boxShadow: active ? '0 4px 16px rgba(6,68,107,0.10)' : 'none',
      cursor: 'pointer',
      transition: 'all 0.22s cubic-bezier(.34,1.56,.64,1)',
      transform: active ? 'translateX(3px)' : 'translateX(0)',
      fontFamily: "'Poppins', sans-serif",
    }}
  >
    <div style={{
      width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0,
      background: active ? `linear-gradient(135deg, ${T.sky} 0%, ${T.mid} 100%)` : 'rgba(156,205,219,0.18)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'background 0.2s ease',
    }}>
      <Icon size={16} color={active ? T.white : T.mid} strokeWidth={2.2} />
    </div>
    <span style={{
      fontSize: '13.5px', fontWeight: active ? 700 : 500,
      color: active ? T.navy : T.muted,
      letterSpacing: '-0.1px',
      transition: 'color 0.2s, font-weight 0.2s',
    }}>
      {label}
    </span>
    {active && (
      <div style={{
        marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%',
        background: `linear-gradient(135deg, ${T.sky}, ${T.mid})`,
        boxShadow: `0 0 6px ${T.sky}`,
      }} />
    )}
  </button>
);

const InputField = ({ label, type = 'text', value, onChange, disabled, placeholder, icon: Icon, error }) => {
  const [showPass, setShowPass] = useState(false);
  const isPass = type === 'password';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{
        fontSize: '11.5px', fontWeight: 700, color: T.muted,
        letterSpacing: '0.07em', textTransform: 'uppercase',
      }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        {Icon && (
          <div style={{
            position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)',
            pointerEvents: 'none',
          }}>
            <Icon size={15} color={T.mid} strokeWidth={2} />
          </div>
        )}
        <input
          type={isPass && showPass ? 'text' : type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: Icon ? '11px 13px 11px 38px' : '11px 13px',
            paddingRight: isPass ? '40px' : '13px',
            fontSize: '13.5px',
            fontWeight: 500,
            color: disabled ? T.muted : T.navy,
            background: disabled ? 'rgba(156,205,219,0.08)' : 'rgba(255,255,255,0.82)',
            border: `1.5px solid ${error ? '#dc2626' : disabled ? 'rgba(156,205,219,0.20)' : 'rgba(151,205,219,0.35)'}`,
            borderRadius: '12px',
            outline: 'none',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            boxShadow: error ? '0 0 0 3px rgba(220,38,38,0.15)' : disabled ? 'none' : '0 2px 8px rgba(6,68,107,0.05)',
            transition: 'border 0.2s, box-shadow 0.2s',
            fontFamily: "'Poppins', system-ui, sans-serif",
            cursor: disabled ? 'not-allowed' : 'text',
          }}
        />
        {isPass && (
          <button
            onClick={() => setShowPass(p => !p)}
            style={{
              position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
              color: T.mid,
            }}
            type="button"
          >
            {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
      {error && (
        <p style={{ fontSize: '11px', color: '#dc2626', margin: '4px 0 0' }}>{error}</p>
      )}
    </div>
  );
};

const SectionCard = ({ title, subtitle, icon: Icon, children }) => (
  <div style={{
    background: T.glass,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: `1.5px solid ${T.glassBorder}`,
    borderRadius: '22px',
    boxShadow: '0 4px 28px rgba(6,68,107,0.08), 0 1px 4px rgba(6,68,107,0.05)',
    overflow: 'hidden',
  }}>
    <div style={{
      padding: '1.3rem 1.7rem 1.1rem',
      borderBottom: `1px solid rgba(151,205,219,0.20)`,
      background: 'linear-gradient(90deg, rgba(156,205,219,0.10) 0%, transparent 80%)',
      display: 'flex', alignItems: 'center', gap: '12px',
    }}>
      {Icon && (
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
          background: `linear-gradient(135deg, ${T.sky} 0%, ${T.mid} 100%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={17} color={T.white} strokeWidth={2.2} />
        </div>
      )}
      <div>
        <h2 style={{
          fontSize: '15px', fontWeight: 700, color: T.navy,
          margin: 0, letterSpacing: '-0.2px',
        }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{ fontSize: '11.5px', color: T.muted, margin: '2px 0 0', fontWeight: 450 }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
    <div style={{ padding: '1.5rem 1.7rem' }}>
      {children}
    </div>
  </div>
);

const ToggleSwitch = ({ defaultOn, onChange }) => {
  const [on, setOn] = useState(defaultOn);

  const handleToggle = () => {
    const newState = !on;
    setOn(newState);
    if (onChange) onChange(newState);
  };

  return (
    <button
      onClick={handleToggle}
      style={{
        width: '42px', height: '24px', borderRadius: '99px', border: 'none', cursor: 'pointer',
        background: on ? `linear-gradient(135deg, ${T.sky} 0%, ${T.mid} 100%)` : 'rgba(156,205,219,0.25)',
        position: 'relative', flexShrink: 0,
        boxShadow: on ? `0 2px 10px rgba(87,144,171,0.40)` : 'none',
        transition: 'background 0.25s ease, box-shadow 0.25s ease',
      }}
      type="button"
    >
      <span style={{
        position: 'absolute', top: '3px',
        left: on ? '20px' : '3px',
        width: '18px', height: '18px', borderRadius: '50%',
        background: T.white,
        boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
        transition: 'left 0.22s cubic-bezier(.34,1.56,.64,1)',
        display: 'block',
      }} />
    </button>
  );
};

// ============ [MAIN COMPONENT] ============
const Settings = () => {
  const { user, updateUserProfile, uploadProfileImage, deleteProfileImage, refreshUser, fetchProfileImage } = useAuth();
  const [activeNav, setActiveNav] = useState('profil');
  const fileInputRef = useRef(null);

  // State Profil
  const [isEditing, setIsEditing] = useState(false);
  const [nama, setNama] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  
  // State Foto Profil
  const [profileImage, setProfileImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPhotoPreview, setShowPhotoPreview] = useState(false);

  // State Keamanan
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // State Notifikasi
  const [preferences, setPreferences] = useState({
    mahasiswaBerisiko: true,
    updateCapstoneSkripsi: true,
    laporanMingguan: false,
    uploadKHSBerhasil: true
  });
  const [isLoadingPrefs, setIsLoadingPrefs] = useState(true);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);

  // ============ GET AUTH HEADERS ============
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
    };
  };

  // ============ LOAD PROFILE IMAGE ============
  const loadProfileImage = async () => {
    try {
      setIsLoadingImage(true);
      console.log('📸 Loading profile image from API...');
      const image = await fetchProfileImage();
      console.log('📸 Profile image loaded:', image);
      if (image) {
        setProfileImage(image);
        if (user) {
          const updatedUser = { ...user, profileImage: image, profile_image: image };
          localStorage.setItem('uad_user', JSON.stringify(updatedUser));
        }
        return image;
      } else {
        setProfileImage(null);
        return null;
      }
    } catch (error) {
      console.error('Error loading profile image:', error);
      return null;
    } finally {
      setIsLoadingImage(false);
    }
  };

  // ============ FETCH PREFERENCES ============
  const fetchPreferences = async () => {
    try {
      console.log('📡 Fetching preferences...');
      const response = await fetch(ENDPOINTS.preferences, {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'Success' && data.data) {
          setPreferences(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setIsLoadingPrefs(false);
    }
  };

  // ============ SAVE PREFERENCES ============
  const savePreferences = async () => {
    setIsSavingPreferences(true);
    try {
      const response = await fetch(ENDPOINTS.preferences, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preferences)
      });

      if (response.ok) {
        toast.success('Preferensi berhasil disimpan!');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Gagal menyimpan preferensi');
      }
    } catch (error) {
      toast.error('Gagal terhubung ke server');
    } finally {
      setIsSavingPreferences(false);
    }
  };

  // ============ FOTO PROFIL FUNCTIONS ============
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('File harus berupa gambar (JPG, PNG, GIF, atau WEBP)');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 2MB');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleUploadPhoto = async () => {
    if (!selectedFile) {
      toast.error('Pilih foto terlebih dahulu');
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const result = await uploadProfileImage(selectedFile);
      if (result) {
        setProfileImage(result);
        setPreviewImage(null);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        await refreshUser();
        await loadProfileImage();
        toast.success('Foto profil berhasil diupload!');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Gagal upload foto');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async () => {
    setShowDeleteConfirm(false);
    try {
      const success = await deleteProfileImage();
      if (success) {
        setProfileImage(null);
        await refreshUser();
        await loadProfileImage();
        toast.success('Foto profil berhasil dihapus');
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error('Gagal hapus foto');
    }
  };

  const handleRemovePhoto = () => {
    const currentImage = profileImage || user?.profileImage || user?.profile_image;
    if (!currentImage) {
      toast.error('Tidak ada foto untuk dihapus');
      return;
    }
    setShowDeleteConfirm(true);
  };

  const handleCancelUpload = () => {
    setPreviewImage(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePhotoClick = () => {
    const currentImage = profileImage || user?.profileImage || user?.profile_image;
    if (currentImage) setShowPhotoPreview(true);
  };

  // ============ EFFECTS ============
  useEffect(() => {
    if (user) {
      setNama(user.name || '');
      setEmail(user.email || '');
      loadProfileImage();
    }
  }, [user]);

  useEffect(() => {
    fetchPreferences();
    loadProfileImage();
  }, []);

  // ============ HANDLERS ============
  const handleSaveProfile = async () => {
    if (!nama.trim() || !email.trim()) {
      toast.error('Nama dan Email tidak boleh kosong.');
      return;
    }

    setIsSavingProfile(true);
    try {
      const success = await updateUserProfile(nama, email);
      if (success) {
        setIsEditing(false);
        await refreshUser();
        await loadProfileImage();
        toast.success('Profil berhasil diperbarui!');
      }
    } catch (error) {
      toast.error(error.message || 'Gagal memperbarui profil');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCancel = () => {
    setNama(user?.name || '');
    setEmail(user?.email || '');
    setIsEditing(false);
  };

  const handleChangePassword = async () => {
    const errors = {};
    if (!oldPassword) errors.oldPassword = 'Password lama wajib diisi';
    if (!newPassword) errors.newPassword = 'Password baru wajib diisi';
    if (newPassword.length < 6) errors.newPassword = 'Password minimal 6 karakter';
    if (newPassword !== confirmPassword) errors.confirmPassword = 'Password tidak sama';
    if (newPassword === oldPassword) errors.newPassword = 'Password baru harus berbeda';

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setPasswordErrors({});
    setIsChangingPassword(true);

    try {
      const response = await fetch(`${API_URL}/auth/change-password`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Password berhasil diubah!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(data.message || 'Gagal mengubah password');
      }
    } catch (error) {
      toast.error('Gagal terhubung ke server');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  // ============ GET CURRENT IMAGE ============
  const getCurrentImage = () => {
    if (previewImage) return previewImage;
    if (profileImage) return profileImage;
    if (user?.profileImage) return user.profileImage;
    if (user?.profile_image) return user.profile_image;
    return null;
  };

  // ============ LOADING ============
  if (!user || isLoadingPrefs || isLoadingImage) {
    return (
      <div style={{
        minHeight: '100vh',
        background: T.pageBg,
        padding: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Poppins', system-ui, sans-serif",
      }}>
        <Loader size={40} className="animate-spin" style={{ color: T.navy }} />
      </div>
    );
  }

  const currentImage = getCurrentImage();

  // ============ RENDER ============
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
        @keyframes settingsFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        .se1 { animation: settingsFadeUp 0.5s 0.00s cubic-bezier(.22,1,.36,1) both; }
        .se2 { animation: settingsFadeUp 0.5s 0.07s cubic-bezier(.22,1,.36,1) both; }
        .se3 { animation: settingsFadeUp 0.5s 0.14s cubic-bezier(.22,1,.36,1) both; }
        .se4 { animation: settingsFadeUp 0.5s 0.21s cubic-bezier(.22,1,.36,1) both; }
        .hover-zoom-label {
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        div:hover > .hover-zoom-label {
          opacity: 1;
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: T.pageBg,
        padding: '2rem 2.25rem 3rem',
        fontFamily: "'Poppins', system-ui, sans-serif",
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>

          {/* Page Header */}
          <div className="se1" style={{ marginBottom: '2rem' }}>
            <h1 style={{
              fontSize: '26px', fontWeight: 800, color: T.navy,
              letterSpacing: '-0.5px', margin: 0, lineHeight: 1.2,
            }}>
              Pengaturan Akun
            </h1>
            <p style={{ fontSize: '13px', color: T.muted, marginTop: '5px', fontWeight: 450 }}>
              Kelola informasi profil dan preferensi sistem Anda
            </p>
          </div>

          {/* Two-Column Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '210px 1fr', gap: '1.4rem', alignItems: 'start' }}>

            {/* Sidebar Nav */}
            <div className="se2" style={{
              background: T.glass,
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: `1.5px solid ${T.glassBorder}`,
              borderRadius: '22px',
              padding: '1rem',
              boxShadow: '0 4px 24px rgba(6,68,107,0.07)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}>
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '1rem 0.5rem 1.2rem',
                borderBottom: `1px solid rgba(151,205,219,0.20)`,
                marginBottom: '10px',
                position: 'relative',
              }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '50%',
                  background: currentImage ? 'transparent' : avatarGradient,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px', fontWeight: 800, color: T.white,
                  boxShadow: `0 4px 16px rgba(6,68,107,0.28)`,
                  marginBottom: '8px',
                  border: `2.5px solid rgba(156,205,219,0.45)`,
                  overflow: 'hidden',
                  cursor: currentImage ? 'pointer' : 'default',
                  transition: 'transform 0.2s ease',
                }}
                onClick={handlePhotoClick}
                onMouseEnter={(e) => {
                  if (currentImage) e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {currentImage ? (
                  <img 
                    src={currentImage} 
                    alt="Profile" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const parent = e.target.parentElement;
                      if (parent) {
                        parent.textContent = user?.name?.charAt(0) || 'A';
                        parent.style.background = avatarGradient;
                        parent.style.display = 'flex';
                        parent.style.alignItems = 'center';
                        parent.style.justifyContent = 'center';
                      }
                    }}
                  />
                ) : (
                  user?.name?.charAt(0) ?? 'A'
                )}
                {currentImage && (
                  <div className="hover-zoom-label" style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'rgba(0,0,0,0.50)',
                    color: T.white,
                    fontSize: '9px',
                    fontWeight: 600,
                    textAlign: 'center',
                    padding: '2px 0',
                    borderRadius: '0 0 50% 50%',
                  }}>
                    <ZoomIn size={12} />
                  </div>
                )}
              </div>
              <p style={{ fontSize: '13px', fontWeight: 700, color: T.navy, margin: 0 }}>
                {user?.name ?? 'User'}
              </p>
              <span style={{
                fontSize: '10.5px', fontWeight: 600, marginTop: '3px',
                padding: '2px 9px', borderRadius: '99px',
                background: 'rgba(87,144,171,0.12)',
                color: T.mid,
                letterSpacing: '0.04em',
              }}>
                {user?.role?.toUpperCase() ?? 'USER'}
              </span>
            </div>

            <NavItem icon={User} label="Profil Akun" active={activeNav === 'profil'} onClick={() => setActiveNav('profil')} />
            <NavItem icon={Lock} label="Keamanan" active={activeNav === 'keamanan'} onClick={() => setActiveNav('keamanan')} />
            <NavItem icon={Bell} label="Notifikasi" active={activeNav === 'notifikasi'} onClick={() => setActiveNav('notifikasi')} />
          </div>

          {/* Content Area */}
          <div className="se3" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

            {/* TAB: PROFIL */}
            {activeNav === 'profil' && (
              <>
                <SectionCard title="Foto Profil" subtitle="Upload foto profil Anda" icon={Camera}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <div style={{
                        width: '72px', height: '72px', borderRadius: '50%',
                        background: currentImage ? 'transparent' : avatarGradient,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '26px', fontWeight: 800, color: T.white,
                        boxShadow: `0 6px 20px rgba(6,68,107,0.28)`,
                        border: `3px solid rgba(156,205,219,0.50)`,
                        overflow: 'hidden',
                        transition: 'all 0.3s ease',
                        cursor: currentImage ? 'pointer' : 'default',
                      }}
                      onClick={handlePhotoClick}
                      onMouseEnter={(e) => {
                        if (currentImage) {
                          e.currentTarget.style.transform = 'scale(1.05)';
                          e.currentTarget.style.boxShadow = '0 8px 30px rgba(6,68,107,0.40)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(6,68,107,0.28)';
                      }}
                    >
                      {currentImage ? (
                        <img 
                          src={currentImage} 
                          alt="Profile" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            const parent = e.target.parentElement;
                            if (parent) {
                              parent.textContent = user?.name?.charAt(0) || 'A';
                              parent.style.background = avatarGradient;
                              parent.style.display = 'flex';
                              parent.style.alignItems = 'center';
                              parent.style.justifyContent = 'center';
                            }
                          }}
                        />
                      ) : (
                        user?.name?.charAt(0) ?? 'A'
                      )}
                      {currentImage && (
                        <div className="hover-zoom-label" style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          background: 'rgba(0,0,0,0.60)',
                          color: T.white,
                          fontSize: '8px',
                          fontWeight: 600,
                          textAlign: 'center',
                          padding: '3px 0',
                          borderRadius: '0 0 50% 50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '3px',
                        }}>
                          <ZoomIn size={10} />
                          Klik untuk perbesar
                        </div>
                      )}
                    </div>
                    {previewImage && (
                      <div style={{
                        position: 'absolute', top: '-4px', right: '-4px',
                        background: T.mid,
                        borderRadius: '50%',
                        padding: '2px',
                      }}>
                        <div style={{
                          background: T.white,
                          borderRadius: '50%',
                          padding: '2px 4px',
                          fontSize: '8px',
                          fontWeight: 700,
                          color: T.mid,
                        }}>
                          PREVIEW
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                        id="profile-image-input"
                      />
                      <label
                        htmlFor="profile-image-input"
                        style={{
                          padding: '9px 20px', borderRadius: '12px', fontSize: '13px',
                          fontWeight: 700, cursor: 'pointer',
                          background: `linear-gradient(135deg, ${T.mid} 0%, ${T.navy} 100%)`,
                          color: T.white, border: 'none',
                          boxShadow: '0 4px 14px rgba(6,68,107,0.28)',
                          transition: 'transform 0.18s cubic-bezier(.34,1.56,.64,1), box-shadow 0.18s ease',
                          fontFamily: "'Poppins', system-ui",
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 8px 20px rgba(6,68,107,0.36)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 14px rgba(6,68,107,0.28)';
                        }}
                      >
                        <Camera size={14} />
                        Pilih Foto
                      </label>
                      
                      {currentImage && !previewImage && (
                        <button
                          onClick={handleRemovePhoto}
                          style={{
                            padding: '9px 16px', borderRadius: '12px', fontSize: '13px',
                            fontWeight: 700, cursor: 'pointer',
                            background: 'transparent',
                            color: '#dc2626', border: '1.5px solid #dc2626',
                            transition: 'all 0.2s',
                            fontFamily: "'Poppins', system-ui",
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,38,38,0.08)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <X size={14} />
                          Hapus
                        </button>
                      )}
                    </div>
                    
                    {previewImage && (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          onClick={handleUploadPhoto}
                          disabled={isUploadingPhoto}
                          style={{
                            padding: '9px 20px', borderRadius: '12px', fontSize: '13px',
                            fontWeight: 700, cursor: isUploadingPhoto ? 'not-allowed' : 'pointer',
                            background: isUploadingPhoto ? '#9CCDDB' : `linear-gradient(135deg, #22c55e 0%, #16a34a 100%)`,
                            color: T.white, border: 'none',
                            boxShadow: '0 4px 14px rgba(34,197,94,0.30)',
                            transition: 'transform 0.18s cubic-bezier(.34,1.56,.64,1), box-shadow 0.18s ease',
                            fontFamily: "'Poppins', system-ui",
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            opacity: isUploadingPhoto ? 0.7 : 1,
                          }}
                        >
                          {isUploadingPhoto ? <Loader size={14} className="animate-spin" /> : <Save size={14} />}
                          {isUploadingPhoto ? 'Uploading...' : 'Upload Foto'}
                        </button>
                        <button
                          onClick={handleCancelUpload}
                          style={{
                            padding: '9px 16px', borderRadius: '12px', fontSize: '13px',
                            fontWeight: 700, cursor: 'pointer',
                            background: 'transparent',
                            color: T.muted, border: '1.5px solid rgba(156,205,219,0.40)',
                            transition: 'all 0.2s',
                            fontFamily: "'Poppins', system-ui",
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <X size={14} />
                          Batal
                        </button>
                      </div>
                    )}
                    
                    <p style={{ fontSize: '11px', color: T.muted, margin: '4px 0 0', fontWeight: 450 }}>
                      JPG, PNG max 2MB. Klik foto untuk melihat secara penuh.
                    </p>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Informasi Dasar" subtitle="Nama, email, dan data akun utama" icon={User}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <InputField 
                      label="Nama Lengkap" 
                      value={nama} 
                      onChange={(e) => setNama(e.target.value)} 
                      disabled={!isEditing} 
                      icon={User} 
                    />
                    <InputField 
                      label="Role" 
                      value={user?.role?.toUpperCase() || '-'} 
                      disabled 
                      icon={Shield} 
                    />
                  </div>
                  <InputField 
                    label="Alamat Email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    disabled={!isEditing} 
                    icon={Mail} 
                  />

                  {user?.nim && (
                    <div style={{
                      padding: '10px 14px',
                      background: 'rgba(156,205,219,0.08)',
                      borderRadius: '10px',
                      border: '1px solid rgba(151,205,219,0.15)',
                    }}>
                      <p style={{ fontSize: '12px', color: T.muted, margin: 0 }}>
                        <strong>NIM:</strong> {user.nim}
                      </p>
                    </div>
                  )}

                  <div style={{
                    height: '1px', margin: '6px 0',
                    background: 'linear-gradient(90deg, rgba(151,205,219,0.40) 0%, transparent 80%)',
                  }} />

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '8px',
                          padding: '11px 26px', borderRadius: '14px', fontSize: '13.5px',
                          fontWeight: 700, cursor: 'pointer',
                          background: `linear-gradient(135deg, ${T.mid} 0%, ${T.navy} 100%)`,
                          color: T.white, border: 'none',
                          boxShadow: '0 4px 18px rgba(6,68,107,0.30)',
                          transition: 'transform 0.2s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s ease',
                          fontFamily: "'Poppins', system-ui",
                        }}
                      >
                        Ubah Profil
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={handleCancel}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            padding: '11px 26px', borderRadius: '14px', fontSize: '13.5px',
                            fontWeight: 700, cursor: 'pointer',
                            background: 'transparent',
                            color: T.navy, border: `1.5px solid ${T.mid}`,
                            transition: 'all 0.2s',
                            fontFamily: "'Poppins', system-ui",
                          }}
                        >
                          Batal
                        </button>
                        <button
                          onClick={handleSaveProfile}
                          disabled={isSavingProfile}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            padding: '11px 26px', borderRadius: '14px', fontSize: '13.5px',
                            fontWeight: 700, cursor: isSavingProfile ? 'not-allowed' : 'pointer',
                            background: isSavingProfile ? '#9CCDDB' : `linear-gradient(135deg, ${T.mid} 0%, ${T.navy} 100%)`,
                            color: T.white, border: 'none',
                            boxShadow: '0 4px 18px rgba(6,68,107,0.30)',
                            transition: 'transform 0.2s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s ease',
                            fontFamily: "'Poppins', system-ui",
                            opacity: isSavingProfile ? 0.7 : 1,
                          }}
                        >
                          {isSavingProfile ? <Loader size={16} className="animate-spin" /> : <Save size={15} strokeWidth={2.5} />}
                          {isSavingProfile ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </SectionCard>
            </>
          )}

          {/* TAB: KEAMANAN */}
          {activeNav === 'keamanan' && (
            <SectionCard title="Keamanan Akun" subtitle="Ubah password dan konfigurasi autentikasi" icon={Lock}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <InputField 
                  label="Password Saat Ini" 
                  type="password" 
                  placeholder="Masukkan password lama" 
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  icon={Lock}
                  error={passwordErrors.oldPassword}
                />
                <InputField 
                  label="Password Baru" 
                  type="password" 
                  placeholder="Minimal 6 karakter" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  icon={Lock}
                  error={passwordErrors.newPassword}
                />
                <InputField 
                  label="Konfirmasi Password Baru" 
                  type="password" 
                  placeholder="Ulangi password baru" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  icon={Lock}
                  error={passwordErrors.confirmPassword}
                />

                <div style={{
                  display: 'flex', gap: '10px', alignItems: 'flex-start',
                  padding: '12px 14px', borderRadius: '12px',
                  background: 'rgba(156,205,219,0.12)',
                  border: '1px solid rgba(151,205,219,0.28)',
                  marginTop: '4px',
                }}>
                  <CheckCircle2 size={16} color={T.mid} strokeWidth={2} style={{ flexShrink: 0, marginTop: '1px' }} />
                  <p style={{ fontSize: '12px', color: T.muted, margin: 0, lineHeight: 1.6 }}>
                    Gunakan kombinasi huruf besar, huruf kecil, angka, dan simbol untuk password yang kuat.
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                  <button
                    onClick={handleChangePassword}
                    disabled={isChangingPassword}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '8px',
                      padding: '11px 26px', borderRadius: '14px', fontSize: '13.5px',
                      fontWeight: 700, cursor: isChangingPassword ? 'not-allowed' : 'pointer',
                      background: isChangingPassword ? '#9CCDDB' : `linear-gradient(135deg, ${T.mid} 0%, ${T.navy} 100%)`,
                      color: T.white, border: 'none',
                      boxShadow: '0 4px 18px rgba(6,68,107,0.30)',
                      transition: 'transform 0.2s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s ease',
                      fontFamily: "'Poppins', system-ui",
                      opacity: isChangingPassword ? 0.7 : 1,
                    }}
                  >
                    {isChangingPassword ? <Loader size={16} className="animate-spin" /> : <Save size={15} strokeWidth={2.5} />}
                    {isChangingPassword ? 'Memproses...' : 'Perbarui Password'}
                  </button>
                </div>
              </div>
            </SectionCard>
          )}

          {/* TAB: NOTIFIKASI */}
          {activeNav === 'notifikasi' && (
            <SectionCard title="Preferensi Notifikasi" subtitle="Atur kapan dan bagaimana Anda menerima notifikasi" icon={Bell}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {[
                  { key: 'mahasiswaBerisiko', label: 'Mahasiswa Berisiko Baru', desc: 'Notifikasi saat ada mahasiswa baru masuk kategori berisiko', checked: preferences.mahasiswaBerisiko },
                  { key: 'updateCapstoneSkripsi', label: 'Update Status Capstone & Skripsi', desc: 'Pemberitahuan perubahan status skripsi & capstone mahasiswa', checked: preferences.updateCapstoneSkripsi },
                  { key: 'laporanMingguan', label: 'Laporan Mingguan', desc: 'Ringkasan performa akademik setiap akhir pekan', checked: preferences.laporanMingguan },
                  { key: 'uploadKHSBerhasil', label: 'Upload KHS Berhasil', desc: 'Konfirmasi setelah proses import data selesai', checked: preferences.uploadKHSBerhasil },
                ].map((item, i, arr) => (
                  <div
                    key={item.key}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '14px 0',
                      borderBottom: i < arr.length - 1 ? '1px solid rgba(151,205,219,0.18)' : 'none',
                    }}
                  >
                    <div>
                      <p style={{ fontSize: '13.5px', fontWeight: 600, color: T.navy, margin: '0 0 2px' }}>
                        {item.label}
                      </p>
                      <p style={{ fontSize: '11.5px', color: T.muted, margin: 0, fontWeight: 450 }}>
                        {item.desc}
                      </p>
                    </div>
                    <ToggleSwitch 
                      defaultOn={item.checked} 
                      onChange={(value) => handlePreferenceChange(item.key, value)}
                    />
                  </div>
                ))}

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.2rem' }}>
                  <button
                    onClick={savePreferences}
                    disabled={isSavingPreferences}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '8px',
                      padding: '11px 26px', borderRadius: '14px', fontSize: '13.5px',
                      fontWeight: 700, cursor: isSavingPreferences ? 'not-allowed' : 'pointer',
                      background: isSavingPreferences ? '#9CCDDB' : `linear-gradient(135deg, ${T.mid} 0%, ${T.navy} 100%)`,
                      color: T.white, border: 'none',
                      boxShadow: '0 4px 18px rgba(6,68,107,0.30)',
                      transition: 'transform 0.2s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s ease',
                      fontFamily: "'Poppins', system-ui",
                      opacity: isSavingPreferences ? 0.7 : 1,
                    }}
                  >
                    {isSavingPreferences ? <Loader size={16} className="animate-spin" /> : <Save size={15} strokeWidth={2.5} />}
                    {isSavingPreferences ? 'Menyimpan...' : 'Simpan Preferensi'}
                  </button>
                </div>
              </div>
            </SectionCard>
          )}

        </div>
      </div>
    </div>
  </div>

  {/* ============================================ */}
  {/* ✅ MODAL KONFIRMASI HAPUS FOTO */}
  {/* ============================================ */}
  {showDeleteConfirm && (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(6,68,107,0.60)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.25s ease',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) setShowDeleteConfirm(false);
      }}
    >
      <div 
        style={{
          backgroundColor: T.white,
          borderRadius: '24px',
          maxWidth: '420px',
          width: '100%',
          padding: '2rem',
          boxShadow: '0 20px 60px rgba(6,68,107,0.25)',
          animation: 'slideUp 0.3s cubic-bezier(.34,1.56,.64,1)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Accent line */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${T.navy}, ${T.mid}, ${T.sky})`,
        }} />

        {/* Icon */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem',
          marginTop: '0.5rem',
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(220,38,38,0.10)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <X size={32} color="#dc2626" strokeWidth={2} />
          </div>
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: '18px',
          fontWeight: 700,
          color: T.navy,
          textAlign: 'center',
          margin: '0 0 0.5rem 0',
          fontFamily: "'Poppins', system-ui",
        }}>
          Hapus Foto Profil?
        </h3>

        {/* Description */}
        <p style={{
          fontSize: '13.5px',
          color: T.muted,
          textAlign: 'center',
          margin: '0 0 1.5rem 0',
          lineHeight: 1.6,
          fontFamily: "'Poppins', system-ui",
        }}>
          Foto profil Anda akan dihapus secara permanen. 
          Anda dapat mengunggah foto baru kapan saja.
        </p>

        {/* Preview foto */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem',
        }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: `3px solid rgba(220,38,38,0.20)`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }}>
            <img 
              src={profileImage || user?.profileImage || user?.profile_image} 
              alt="Profile"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setShowDeleteConfirm(false)}
            style={{
              flex: 1,
              padding: '12px 20px',
              borderRadius: '14px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              border: `1.5px solid ${T.glassBorder}`,
              background: 'transparent',
              color: T.muted,
              transition: 'all 0.2s',
              fontFamily: "'Poppins', system-ui",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(156,205,219,0.08)';
              e.currentTarget.style.borderColor = T.mid;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = T.glassBorder;
            }}
          >
            Batal
          </button>
          <button
            onClick={handleDeletePhoto}
            style={{
              flex: 1,
              padding: '12px 20px',
              borderRadius: '14px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
              color: T.white,
              boxShadow: '0 4px 14px rgba(220,38,38,0.35)',
              transition: 'transform 0.18s cubic-bezier(.34,1.56,.64,1), box-shadow 0.18s ease',
              fontFamily: "'Poppins', system-ui",
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(220,38,38,0.45)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(220,38,38,0.35)';
            }}
          >
            <X size={16} strokeWidth={2.5} />
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  )}

  {/* ============================================ */}
  {/* ✅ MODAL PREVIEW FOTO (ZOOM) */}
  {/* ============================================ */}
  {showPhotoPreview && (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(6,68,107,0.80)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        animation: 'fadeIn 0.25s ease',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) setShowPhotoPreview(false);
      }}
    >
      <div 
        style={{
          position: 'relative',
          maxWidth: '600px',
          maxHeight: '80vh',
          width: '100%',
          animation: 'zoomIn 0.3s cubic-bezier(.34,1.56,.64,1)',
        }}
      >
        {/* Tombol Close */}
        <button
          onClick={() => setShowPhotoPreview(false)}
          style={{
            position: 'absolute',
            top: '-16px',
            right: '-16px',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: 'none',
            background: T.white,
            boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s ease',
            zIndex: 10,
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <X size={20} color={T.navy} strokeWidth={2.5} />
        </button>

        {/* Image */}
        <div style={{
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.40)',
          background: T.white,
        }}>
          <img 
            src={profileImage || user?.profileImage || user?.profile_image} 
            alt="Profile Preview"
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              objectFit: 'contain',
              maxHeight: '70vh',
            }}
            onError={(e) => {
              console.error('❌ Preview image failed to load');
              toast.error('Gagal memuat foto');
              setShowPhotoPreview(false);
            }}
          />
        </div>

        {/* Info */}
        <div style={{
          textAlign: 'center',
          marginTop: '1rem',
          color: T.white,
          fontSize: '13px',
          fontWeight: 500,
          opacity: 0.8,
          fontFamily: "'Poppins', system-ui",
        }}>
          Klik di luar gambar untuk menutup
        </div>
      </div>
    </div>
  )}
  </>
  );
};

export default Settings;