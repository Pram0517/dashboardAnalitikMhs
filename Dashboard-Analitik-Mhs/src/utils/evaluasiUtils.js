// [UTIL] evaluasiUtils - Menangani logika bisnis untuk Evaluasi Studi UAD dan Status Skripsi

export const hitungStatusEvaluasi = (mahasiswa) => {
  const { semester, ipk, sksDenganNilaiMinC, semesterTidakRegistrasi } = mahasiswa;

  // Cek Gugur Studi
  if (semesterTidakRegistrasi >= 4) {
    return {
      status: "Gugur Studi",
      pemicu: "Mangkir / tidak registrasi selama 4 semester berturut-turut atau lebih."
    };
  }

  // Cek ES-3
  if (semester >= 14) {
    if (sksDenganNilaiMinC >= 144) {
      // asumsi 144 lulus
    } else {
      return {
        status: "Drop Out ES-3",
        pemicu: "Hingga akhir semester 14 belum dapat menyelesaikan studi."
      };
    }
  }

  if (semester > 12) {
    if (ipk >= 2.0 && sksDenganNilaiMinC >= 140) {
      return { status: "Lolos ES-3", pemicu: "Lolos ES-3" };
    }
    // Jika masih di semester 13 dan belum memenuhi ES-3 tapi belum DO (karena DO ES-3 di sem 14)
    // Aturan spesifik tidak menyebut Kondisional ES-3, tapi amannya kita tunggu sem 14 untuk DO.
  }

  // Cek ES-2
  if (semester === 8 || semester === 9) {
    if (ipk < 2.0 && sksDenganNilaiMinC < 70) {
      return {
        status: "Drop Out ES-2",
        pemicu: `IPK ${ipk.toFixed(2)}, SKS Lulus C: ${sksDenganNilaiMinC} — di bawah batas ES-2.`
      };
    }
  }
  
  if (semester > 8) {
    if (ipk >= 2.0 && sksDenganNilaiMinC >= 80) {
      if (semester <= 12) return { status: "Lolos ES-2", pemicu: "Lolos ES-2" };
    } else if (ipk >= 2.0 && sksDenganNilaiMinC >= 70 && sksDenganNilaiMinC <= 79) {
      return {
        status: "Kondisional ES-2",
        pemicu: `SKS Lulus C: ${sksDenganNilaiMinC} (batas toleransi ES-2).`
      };
    }
  }

  // Cek ES-1
  if (semester === 4 || semester === 5) {
    if (ipk < 2.0 && sksDenganNilaiMinC < 20) {
      return {
        status: "Drop Out ES-1",
        pemicu: `IPK ${ipk.toFixed(2)}, SKS Lulus C: ${sksDenganNilaiMinC} — di bawah batas ES-1.`
      };
    }
  }
  
  if (semester > 4) {
    if (ipk >= 2.0 && sksDenganNilaiMinC >= 30) {
      if (semester <= 8) return { status: "Lolos ES-1", pemicu: "Lolos ES-1" };
    } else if (ipk >= 2.0 && sksDenganNilaiMinC >= 20 && sksDenganNilaiMinC <= 29) {
      return {
        status: "Kondisional ES-1",
        pemicu: `SKS Lulus C: ${sksDenganNilaiMinC} (batas toleransi ES-1).`
      };
    }
  }

  if (semester >= 1 && semester <= 3) {
    return {
      status: "Belum Evaluasi",
      pemicu: "Belum mencapai masa evaluasi studi pertama (ES-1 di sem 4)."
    };
  }

  // Fallback
  return {
    status: "Aktif Normal",
    pemicu: "Studi berjalan normal sesuai dengan parameter angkatan saat ini."
  };
};

export const cekStatusSkripsi = (nim, semester, skripsiData) => {
  // [BACKEND] GET /api/skripsi/status/:nim — Mengambil status pendaftaran dan progress skripsi mahasiswa berdasarkan NIM.
  if (semester < 7) {
    return 'Belum Waktunya'; // Atau nilai lain jika diperlukan, tapi UI mungkin hanya peduli semester >= 7
  }
  const skripsi = skripsiData.find(s => s.nim === nim);
  if (!skripsi) {
    return 'Belum Daftar';
  }
  if (skripsi.status === "Selesai") {
    return 'Selesai';
  }
  return 'Sedang Proses';
};
