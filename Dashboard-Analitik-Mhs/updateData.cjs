const fs = require('fs');

const dosenData = [
  { id: "D01", nama: "Sri Handayaningsih, ST.,MT." },
  { id: "D02", nama: "Iwan Tri Riyadi Yanto, S.Si., M.I.T., Ph.D" },
  { id: "D03", nama: "Dr. Arif Rahman, S.Kom., M.T." },
  { id: "D04", nama: "Imam Azhari, S.Si., M.Cs." },
  { id: "D05", nama: "Suprihatin, S.Si., M.Kom." },
  { id: "D06", nama: "Farid Suryanto, S.Pd., MT." },
  { id: "D07", nama: "Dr. Mursid Wahyu Hananto, S.Si., M.Kom." },
  { id: "D08", nama: "Tawar, S.Si., M.Kom." },
  { id: "D09", nama: "Prof. Dr. Ir. Imam Riadi, M.Kom." },
  { id: "D10", nama: "Azty Acbarrifha Nour, S.T., M.Eng." }
];

const skripsiCounts = [5, 4, 3, 2, 2, 1, 1, 1, 1, 0];
const capstoneCounts = [5, 4, 2, 3, 1, 2, 1, 1, 0, 1];

const skripsiFile = './src/data/skripsiData.js';
let skripsiStr = fs.readFileSync(skripsiFile, 'utf8');

let skripsiIdx = 0;
skripsiStr = skripsiStr.replace(/dosenPembimbing: ".*?",\n\s+dosenId: ".*?"/g, (match) => {
  let count = 0;
  let dIdx = 0;
  for (let i = 0; i < skripsiCounts.length; i++) {
    count += skripsiCounts[i];
    if (skripsiIdx < count) {
      dIdx = i;
      break;
    }
  }
  skripsiIdx++;
  return `dosenPembimbing: "${dosenData[dIdx].nama}",\n    dosenId: "${dosenData[dIdx].id}"`;
});
fs.writeFileSync(skripsiFile, skripsiStr);

const capstoneFile = './src/data/capstoneData.js';
let capstoneStr = fs.readFileSync(capstoneFile, 'utf8');

let capstoneIdx = 0;
capstoneStr = capstoneStr.replace(/dosenPembimbing: ".*?",\n\s+dosenId: ".*?"/g, (match) => {
  let count = 0;
  let dIdx = 0;
  for (let i = 0; i < capstoneCounts.length; i++) {
    count += capstoneCounts[i];
    if (capstoneIdx < count) {
      dIdx = i;
      break;
    }
  }
  capstoneIdx++;
  return `dosenPembimbing: "${dosenData[dIdx].nama}",\n    dosenId: "${dosenData[dIdx].id}"`;
});
fs.writeFileSync(capstoneFile, capstoneStr);

console.log("Updated data files");
