import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Upload as UploadIcon, FileText, CheckCircle, Clock, AlertCircle, Loader, X } from 'lucide-react';
import toast from 'react-hot-toast';

// ============ [PAGE: UPLOAD KHS] ============
// [KOMPONEN] Upload - Halaman bagi Mahasiswa untuk mengunggah file KHS PDF

const API_URL = 'http://localhost:5000/api';

const Upload = () => {
    const { user } = useAuth();
    const [file, setFile] = useState(null);
    const [semester, setSemester] = useState('');
    const [tahunAkademik, setTahunAkademik] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    // ============ FETCH RIWAYAT KHS ============
    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/upload/khs/history`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setHistory(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    // ============ HANDLE FILE CHANGE ============
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // Validasi tipe file
            const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
            if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.pdf')) {
                toast.error('Hanya file PDF yang diperbolehkan');
                setFile(null);
                e.target.value = null;
                return;
            }

            // Validasi ukuran file (max 5MB)
            if (selectedFile.size > 5 * 1024 * 1024) {
                toast.error('Ukuran file maksimal 5MB');
                setFile(null);
                e.target.value = null;
                return;
            }

            setFile(selectedFile);
        }
    };

    // ============ HANDLE UPLOAD ============
    const handleUpload = async () => {
        if (!file || !semester || !tahunAkademik) {
            toast.error('Semua field harus diisi');
            return;
        }

        setIsUploading(true);
        setProgress(0);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('semester', semester);
        formData.append('tahunAkademik', tahunAkademik);

        try {
            const token = localStorage.getItem('token');

            // Gunakan XMLHttpRequest untuk tracking progress
            const xhr = new XMLHttpRequest();

            const uploadPromise = new Promise((resolve, reject) => {
                xhr.open('POST', `${API_URL}/upload/khs`, true);
                xhr.setRequestHeader('Authorization', `Bearer ${token}`);

                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        const percentComplete = Math.round((event.loaded / event.total) * 100);
                        setProgress(percentComplete);
                    }
                };

                xhr.onload = () => {
                    if (xhr.status === 201) {
                        resolve(JSON.parse(xhr.responseText));
                    } else {
                        reject(new Error(xhr.responseText));
                    }
                };

                xhr.onerror = () => {
                    reject(new Error('Gagal mengupload file'));
                };

                xhr.send(formData);
            });

            const response = await uploadPromise;

            if (response.status === 'Success') {
                toast.success('KHS berhasil diunggah!');
                setFile(null);
                setSemester('');
                setTahunAkademik('');
                setProgress(100);
                // Reset input file
                document.getElementById('fileInput').value = '';
                // Refresh history
                await fetchHistory();
            }
        } catch (error) {
            console.error('Upload error:', error);
            let errorMessage = 'Gagal mengupload KHS';
            try {
                const errorData = JSON.parse(error.message);
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                // Jika response bukan JSON
                if (error.message.includes('401')) {
                    errorMessage = 'Sesi login telah berakhir. Silakan login ulang.';
                } else if (error.message.includes('413')) {
                    errorMessage = 'Ukuran file terlalu besar. Maksimal 5MB.';
                }
            }
            toast.error(errorMessage);
            setProgress(0);
        } finally {
            setIsUploading(false);
            // Reset progress setelah delay
            setTimeout(() => setProgress(0), 3000);
        }
    };

    // ============ REMOVE FILE ============
    const removeFile = () => {
        setFile(null);
        document.getElementById('fileInput').value = '';
    };

    // ============ GET STATUS BADGE ============
    const getStatusBadge = (status) => {
        const statusMap = {
            'Terverifikasi': { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
            'Ditolak': { bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle },
            'Menunggu Verifikasi': { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
        };
        const config = statusMap[status] || statusMap['Menunggu Verifikasi'];
        const Icon = config.icon;

        return (
            <span className={`px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 ${config.bg} ${config.text}`}>
                <Icon size={12} />
                {status}
            </span>
        );
    };

    // ============ LOADING STATE ============
    if (loading) {
        return (
            <div className="space-y-6 animate-fade-in font-sans">
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader size={40} className="animate-spin" style={{ color: '#06446B' }} />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in font-sans">
            <div>
                <h1 className="text-2xl font-extrabold text-accent2 flex items-center gap-2">
                    <UploadIcon size={24} className="text-accent1" />
                    Upload Kartu Hasil Studi (KHS)
                </h1>
                <p className="text-sm text-text-muted mt-1">
                    Mahasiswa wajib mengupload KHS setiap akhir semester agar data akademik diperbarui.
                </p>
            </div>

            {/* ─── FORM UPLOAD ─── */}
            <div className="card p-6 max-w-2xl">
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-semibold text-text-muted mb-2">Semester</label>
                        <select
                            value={semester}
                            onChange={(e) => setSemester(e.target.value)}
                            className="input-field"
                            disabled={isUploading}
                        >
                            <option value="">Pilih Semester...</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                                <option key={s} value={s}>Semester {s}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-text-muted mb-2">Tahun Akademik</label>
                        <select
                            value={tahunAkademik}
                            onChange={(e) => setTahunAkademik(e.target.value)}
                            className="input-field"
                            disabled={isUploading}
                        >
                            <option value="">Pilih Tahun Akademik...</option>
                            <option value="2022/2023 Ganjil">2022/2023 Ganjil</option>
                            <option value="2022/2023 Genap">2022/2023 Genap</option>
                            <option value="2023/2024 Ganjil">2023/2024 Ganjil</option>
                            <option value="2023/2024 Genap">2023/2024 Genap</option>
                            <option value="2024/2025 Ganjil">2024/2025 Ganjil</option>
                            <option value="2024/2025 Genap">2024/2025 Genap</option>
                            <option value="2025/2026 Ganjil">2025/2026 Ganjil</option>
                            <option value="2025/2026 Genap">2025/2026 Genap</option>
                        </select>
                    </div>
                </div>

                {/* ─── DROP ZONE ─── */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-text-muted mb-2">File KHS (PDF)</label>
                    <div className="border-2 border-dashed border-secondary/40 rounded-xl p-8 text-center hover:bg-secondary/5 transition-colors relative">
                        <input
                            id="fileInput"
                            type="file"
                            accept=".pdf,application/pdf"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={isUploading}
                        />

                        {file ? (
                            <div className="flex flex-col items-center">
                                <FileText size={48} className="text-accent1 mb-3" />
                                <p className="font-semibold text-accent2">{file.name}</p>
                                <p className="text-xs text-text-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                <button
                                    onClick={removeFile}
                                    className="mt-2 text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1"
                                    disabled={isUploading}
                                >
                                    <X size={14} /> Hapus File
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-text-muted">
                                <UploadIcon size={48} className="text-secondary mb-3" />
                                <p className="font-medium text-accent2">Klik atau seret file PDF ke sini</p>
                                <p className="text-xs">Maksimal 5MB. Hanya format .pdf yang diterima.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ─── PROGRESS BAR ─── */}
                {isUploading && (
                    <div className="mb-6">
                        <div className="flex justify-between text-xs mb-1 font-semibold text-accent2">
                            <span>Mengunggah...</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-secondary/20 rounded-full h-2.5 overflow-hidden">
                            <div
                                className="bg-accent1 h-2.5 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="text-xs text-text-muted mt-1 text-center">
                            {progress < 100 ? 'Mohon tunggu...' : 'Upload selesai!'}
                        </p>
                    </div>
                )}

                {/* ─── SUBMIT BUTTON ─── */}
                <button
                    onClick={handleUpload}
                    disabled={!file || !semester || !tahunAkademik || isUploading}
                    className="btn-primary w-full disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isUploading ? (
                        <>
                            <Loader size={18} className="animate-spin" />
                            Mengunggah...
                        </>
                    ) : (
                        <>
                            <UploadIcon size={18} />
                            Upload KHS
                        </>
                    )}
                </button>
            </div>

            {/* ─── RIWAYAT UPLOAD ─── */}
            <div className="card p-6">
                <h2 className="text-lg font-bold text-accent2 mb-4 flex items-center justify-between">
                    <span>Riwayat Upload</span>
                    <span className="text-sm font-normal text-text-muted">
                        Total: {history.length} file
                    </span>
                </h2>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-secondary/10 text-accent2 text-sm">
                                <th className="p-3 font-semibold rounded-tl-lg">Semester</th>
                                <th className="p-3 font-semibold">Tahun Akademik</th>
                                <th className="p-3 font-semibold">Tanggal Upload</th>
                                <th className="p-3 font-semibold">Nama File</th>
                                <th className="p-3 font-semibold rounded-tr-lg">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.length > 0 ? (
                                history.map((item) => {
                                    // ✅ FIX: Safe handling of null file_path
                                    const fileName = item.file_path 
                                        ? item.file_path.split('/').pop() 
                                        : 'File tidak tersedia';
                                    
                                    const fileUrl = item.file_path 
                                        ? `http://localhost:5000${item.file_path}` 
                                        : null;

                                    return (
                                        <tr key={item.id} className="border-b border-secondary/10 hover:bg-secondary/5 transition-colors text-sm">
                                            <td className="p-3 font-medium text-accent2">Semester {item.semester}</td>
                                            <td className="p-3">{item.tahun_akademik}</td>
                                            <td className="p-3">
                                                {new Date(item.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td className="p-3 text-accent1 font-medium">
                                                {fileUrl ? (
                                                    <a
                                                        href={fileUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="hover:underline flex items-center gap-1"
                                                    >
                                                        <FileText size={14} />
                                                        {fileName}
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-400 flex items-center gap-1">
                                                        <FileText size={14} />
                                                        {fileName}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-3">{getStatusBadge(item.status_verifikasi)}</td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="5" className="p-6 text-center text-text-muted">
                                        Belum ada riwayat upload KHS.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Upload;