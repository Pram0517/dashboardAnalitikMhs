// [UTIL] dashboardUtils - Menangani logika kalkulasi metrik Dashboard

export const hitungPersentaseLulusTepatWaktu = (mahasiswaList, skripsiData) => {
  // [BACKEND] GET /api/dashboard/statistik — Mengambil semua metrik dashboard termasuk persentase lulus tepat waktu yang dihitung dari data historis kelulusan mahasiswa
  
  // Mahasiswa dianggap lulus tepat waktu jika:
  // 1. Total SKS >= 144
  // 2. Status skripsi == "Selesai"
  // 3. Semester <= 8
  
  // Karena data dummy menggunakan angkatan dan semester saat ini, 
  // kita perlu asumsikan mahasiswa yang sudah lulus di data.
  // Untuk menghitung rasio, kita butuh mahasiswa yang angkatannya "sudah waktunya lulus" (semester >= 8).

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const mahasiswaEligible = mahasiswaList.filter(m => {
    const angkatanYear = parseInt(m.angkatan);
    const yearsPassed = currentYear - angkatanYear;
    let semester = yearsPassed * 2;
    if (currentMonth >= 7) semester += 1;
    // Angkatan yang sudah mencapai atau melewati batas 8 semester (waktunya lulus)
    return semester >= 8;
  });

  if (mahasiswaEligible.length === 0) return 0;

  const lulusTepatWaktu = mahasiswaEligible.filter(m => {
    // Cari data skripsi
    const skripsi = skripsiData.find(s => s.nim === m.nim);
    const skripsiSelesai = skripsi && skripsi.status === "Selesai";
    // Atau jika disimulasikan melalui status kelulusan di dummy:
    const lulus = m.status === "Lulus" || (m.sks >= 144 && skripsiSelesai);
    
    // Apakah lulusnya di <= 8 semester? Karena di dunia nyata kita punya data historis.
    // Di data dummy ini, anggap mereka lulus Tepat Waktu jika memang Lulus.
    // (Bisa juga ditambahkan parameter tambahan di dummy kalau mau lebih strict)
    return lulus;
  });

  return ((lulusTepatWaktu.length / mahasiswaEligible.length) * 100).toFixed(1);
};
