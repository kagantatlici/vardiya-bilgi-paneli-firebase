import { CaptainService, LeaveService, ShiftService } from '../services/database';
import { realCaptainsData } from '../data/captainsData';

// Migration script to populate Firestore with existing data
export async function migrateAllData() {
  try {
    console.log('🚀 Starting data migration...');

    // 1. Migrate Captains Data
    console.log('📋 Migrating captains data...');
    await migrateCaptains();

    // 2. Migrate Leave Data
    console.log('🏖️ Migrating leave data...');
    await migrateLeaves();

    // 3. Migrate Shift Data
    console.log('📅 Migrating shift data...');
    await migrateShifts();

    console.log('✅ Data migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
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
  
  console.log(`✅ Migrated ${captainsWithOrder.length} captains`);
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
  
  console.log(`✅ Migrated ${summerLeaves.length} leave entries`);
}

async function migrateShifts() {
  // Shift data for 2025 (from the existing shift schedule)
  const shiftSchedule2025 = {
    // January 2025
    "2025-01-02": 1, "2025-01-03": 1, "2025-01-04": 1, "2025-01-05": 1, "2025-01-06": 1, "2025-01-07": 1,
    "2025-01-08": 2, "2025-01-09": 2, "2025-01-10": 2, "2025-01-11": 2, "2025-01-12": 2, "2025-01-13": 2,
    "2025-01-14": 3, "2025-01-15": 3, "2025-01-16": 3, "2025-01-17": 3, "2025-01-18": 3, "2025-01-19": 3,
    "2025-01-20": 4, "2025-01-21": 4, "2025-01-22": 4, "2025-01-23": 4, "2025-01-24": 4, "2025-01-25": 4,
    "2025-01-26": 5, "2025-01-27": 5, "2025-01-28": 5, "2025-01-29": 5, "2025-01-30": 5, "2025-01-31": 5,
    
    // February 2025
    "2025-02-01": 6, "2025-02-02": 6, "2025-02-03": 6, "2025-02-04": 6, "2025-02-05": 6, "2025-02-06": 6,
    "2025-02-07": 7, "2025-02-08": 7, "2025-02-09": 7, "2025-02-10": 7, "2025-02-11": 7, "2025-02-12": 7,
    
    // Add more months as needed - for now focusing on August-September
    // August 2025
    "2025-08-15": 38, "2025-08-16": 38, "2025-08-17": 38, "2025-08-18": 38, "2025-08-19": 38, "2025-08-20": 38,
    "2025-08-21": 39, "2025-08-22": 39, "2025-08-23": 39, "2025-08-24": 39, "2025-08-25": 39, "2025-08-26": 39,
    "2025-08-27": 40, "2025-08-28": 40, "2025-08-29": 40, "2025-08-30": 40, "2025-08-31": 40,
    
    // September 2025
    "2025-09-01": 40,
    "2025-09-02": 41, "2025-09-03": 41, "2025-09-04": 41, "2025-09-05": 41, "2025-09-06": 41, "2025-09-07": 41,
    "2025-09-08": 42, "2025-09-09": 42, "2025-09-10": 42, "2025-09-11": 42, "2025-09-12": 42, "2025-09-13": 42,
    "2025-09-14": 43, "2025-09-15": 43, "2025-09-16": 43, "2025-09-17": 43, "2025-09-18": 43, "2025-09-19": 43,
  };

  const shifts = Object.entries(shiftSchedule2025).map(([dateStr, shiftNumber]) => {
    const date = new Date(dateStr);
    return {
      id: dateStr,
      date: dateStr,
      shiftNumber: shiftNumber as number,
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate()
    };
  });

  await ShiftService.bulkAddShifts(shifts);
  console.log(`✅ Migrated ${shifts.length} shift entries`);
}

// Export for use in components
export { migrateAllData as default };