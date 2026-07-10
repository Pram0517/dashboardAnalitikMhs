import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Pembimbing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect otomatis ke halaman Dosen Skripsi
    navigate('/dosen-skripsi', { replace: true });
  }, [navigate]);

  return null;
};

export default Pembimbing;