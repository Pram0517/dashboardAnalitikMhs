import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Loader } from 'lucide-react';

// ============ [PAGE SECTION] ============
// [KOMPONEN] ResetPassword - Halaman untuk request dan reset password

const API_URL = 'https://dashboardanalitikmhs-production.up.railway.app/api';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [step, setStep] = useState(token ? 'reset' : 'request');
    
    // Step 1: Request Reset
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    // Step 2: Reset Password
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isResetting, setIsResetting] = useState(false);
    const [resetError, setResetError] = useState('');

    // ============ HANDLE REQUEST RESET ============
    const handleRequestReset = async (e) => {
        e.preventDefault();
        setError('');

        if (!email) {
            setError('Email wajib diisi');
            return;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Format email tidak valid');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setIsSuccess(true);
                toast.success('Link reset password telah dikirim ke email Anda');
            } else {
                setError(data.message || 'Gagal mengirim link reset password');
            }
        } catch (error) {
            console.error('Reset password error:', error);
            setError('Gagal terhubung ke server');
        } finally {
            setIsLoading(false);
        }
    };

    // ============ HANDLE CONFIRM RESET ============
    const handleConfirmReset = async (e) => {
        e.preventDefault();
        setResetError('');

        if (!newPassword || !confirmPassword) {
            setResetError('Semua field wajib diisi');
            return;
        }

        if (newPassword.length < 6) {
            setResetError('Password minimal 6 karakter');
            return;
        }

        if (newPassword !== confirmPassword) {
            setResetError('Password tidak sama');
            return;
        }

        setIsResetting(true);

        try {
            const response = await fetch(`${API_URL}/auth/reset-password/confirm`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    newPassword,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Password berhasil direset! Silakan login.');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setResetError(data.message || 'Gagal mereset password');
            }
        } catch (error) {
            console.error('Confirm reset error:', error);
            setResetError('Gagal terhubung ke server');
        } finally {
            setIsResetting(false);
        }
    };

    // ============ RENDER: REQUEST FORM ============
    if (step === 'request') {
        return (
            <div className="card w-full p-8 animate-in fade-in zoom-in-95 duration-300">
                <Link to="/login" className="inline-flex items-center text-sm text-text-muted hover:text-accent1 transition-colors mb-6">
                    <ArrowLeft size={16} className="mr-1" /> Kembali ke Login
                </Link>

                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-accent2">Reset Password</h1>
                    <p className="text-text-muted text-sm mt-2">
                        Masukkan email yang terdaftar untuk menerima link reset password.
                    </p>
                </div>

                {isSuccess ? (
                    <div className="bg-green-50 border border-green-200 text-green-700 p-6 rounded-xl text-center">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="font-semibold mb-1">Berhasil Terkirim!</h3>
                        <p className="text-sm">Silakan periksa kotak masuk email Anda dan ikuti instruksi yang diberikan.</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="mt-4 btn-primary text-sm"
                        >
                            Kembali ke Login
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleRequestReset} className="space-y-5">
                        {error && (
                            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm border border-red-200">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-text-main mb-1">Email Akademik</label>
                            <input
                                type="email"
                                className="input-field"
                                placeholder="contoh: nama@uad.ac.id"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn-primary w-full mt-4 py-3 flex justify-center items-center"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader size={18} className="animate-spin" />
                            ) : 'Kirim Link Reset'}
                        </button>
                    </form>
                )}
            </div>
        );
    }

    // ============ RENDER: RESET FORM ============
    return (
        <div className="card w-full p-8 animate-in fade-in zoom-in-95 duration-300">
            <Link to="/login" className="inline-flex items-center text-sm text-text-muted hover:text-accent1 transition-colors mb-6">
                <ArrowLeft size={16} className="mr-1" /> Kembali ke Login
            </Link>

            <div className="mb-8">
                <h1 className="text-2xl font-bold text-accent2">Buat Password Baru</h1>
                <p className="text-text-muted text-sm mt-2">
                    Masukkan password baru untuk akun Anda.
                </p>
            </div>

            <form onSubmit={handleConfirmReset} className="space-y-5">
                {resetError && (
                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm border border-red-200">
                        {resetError}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-text-main mb-1">Password Baru</label>
                    <input
                        type="password"
                        className="input-field"
                        placeholder="Minimal 6 karakter"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-main mb-1">Konfirmasi Password</label>
                    <input
                        type="password"
                        className="input-field"
                        placeholder="Ulangi password baru"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>

                <button
                    type="submit"
                    className="btn-primary w-full mt-4 py-3 flex justify-center items-center"
                    disabled={isResetting}
                >
                    {isResetting ? (
                        <Loader size={18} className="animate-spin" />
                    ) : 'Reset Password'}
                </button>
            </form>
        </div>
    );
};

export default ResetPassword;