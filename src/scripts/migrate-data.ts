import { CaptainService, LeaveService } from '../services/database';
import { realCaptainsData } from '../data/captainsData';
import { migrateFullShiftCalendar } from './migrate-full-shifts';

// Migration script to populate Firestore with existing data
export async function migrateAllData() {
  // 1. Migrate Captains Data
  await migrateCaptains();

  // 2. Migrate Leave Data
  await migrateLeaves();

  // 3. Migrate Full Shift Calendar (2025-2027)
  await migrateFullShiftCalendar();
}

async function migrateCaptains() {
  const captainsWithOrder = realCaptainsData.map((captain, index) => ({
    sicilNo: captain.sicilNo,
    isim: captain.isim,
    aisMobNo: captain.aisMobNo,
    aktifEhliyetler: captain.aktifEhliyetler,
    tumEhliyetler: captain.tumEhliyetler,
    melbusat: captain.melbusat,
    durum: captain.durum,
    siraNo: index + 1
  }));

  for (const captain of captainsWithOrder) {
    await CaptainService.addCaptain(captain);
  }
}

async function migrateLeaves() {
  const summerLeaves = [
    // Ağustos 2025 izin planı
    { weekNumber: 35, startDate: "28 Temmuz", endDate: "02 Ağustos", year: 2025, month: "Ağustos", pilots: ["Selahattin KUT", "Uğraş AKYOL"], approved: true, type: "summer" as const },
    { weekNumber: 36, startDate: "03 Ağustos", endDate: "08 Ağustos", year: 2025, month: "Ağustos", pilots: ["Selim KANDEMİRLİ"], approved: true, type: "summer" as const },
    { weekNumber: 37, startDate: "09 Ağustos", endDate: "14 Ağustos", year: 2025, month: "Ağustos", pilots: ["Uğraş AKYOL", "M.Kemal ONUR", "Selahattin KUT"], approved: true, type: "summer" as const },
    { weekNumber: 38, startDate: "15 Ağustos", endDate: "20 Ağustos", year: 2025, month: "Ağustos", pilots: ["Uğraş AKYOL", "Kağan TATLICI", "Harun DOKUZ (BK)"], approved: true, type: "summer" as const },
    { weekNumber: 39, startDate: "21 Ağustos", endDate: "26 Ağustos", year: 2025, month: "Ağustos", pilots: ["Turgut KAYA", "Berker İRİCİOĞLU", "Cihan BASA"], approved: true, type: "summer" as const },
    { weekNumber: 40, startDate: "27 Ağustos", endDate: "01 Eylül", year: 2025, month: "Ağustos", pilots: ["Serhat YALÇIN", "Aytaç BAHADIR", "Taylan GÜLER"], approved: true, type: "summer" as const },
    // Eylül 2025 izin planı
    { weekNumber: 41, startDate: "02 Eylül", endDate: "07 Eylül", year: 2025, month: "Eylül", pilots: ["Kıvanç ERGÖNÜL", "Selahattin KUT", "Aytaç BAHADIR"], approved: true, type: "summer" as const },
    { weekNumber: 42, startDate: "08 Eylül", endDate: "13 Eylül", year: 2025, month: "Eylül", pilots: ["Kıvanç ERGÖNÜL"], approved: true, type: "summer" as const },
    { weekNumber: 43, startDate: "14 Eylül", endDate: "19 Eylül", year: 2025, month: "Eylül", pilots: ["Kıvanç ERGÖNÜL", "Turgut KAYA"], approved: true, type: "summer" as const },
    { weekNumber: 44, startDate: "20 Eylül", endDate: "25 Eylül", year: 2025, month: "Eylül", pilots: [], approved: false, type: "summer" as const },
    { weekNumber: 45, startDate: "26 Eylül", endDate: "01 Ekim", year: 2025, month: "Eylül", pilots: [], approved: false, type: "summer" as const },
  ];

  for (const leave of summerLeaves) {
    await LeaveService.addLeave(leave);
  }
}


// Export for use in components
export { migrateAllData as default };