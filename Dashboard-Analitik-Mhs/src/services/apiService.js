import { dummySkripsi as initialSkripsi } from '../data/skripsiData';
import { dummyCapstone as initialCapstone } from '../data/capstoneData';
import { dosenData } from '../data/dosenData';

// Local state for mock
let localSkripsi = [...initialSkripsi];
let localCapstone = [...initialCapstone];
let localDosen = [...dosenData];

// Simulasi network delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const apiService = {
  getSkripsiData: async () => {
    await delay();
    return [...localSkripsi];
  },
  
  getCapstoneData: async () => {
    await delay();
    return [...localCapstone];
  },
  
  getDosenData: async () => {
    await delay();
    const allStudents = [...localSkripsi, ...localCapstone];
    
    const enrichedDosen = localDosen.map(dosen => {
      const bimbingan = allStudents.filter(mhs => mhs.dosenId === dosen.id);
      return {
        ...dosen,
        bebanBimbingan: bimbingan.length,
        mahasiswaBimbingan: bimbingan
      };
    });
    
    return enrichedDosen;
  },

  getMahasiswaByNIM: async (nim) => {
    await delay();
    const allStudents = [...localSkripsi, ...localCapstone];
    const mhs = allStudents.find(s => s.nim === nim);
    
    if (!mhs) {
      throw new Error("Mahasiswa tidak ditemukan");
    }
    
    const isSkripsi = mhs.id.startsWith('S');
    const isCapstone = mhs.id.startsWith('C');
    
    return {
      ...mhs,
      tipeTugasAkhir: isSkripsi ? 'Skripsi' : isCapstone ? 'Capstone' : 'Unknown'
    };
  },

  addMahasiswa: async (data) => {
    await delay();
    const { tipe, nim, nama, judul, dosenId } = data;
    const dosen = localDosen.find(d => d.id === dosenId);
    
    if (!dosen) throw new Error("Dosen tidak ditemukan");

    const allStudents = [...localSkripsi, ...localCapstone];
    const bebanBimbingan = allStudents.filter(mhs => mhs.dosenId === dosenId).length;
    if (bebanBimbingan >= (dosen.kuota || 10)) {
      throw new Error(`Kapasitas bimbingan ${dosen.nama} sudah penuh (10/10).`);
    }

    if (allStudents.find(s => s.nim === nim)) {
      throw new Error(`NIM ${nim} sudah terdaftar.`);
    }

    const newMahasiswa = {
      id: tipe === 'Skripsi' ? `S${Date.now()}` : `C${Date.now()}`,
      nim,
      nama,
      angkatan: "2024",
      judul,
      dosenPembimbing: dosen.nama,
      dosenId: dosen.id,
      status: "Belum Mulai",
      tanggalUpdate: new Date().toISOString().split('T')[0],
      syarat: {
        herregistrasi: true,
        lunasBiaya: false,
        lulusTeoriPPL: false,
        lulusKKN: false,
        skripsiDisetujui: false,
        sertifikatAIK: false,
        sertifikatBTAQ: false
      }
    };

    if (tipe === 'Skripsi') {
      localSkripsi.push(newMahasiswa);
    } else {
      localCapstone.push(newMahasiswa);
    }

    return newMahasiswa;
  },

  updatePembimbing: async (nim, newDosenId) => {
    await delay();
    const newDosen = localDosen.find(d => d.id === newDosenId);
    if (!newDosen) throw new Error("Dosen pembimbing baru tidak ditemukan");

    const allStudents = [...localSkripsi, ...localCapstone];
    const bebanBimbingan = allStudents.filter(mhs => mhs.dosenId === newDosenId).length;
    if (bebanBimbingan >= (newDosen.kuota || 10)) {
      throw new Error(`Kapasitas bimbingan ${newDosen.nama} sudah penuh (10/10).`);
    }

    const updateStudent = (list) => {
      const index = list.findIndex(s => s.nim === nim);
      if (index !== -1) {
        list[index].dosenId = newDosen.id;
        list[index].dosenPembimbing = newDosen.nama;
        return true;
      }
      return false;
    };

    if (!updateStudent(localSkripsi)) {
      if (!updateStudent(localCapstone)) {
        throw new Error("Mahasiswa tidak ditemukan");
      }
    }
    return true;
  },

  addDosen: async (data) => {
    await delay();
    const { nama, kuota } = data;
    
    if (!nama || nama.trim() === '') {
      throw new Error("Nama dosen tidak boleh kosong.");
    }
    
    const isDuplicate = localDosen.some(d => d.nama.toLowerCase() === nama.trim().toLowerCase());
    if (isDuplicate) {
      throw new Error(`Dosen dengan nama "${nama}" sudah terdaftar.`);
    }

    const newId = `D${String(localDosen.length + 1).padStart(2, '0')}`;
    const newDosenData = {
      id: newId,
      nama: nama.trim(),
      nip: `19${Math.floor(100000 + Math.random() * 900000)}200${Math.floor(10 + Math.random() * 90)}100${Math.floor(1 + Math.random() * 9)}`,
      kuota: kuota || 10
    };
    
    localDosen.push(newDosenData);
    return newDosenData;
  }
};
