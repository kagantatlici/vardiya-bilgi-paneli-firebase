import React, { useState, useMemo, useCallback, startTransition, useEffect, useRef } from "react";
import CaptainInfoTable from "./CaptainInfoTable";
import ProtocolViewer from "./ProtocolViewer";
import BonusTable from "./BonusTable";
import LeaveManagement from "./LeaveManagement";
import AuditLogPanel from "./AuditLogPanel";
import { setActorName } from "../services/actor";
import { useAutoMigration } from "../hooks/useAutoMigration";
import { ShiftService, LeaveService, CaptainService } from "../services/database";
import type { ShiftData as FirestoreShiftData, LeaveEntry, Captain } from "../services/database";
import { getNextUpcomingBonus } from "../data/bonuses";

  type View = "main" | "captains" | "protocol" | "bonus" | "leave" | "yearly";

interface ShiftData {
  [key: string]: number; // "YYYY-MM-DD": shiftNumber
}

interface ShiftInfo {
  shiftNumber: number;
  startDate: string;
  endDate: string;
  startDateObj: Date;
  endDateObj: Date;
}

const MainScreen: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>("main");
  const { isInitialized, hasError } = useAutoMigration();
  const [today] = useState<Date>(new Date());
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());
  const [yearlyYear, setYearlyYear] = useState<number>(new Date().getFullYear());
  const yearlyGridRef = useRef<HTMLDivElement | null>(null);
  const yearlyCaptureRef = useRef<HTMLDivElement | null>(null);

  // Lazy-load html2canvas from CDN when needed
  const ensureHtml2Canvas = useCallback(async (): Promise<any> => {
    const w = window as any;
    if (w.html2canvas) return w.html2canvas;
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('html2canvas yüklenemedi'));
      document.body.appendChild(s);
    });
    return (window as any).html2canvas;
  }, []);

  const captureYearGrid = useCallback(async () => {
    const target = yearlyCaptureRef.current || yearlyGridRef.current;
    if (!target) return;
    try {
      const html2canvas = await ensureHtml2Canvas();
      const canvas = await html2canvas(target, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      const title = `3. Vardiya ${yearlyYear} Çalışma Takvimi`;
      const slugify = (s: string) => s
        .replace(/[İIı]/g, 'i')
        .replace(/[Şş]/g, 's')
        .replace(/[Ğğ]/g, 'g')
        .replace(/[Üü]/g, 'u')
        .replace(/[Öö]/g, 'o')
        .replace(/[Çç]/g, 'c')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      link.download = `${slugify(title)}.png`;
      link.click();
    } catch (e) {
      console.error('Ekran görüntüsü alınamadı:', e);
      alert('Ekran görüntüsü alınırken bir hata oluştu.');
    }
  }, [ensureHtml2Canvas, yearlyYear]);
  const [firestoreShifts, setFirestoreShifts] = useState<FirestoreShiftData[]>([]);
  const [shiftsLoaded, setShiftsLoaded] = useState<boolean>(false);
  const [leaveData, setLeaveData] = useState<LeaveEntry[]>([]);
  const [leaveDataLoaded, setLeaveDataLoaded] = useState<boolean>(false);
  const [captains, setCaptains] = useState<Captain[]>([]);
  const [captainsLoaded, setCaptainsLoaded] = useState<boolean>(false);

  const openExternalLink = useCallback((url: string) => {
    window.open(url, "_blank");
  }, []);

  const navigateTo = useCallback((view: View) => {
    startTransition(() => {
      setCurrentView(view);
    });
  }, []);

  const goBack = useCallback(() => {
    startTransition(() => {
      setCurrentView("main");
    });
  }, []);

  // Load shifts from Firestore
  useEffect(() => {
    const loadShifts = async () => {
      try {
        const shifts = await ShiftService.getAllShifts();
        setFirestoreShifts(shifts);
        setShiftsLoaded(true);
      } catch (error) {
        console.error("❌ Shifts yükleme hatası:", error);
        setShiftsLoaded(true); // Still set to true to show fallback
      }
    };

    if (isInitialized) {
      loadShifts();
    }
  }, [isInitialized]);

  // Load leave data from Firestore
  useEffect(() => {
    const loadLeaveData = async () => {
      try {
        const currentYear = new Date().getFullYear();
        const leaves = await LeaveService.getLeavesByYear(currentYear);
        setLeaveData(leaves);
        setLeaveDataLoaded(true);
      } catch (error) {
        console.error("❌ Leave data yükleme hatası:", error);
        setLeaveDataLoaded(true); // Still set to true to show fallback
      }
    };

    if (isInitialized) {
      loadLeaveData();
    }
  }, [isInitialized]);

  // Load captains data from Firestore
  useEffect(() => {
    const loadCaptains = async () => {
      try {
        const captainsData = await CaptainService.getAllCaptains();
        setCaptains(captainsData);
        setCaptainsLoaded(true);
      } catch (error) {
        console.error("❌ Captains yükleme hatası:", error);
        setCaptainsLoaded(true); // Still set to true to show fallback
      }
    };

    if (isInitialized) {
      loadCaptains();
    }
  }, [isInitialized]);

  // Create shift data from Firestore or fallback to hardcoded
  const createShiftData = (): ShiftData => {
    const shifts: ShiftData = {};
    
    if (shiftsLoaded && firestoreShifts.length > 0) {
      // Use Firestore data - convert continuous numbering to yearly display
      firestoreShifts.forEach(shift => {
        // Convert continuous shift numbers to yearly display numbers
        let displayShiftNumber = shift.shiftNumber;
        
        if (shift.year === 2025) {
          // 2025: shifts 1-61 display as 1-61
          displayShiftNumber = shift.shiftNumber;
        } else if (shift.year === 2026) {
          // 2026: shifts 61-122 display as 61,1-61 (61. vardiya 2026'da da 61 olarak gösterilsin)
          displayShiftNumber = shift.shiftNumber <= 61 ? shift.shiftNumber : shift.shiftNumber - 61;
        } else if (shift.year === 2027) {
          // 2027: shifts 122-183 display as 61,1-61
          displayShiftNumber = shift.shiftNumber <= 122 ? shift.shiftNumber - 61 : shift.shiftNumber - 122;
        }
        
        shifts[shift.date] = displayShiftNumber;
      });
    } else {
      // Fallback to hardcoded data (only for emergency)
      const fallbackShifts = [
        {shift: 61, date: "2025-12-31"}, {shift: 61, date: "2026-01-01"}, {shift: 61, date: "2026-01-02"},
        {shift: 1, date: "2026-01-06"}, {shift: 1, date: "2026-01-07"}, {shift: 1, date: "2026-01-08"},
      ];
      fallbackShifts.forEach(({shift, date}) => {
        shifts[date] = shift;
      });
    }
    
    return shifts;
  };

  const shiftData = useMemo(() => createShiftData(), [shiftsLoaded, firestoreShifts]);

  // Shift schedule for 2025 (from shift_calendar_2025_2027.txt)
  const shiftSchedule2025: ShiftInfo[] = [
    { shiftNumber: 1, startDate: "5 Ocak", endDate: "7 Ocak", startDateObj: new Date(2025, 0, 5), endDateObj: new Date(2025, 0, 7) },
    { shiftNumber: 2, startDate: "11 Ocak", endDate: "13 Ocak", startDateObj: new Date(2025, 0, 11), endDateObj: new Date(2025, 0, 13) },
    { shiftNumber: 3, startDate: "17 Ocak", endDate: "19 Ocak", startDateObj: new Date(2025, 0, 17), endDateObj: new Date(2025, 0, 19) },
    { shiftNumber: 4, startDate: "23 Ocak", endDate: "25 Ocak", startDateObj: new Date(2025, 0, 23), endDateObj: new Date(2025, 0, 25) },
    { shiftNumber: 5, startDate: "29 Ocak", endDate: "31 Ocak", startDateObj: new Date(2025, 0, 29), endDateObj: new Date(2025, 0, 31) },
    { shiftNumber: 6, startDate: "4 Şubat", endDate: "6 Şubat", startDateObj: new Date(2025, 1, 4), endDateObj: new Date(2025, 1, 6) },
    { shiftNumber: 7, startDate: "10 Şubat", endDate: "12 Şubat", startDateObj: new Date(2025, 1, 10), endDateObj: new Date(2025, 1, 12) },
    { shiftNumber: 8, startDate: "16 Şubat", endDate: "18 Şubat", startDateObj: new Date(2025, 1, 16), endDateObj: new Date(2025, 1, 18) },
    { shiftNumber: 9, startDate: "22 Şubat", endDate: "24 Şubat", startDateObj: new Date(2025, 1, 22), endDateObj: new Date(2025, 1, 24) },
    { shiftNumber: 10, startDate: "28 Şubat", endDate: "2 Mart", startDateObj: new Date(2025, 1, 28), endDateObj: new Date(2025, 2, 2) },
    { shiftNumber: 11, startDate: "6 Mart", endDate: "8 Mart", startDateObj: new Date(2025, 2, 6), endDateObj: new Date(2025, 2, 8) },
    { shiftNumber: 12, startDate: "12 Mart", endDate: "14 Mart", startDateObj: new Date(2025, 2, 12), endDateObj: new Date(2025, 2, 14) },
    { shiftNumber: 13, startDate: "18 Mart", endDate: "20 Mart", startDateObj: new Date(2025, 2, 18), endDateObj: new Date(2025, 2, 20) },
    { shiftNumber: 14, startDate: "24 Mart", endDate: "26 Mart", startDateObj: new Date(2025, 2, 24), endDateObj: new Date(2025, 2, 26) },
    { shiftNumber: 15, startDate: "30 Mart", endDate: "1 Nisan", startDateObj: new Date(2025, 2, 30), endDateObj: new Date(2025, 3, 1) },
    { shiftNumber: 16, startDate: "5 Nisan", endDate: "7 Nisan", startDateObj: new Date(2025, 3, 5), endDateObj: new Date(2025, 3, 7) },
    { shiftNumber: 17, startDate: "11 Nisan", endDate: "13 Nisan", startDateObj: new Date(2025, 3, 11), endDateObj: new Date(2025, 3, 13) },
    { shiftNumber: 18, startDate: "17 Nisan", endDate: "19 Nisan", startDateObj: new Date(2025, 3, 17), endDateObj: new Date(2025, 3, 19) },
    { shiftNumber: 19, startDate: "23 Nisan", endDate: "25 Nisan", startDateObj: new Date(2025, 3, 23), endDateObj: new Date(2025, 3, 25) },
    { shiftNumber: 20, startDate: "29 Nisan", endDate: "1 Mayıs", startDateObj: new Date(2025, 3, 29), endDateObj: new Date(2025, 4, 1) },
    { shiftNumber: 21, startDate: "5 Mayıs", endDate: "7 Mayıs", startDateObj: new Date(2025, 4, 5), endDateObj: new Date(2025, 4, 7) },
    { shiftNumber: 22, startDate: "11 Mayıs", endDate: "13 Mayıs", startDateObj: new Date(2025, 4, 11), endDateObj: new Date(2025, 4, 13) },
    { shiftNumber: 23, startDate: "17 Mayıs", endDate: "19 Mayıs", startDateObj: new Date(2025, 4, 17), endDateObj: new Date(2025, 4, 19) },
    { shiftNumber: 24, startDate: "23 Mayıs", endDate: "25 Mayıs", startDateObj: new Date(2025, 4, 23), endDateObj: new Date(2025, 4, 25) },
    { shiftNumber: 25, startDate: "29 Mayıs", endDate: "31 Mayıs", startDateObj: new Date(2025, 4, 29), endDateObj: new Date(2025, 4, 31) },
    { shiftNumber: 26, startDate: "4 Haziran", endDate: "6 Haziran", startDateObj: new Date(2025, 5, 4), endDateObj: new Date(2025, 5, 6) },
    { shiftNumber: 27, startDate: "10 Haziran", endDate: "12 Haziran", startDateObj: new Date(2025, 5, 10), endDateObj: new Date(2025, 5, 12) },
    { shiftNumber: 28, startDate: "16 Haziran", endDate: "18 Haziran", startDateObj: new Date(2025, 5, 16), endDateObj: new Date(2025, 5, 18) },
    { shiftNumber: 29, startDate: "22 Haziran", endDate: "24 Haziran", startDateObj: new Date(2025, 5, 22), endDateObj: new Date(2025, 5, 24) },
    { shiftNumber: 30, startDate: "28 Haziran", endDate: "30 Haziran", startDateObj: new Date(2025, 5, 28), endDateObj: new Date(2025, 5, 30) },
    { shiftNumber: 31, startDate: "4 Temmuz", endDate: "6 Temmuz", startDateObj: new Date(2025, 6, 4), endDateObj: new Date(2025, 6, 6) },
    { shiftNumber: 32, startDate: "10 Temmuz", endDate: "12 Temmuz", startDateObj: new Date(2025, 6, 10), endDateObj: new Date(2025, 6, 12) },
    { shiftNumber: 33, startDate: "16 Temmuz", endDate: "18 Temmuz", startDateObj: new Date(2025, 6, 16), endDateObj: new Date(2025, 6, 18) },
    { shiftNumber: 34, startDate: "22 Temmuz", endDate: "24 Temmuz", startDateObj: new Date(2025, 6, 22), endDateObj: new Date(2025, 6, 24) },
    { shiftNumber: 35, startDate: "28 Temmuz", endDate: "30 Temmuz", startDateObj: new Date(2025, 6, 28), endDateObj: new Date(2025, 6, 30) },
    { shiftNumber: 36, startDate: "3 Ağustos", endDate: "5 Ağustos", startDateObj: new Date(2025, 7, 3), endDateObj: new Date(2025, 7, 5) },
    { shiftNumber: 37, startDate: "9 Ağustos", endDate: "11 Ağustos", startDateObj: new Date(2025, 7, 9), endDateObj: new Date(2025, 7, 11) },
    { shiftNumber: 38, startDate: "15 Ağustos", endDate: "17 Ağustos", startDateObj: new Date(2025, 7, 15), endDateObj: new Date(2025, 7, 17) },
    { shiftNumber: 39, startDate: "21 Ağustos", endDate: "23 Ağustos", startDateObj: new Date(2025, 7, 21), endDateObj: new Date(2025, 7, 23) },
    { shiftNumber: 40, startDate: "27 Ağustos", endDate: "29 Ağustos", startDateObj: new Date(2025, 7, 27), endDateObj: new Date(2025, 7, 29) },
    { shiftNumber: 41, startDate: "2 Eylül", endDate: "4 Eylül", startDateObj: new Date(2025, 8, 2), endDateObj: new Date(2025, 8, 4) },
    { shiftNumber: 42, startDate: "8 Eylül", endDate: "10 Eylül", startDateObj: new Date(2025, 8, 8), endDateObj: new Date(2025, 8, 10) },
    { shiftNumber: 43, startDate: "14 Eylül", endDate: "16 Eylül", startDateObj: new Date(2025, 8, 14), endDateObj: new Date(2025, 8, 16) },
    { shiftNumber: 44, startDate: "20 Eylül", endDate: "22 Eylül", startDateObj: new Date(2025, 8, 20), endDateObj: new Date(2025, 8, 22) },
    { shiftNumber: 45, startDate: "26 Eylül", endDate: "28 Eylül", startDateObj: new Date(2025, 8, 26), endDateObj: new Date(2025, 8, 28) },
    { shiftNumber: 46, startDate: "2 Ekim", endDate: "4 Ekim", startDateObj: new Date(2025, 9, 2), endDateObj: new Date(2025, 9, 4) },
    { shiftNumber: 47, startDate: "8 Ekim", endDate: "10 Ekim", startDateObj: new Date(2025, 9, 8), endDateObj: new Date(2025, 9, 10) },
    { shiftNumber: 48, startDate: "14 Ekim", endDate: "16 Ekim", startDateObj: new Date(2025, 9, 14), endDateObj: new Date(2025, 9, 16) },
    { shiftNumber: 49, startDate: "20 Ekim", endDate: "22 Ekim", startDateObj: new Date(2025, 9, 20), endDateObj: new Date(2025, 9, 22) },
    { shiftNumber: 50, startDate: "26 Ekim", endDate: "28 Ekim", startDateObj: new Date(2025, 9, 26), endDateObj: new Date(2025, 9, 28) },
    { shiftNumber: 51, startDate: "1 Kasım", endDate: "3 Kasım", startDateObj: new Date(2025, 10, 1), endDateObj: new Date(2025, 10, 3) },
    { shiftNumber: 52, startDate: "7 Kasım", endDate: "9 Kasım", startDateObj: new Date(2025, 10, 7), endDateObj: new Date(2025, 10, 9) },
    { shiftNumber: 53, startDate: "13 Kasım", endDate: "15 Kasım", startDateObj: new Date(2025, 10, 13), endDateObj: new Date(2025, 10, 15) },
    { shiftNumber: 54, startDate: "19 Kasım", endDate: "21 Kasım", startDateObj: new Date(2025, 10, 19), endDateObj: new Date(2025, 10, 21) },
    { shiftNumber: 55, startDate: "25 Kasım", endDate: "27 Kasım", startDateObj: new Date(2025, 10, 25), endDateObj: new Date(2025, 10, 27) },
    { shiftNumber: 56, startDate: "1 Aralık", endDate: "3 Aralık", startDateObj: new Date(2025, 11, 1), endDateObj: new Date(2025, 11, 3) },
    { shiftNumber: 57, startDate: "7 Aralık", endDate: "9 Aralık", startDateObj: new Date(2025, 11, 7), endDateObj: new Date(2025, 11, 9) },
    { shiftNumber: 58, startDate: "13 Aralık", endDate: "15 Aralık", startDateObj: new Date(2025, 11, 13), endDateObj: new Date(2025, 11, 15) },
    { shiftNumber: 59, startDate: "19 Aralık", endDate: "21 Aralık", startDateObj: new Date(2025, 11, 19), endDateObj: new Date(2025, 11, 21) },
    { shiftNumber: 60, startDate: "25 Aralık", endDate: "27 Aralık", startDateObj: new Date(2025, 11, 25), endDateObj: new Date(2025, 11, 27) },
    { shiftNumber: 61, startDate: "31 Aralık", endDate: "2 Ocak", startDateObj: new Date(2025, 11, 31), endDateObj: new Date(2026, 0, 2) }
  ];

  // Function to find current and next shift based on today's date
  const getCurrentAndNextShift = (): { current: ShiftInfo | null; next: ShiftInfo | null } => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < shiftSchedule2025.length; i++) {
      const shift = shiftSchedule2025[i];
      
      // Check if today is within the shift period (including start and end dates)
      if (today >= shift.startDateObj && today <= shift.endDateObj) {
        return {
          current: shift,
          next: shiftSchedule2025[i + 1] || null
        };
      }
      
      // Check if today is before the shift starts
      if (today < shift.startDateObj) {
        return {
          current: shift,
          next: shiftSchedule2025[i + 1] || null
        };
      }
    }

    // If we're past all shifts in 2025, return the last one as current
    return {
      current: shiftSchedule2025[shiftSchedule2025.length - 1],
      next: null
    };
  };

  // Memoized active pilot count calculation - now uses Firestore data
  const activePilotCount = useMemo((): number => {
    if (!captainsLoaded || captains.length === 0) {
      // Fallback count while loading
      return 21; // Default active pilot count
    }
    
    return captains.filter(captain => 
      captain.durum === "Aktif" && 
      captain.isim.trim() !== ""
    ).length;
  }, [captains, captainsLoaded]);

// Function to get pilots on leave for a specific shift – prefer ANNUAL; fall back to approved SUMMER
const getPilotsOnLeaveForShift = useCallback((shiftNumber: number): string[] => {
  if (!leaveDataLoaded) return [];

  const year = new Date().getFullYear();

  // Aynı haftadaki tüm kayıtları çek
  const sameWeek = leaveData.filter(l => l.year === year && l.weekNumber === shiftNumber);

  // Öncelik: annual (nihai kayıt). Yoksa: approved summer
  const annual = sameWeek.filter(l => l.type === 'annual' && (l.approved !== false));
  const source = annual.length > 0
    ? annual
    : sameWeek.filter(l => l.type === 'summer' && l.approved === true);

  // İsimleri tekilleştir (case-insensitive TR)
  const seen = new Set<string>();
  const result: string[] = [];
  for (const e of source) {
    for (const p of e.pilots || []) {
      const name = String(p).trim();
      const key = name.toLocaleLowerCase("tr-TR");
      if (name && !seen.has(key)) {
        seen.add(key);
        result.push(name);
      }
    }
  }
  return result;
}, [leaveData, leaveDataLoaded]);



  // Function to calculate working and leave counts for a shift
  const calculateShiftCounts = useCallback((shiftNumber: number): { working: number; onLeave: number } => {
    const pilotsOnLeave = getPilotsOnLeaveForShift(shiftNumber);
    const onLeaveCount = pilotsOnLeave.length;
    const workingCount = activePilotCount - onLeaveCount;
    
    return {
      working: workingCount,
      onLeave: onLeaveCount
    };
  }, [leaveData, leaveDataLoaded, activePilotCount]);

  // Get shift number for a date (timezone-safe)
  const getShiftNumber = (date: Date): number | null => {
    // Timezone-safe date formatting
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;
    return shiftData[dateKey] || null;
  };

  // Check if date is today
  const isToday = (date: Date): boolean => {
    return date.toDateString() === today.toDateString();
  };

  // Get month name in Turkish
  const getMonthName = (month: number): string => {
    const months = [
      "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
      "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
    ];
    return months[month];
  };

  // Get days in month
  const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of month (0 = Monday, 6 = Sunday)
  const getFirstDayOfMonth = (year: number, month: number): number => {
    const day = new Date(year, month, 1).getDay();
    return (day + 6) % 7;
  };

  // ---------- Yearly calendar helpers (UI only, uses same shiftData) ----------
  const renderYearMonth = (year: number, month: number) => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month); // Monday-first
    const totalCells = 42; // 6 weeks fixed grid

    const monthBoxStyle: React.CSSProperties = {
      background: "#fff",
      border: "2px solid #111827",
    };
    const monthTitleStyle: React.CSSProperties = {
      textAlign: "center",
      fontWeight: 800,
      fontSize: "16px",
      letterSpacing: "1px",
      padding: "6px 0",
      textTransform: "uppercase",
    };
    const dowWrapStyle: React.CSSProperties = {
      display: "grid",
      gridTemplateColumns: "repeat(7, 1fr)",
      borderTop: "1px solid #111827",
      borderBottom: "1px solid #111827",
    };
    const dowCellStyle: React.CSSProperties = {
      textAlign: "center",
      fontWeight: 700,
      fontSize: "11px",
      padding: "4px 0",
    };
    const daysWrapStyle: React.CSSProperties = {
      display: "grid",
      gridTemplateColumns: "repeat(7, 1fr)",
    };
    const cellBase: React.CSSProperties = {
      height: 26,
      lineHeight: "26px",
      textAlign: "center",
      borderRight: "1px solid #111827",
      borderBottom: "1px solid #111827",
      fontSize: "12px",
    };

    const container = (
      <div style={monthBoxStyle}>
        <div style={monthTitleStyle}>{getMonthName(month).toUpperCase()}</div>
        <div style={dowWrapStyle}>
          {["PZT", "SA", "ÇA", "PE", "CU", "CTS", "PAZ"].map((d) => (
            <div key={d} style={dowCellStyle}>{d}</div>
          ))}
        </div>
        <div style={daysWrapStyle}>
          {Array.from({ length: totalCells }).map((_, i) => {
            const dayIndex = i - firstDay + 1;
            const inMonth = dayIndex >= 1 && dayIndex <= daysInMonth;
            if (!inMonth) return <div key={i} style={{ ...cellBase, background: "#fff" }} />;
            const date = new Date(year, month, dayIndex);
            const shiftNumber = getShiftNumber(date);
            const isSunday = i % 7 === 6;
            const isTodayCell = isToday(date);
            const style: React.CSSProperties = {
              ...cellBase,
              background: shiftNumber ? "#fde047" : "#fff",
              outline: isTodayCell ? "2px solid #facc15" : undefined,
              outlineOffset: isTodayCell ? -2 : undefined,
              color: isSunday ? "#dc2626" : undefined,
              fontWeight: 700,
            };
            return (
              <div key={i} style={style}>{dayIndex}</div>
            );
          })}
        </div>
      </div>
    );
    return container;
  };

  const renderYearGrid = (year: number) => {
    const gridStyle: React.CSSProperties = {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: 12,
      padding: "12px 16px",
    };
    return (
      <div ref={yearlyGridRef} style={gridStyle}>
        {Array.from({ length: 12 }).map((_, m) => (
          <div key={m}>{renderYearMonth(year, m)}</div>
        ))}
      </div>
    );
  };

  // Navigation functions
  const goToPreviousMonth = useCallback(() => {
    if (currentMonth === 0) {
      setCurrentYear(currentYear - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  }, [currentMonth, currentYear]);

  const goToNextMonth = useCallback(() => {
    if (currentMonth === 11) {
      setCurrentYear(currentYear + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  }, [currentMonth, currentYear]);

  // Render calendar grid
  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const days: Array<{day: number | null, isFromOtherMonth?: boolean, otherMonthType?: 'prev' | 'next', realDate?: Date}> = [];

    // Calculate adjacent months
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

    // Add previous month days for empty cells at beginning
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const realDate = new Date(prevYear, prevMonth, day);
      const shiftNumber = getShiftNumber(realDate);
      
      // Only add if it has a shift and continues into current month
      if (shiftNumber) {
        const nextDayDate = new Date(currentYear, currentMonth, 1);
        const nextDayShift = getShiftNumber(nextDayDate);
        if (shiftNumber === nextDayShift) {
          days.push({
            day,
            isFromOtherMonth: true,
            otherMonthType: 'prev',
            realDate
          });
          continue;
        }
      }
      
      // Add empty cell if no continuing shift
      days.push({day: null});
    }

    // Add current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const realDate = new Date(currentYear, currentMonth, day);
      days.push({
        day,
        realDate
      });
    }

    // Calculate how many cells we need to fill the grid (6 rows × 7 days = 42)
    const totalUsedCells = days.length;
    const cellsToFill = 42 - totalUsedCells;

    // Add next month days for empty cells at end
    for (let day = 1; day <= cellsToFill; day++) {
      if (day <= 3) { // Only check first 3 days of next month
        const realDate = new Date(nextYear, nextMonth, day);
        const shiftNumber = getShiftNumber(realDate);
        
        // Only add if it has a shift and continues from current month
        if (shiftNumber) {
          const lastDayDate = new Date(currentYear, currentMonth, daysInMonth);
          const lastDayShift = getShiftNumber(lastDayDate);
          if (shiftNumber === lastDayShift) {
            days.push({
              day,
              isFromOtherMonth: true,
              otherMonthType: 'next',
              realDate
            });
            continue;
          }
        }
      }
      
      // Add empty cell
      days.push({day: null});
    }

    return days.map((dayInfo, index) => {
      const { day, isFromOtherMonth, otherMonthType, realDate } = dayInfo;
      
      if (day === null) {
        return (
          <div
            key={index}
            style={{
              height: "60px",
              border: "1px solid #e5e7eb",
              backgroundColor: "#ffffff",
            }}
          />
        );
      }

      const shiftNumber = realDate ? getShiftNumber(realDate) : null;
      const todayFlag = realDate ? isToday(realDate) : false;

      return (
        <div
          key={index}
          style={{
            height: "60px",
            padding: "4px",
            border: todayFlag ? "2px solid #facc15" : 
                    isFromOtherMonth ? "2px dashed #94a3b8" : "1px solid #e5e7eb",
            backgroundColor: shiftNumber 
              ? (isFromOtherMonth ? "#e2e8f0" : "#dbeafe") 
              : (isFromOtherMonth ? "#f1f5f9" : "#ffffff"),
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            fontSize: "10px",
          }}
        >
          <div style={{ 
            fontWeight: isFromOtherMonth ? "500" : "600", 
            color: isFromOtherMonth ? "#64748b" : "#374151", 
            fontSize: "12px" 
          }}>
            {day}
            {isFromOtherMonth && (
              <span style={{fontSize: "9px", marginLeft: "2px", color: "#94a3b8"}}>
                {otherMonthType === 'next' ? "→" : "←"}
              </span>
            )}
          </div>
          {shiftNumber && (
            <div
              style={{
                color: isFromOtherMonth ? "#64748b" : "#2563eb",
                fontWeight: "500",
                textAlign: "center",
                fontSize: "8px",
              }}
            >
              V#{shiftNumber}
            </div>
          )}
        </div>
      );
    });
  };

  // Render different views
  if (currentView === "captains") {
    return <CaptainInfoTable onBack={goBack} />;
  }
  
  if (currentView === "protocol") {
    return <ProtocolViewer onBack={goBack} />;
  }
  
  if (currentView === "bonus") {
    return <BonusTable onBack={goBack} />;
  }

  if (currentView === "leave") {
    return <LeaveManagement onBack={goBack} />;
  }

  if (currentView === "yearly") {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
        <header style={{ backgroundColor: "#1f2937", color: "white", padding: "16px", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <button onClick={goBack} style={{ background: "transparent", color: "white", border: "none", fontSize: 16, cursor: "pointer" }}>← Geri</button>
            <h1 style={{ fontSize: 18, fontWeight: 700 }}>Yıllık Vardiya Takvimi</h1>
            <div />
          </div>
        </header>

        <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: 12, display: "flex", justifyContent: "center", gap: 8 }}>
          {[2025, 2026, 2027].map((y) => (
            <button key={y} onClick={() => setYearlyYear(y)}
              style={{ padding: "4px 12px", borderRadius: 6, fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", backgroundColor: yearlyYear === y ? "#2563eb" : "#e5e7eb", color: yearlyYear === y ? "#fff" : "#374151" }}>
              {y}
            </button>
          ))}
        </div>

        {/* Screenshot button (captures title + 12-month grid) */}
        <div style={{ padding: 12, display: 'flex', justifyContent: 'center' }}>
          <button onClick={captureYearGrid} style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 14px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            📷 Ekran Görüntüsü Al
          </button>
        </div>

        {/* Capture wrapper: persistent title + 12-month grid */}
        <div
          ref={yearlyCaptureRef}
          style={{ background: '#ffffff', margin: '0 12px 12px', border: '2px solid #111827' }}
        >
          <div style={{
            textAlign: 'center',
            fontWeight: 800,
            fontSize: 18,
            letterSpacing: '0.3px',
            padding: '10px 8px',
            borderBottom: '2px solid #111827'
          }}>
            {`3. Vardiya ${yearlyYear} Çalışma Takvimi`}
          </div>
          {renderYearGrid(yearlyYear)}
        </div>

        <div style={{ padding: "0 16px 16px", fontSize: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 16, height: 16, border: "1px solid #111827", background: "#fde047" }} />
            <span>Vardiya Günü</span>
          </div>
        </div>
      </div>
    );
  }


  // Show loading while initializing database
  if (!isInitialized) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        backgroundColor: "#f9fafb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "24px", marginBottom: "16px" }}>⏳</div>
          <div style={{ fontSize: "16px", fontWeight: "500", color: "#6b7280" }}>
            Sistem başlatılıyor...
          </div>
        </div>
      </div>
    );
  }

  // Show error if database initialization failed
  if (hasError) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        backgroundColor: "#f9fafb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "24px", marginBottom: "16px" }}>⚠️</div>
          <div style={{ fontSize: "16px", fontWeight: "500", color: "#dc2626" }}>
            Sistem başlatılamadı. Lütfen sayfayı yenileyin.
          </div>
        </div>
      </div>
    );
  }

  // Main menu view
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      {/* Header */}
      <header style={{ backgroundColor: "#1f2937", color: "white", padding: "16px" }}>
        <h1 style={{ fontSize: "18px", fontWeight: "600", textAlign: "center", lineHeight: "1.3" }}>
          İstanbul Boğazı 3. Vardiya Bilgilendirme Ekranı
        </h1>
      </header>

      {/* Main Content */}
      <main style={{ padding: "16px" }}>
        {/* Actor name input (free text) */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <label style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>İşlemi Yapan (ad):</span>
            <input
              defaultValue={typeof window !== 'undefined' ? (localStorage.getItem('actorName') || '') : ''}
              onChange={(e) => setActorName(e.target.value)}
              placeholder="ör. Ali Y."
              style={{ fontSize: 12, padding: '6px 8px', borderRadius: 6, border: '1px solid #d1d5db' }}
            />
          </label>
        </div>
        {/* Top Quick Links - Two Buttons */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
          {/* Anlık Gemi Sayıları (smaller) */}
          <button
            onClick={() => openExternalLink("https://gemi-trafik-2025.vercel.app/")}
            style={{
              backgroundColor: "#059669",
              color: "white",
              padding: "10px 12px",
              borderRadius: "8px",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              minHeight: "52px",
              fontSize: "15px",
              fontWeight: "600",
              cursor: "pointer",
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#047857")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#059669")}
          >
            <span style={{ fontSize: "18px" }}>🚢</span>
            <span>📊 ANLIK GEMİ SAYILARI</span>
          </button>

          {/* Pilotlu Gemi Sırası */}
          <button
            onClick={() => openExternalLink("https://pilot-sira.vercel.app/")}
            style={{
              backgroundColor: "#2563eb",
              color: "white",
              padding: "10px 12px",
              borderRadius: "8px",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              minHeight: "52px",
              fontSize: "15px",
              fontWeight: "600",
              cursor: "pointer",
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#1d4ed8")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#2563eb")}
          >
            <span style={{ fontSize: "18px" }}>🇵🇱</span>
            <span>Pilotlu Gemi Sıralaması (Güncel)</span>
          </button>
        </div>


        {/* Dynamic Shift Information */}
        {(() => {
          const { current, next } = getCurrentAndNextShift();
          if (!current) return null;

          const currentCounts = calculateShiftCounts(current.shiftNumber);
          const nextCounts = next ? calculateShiftCounts(next.shiftNumber) : null;

          return (
            <div style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "20px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              border: "2px solid #1e40af"
            }}>
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                fontSize: "14px",
                fontWeight: "500",
                color: "#1e40af"
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  flexWrap: "wrap"
                }}>
                  <span style={{ fontSize: "16px", fontWeight: "600" }}>
                    {current.startDate} ({current.shiftNumber}. Vardiya)
                  </span>
                  <span>👥 {currentCounts.working} Kılavuz görevde olacak,</span>
                  <span>🏠 {currentCounts.onLeave} Kılavuz izinde olacak</span>
                </div>
                
                {next && (
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    flexWrap: "wrap",
                    paddingLeft: "16px"
                  }}>
                    <span>→ →</span>
                    <span style={{ fontSize: "16px", fontWeight: "600" }}>
                      {next.startDate} ({next.shiftNumber}. Vardiya)
                    </span>
                    <span>👥 {nextCounts?.working || 0} Kılavuz görevde olacak,</span>
                    <span>🏠 {nextCounts?.onLeave || 0} Kılavuz izinde olacak</span>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Secondary Buttons - Two Column Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
          <button
            onClick={() => navigateTo("leave")}
            style={{
              backgroundColor: "#16a34a",
              color: "white",
              padding: "12px 8px",
              borderRadius: "8px",
              border: "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              minHeight: "80px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
            }}
            onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = "#15803d"}
            onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = "#16a34a"}
          >
            <span style={{ fontSize: "18px" }}>📅</span>
            <span style={{ textAlign: "center", lineHeight: "1.2" }}>İzin Yönetimi</span>
          </button>


          <button
            onClick={() => navigateTo("captains")}
            style={{
              backgroundColor: "#7e22ce",
              color: "white",
              padding: "12px 8px",
              borderRadius: "8px",
              border: "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              minHeight: "80px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
            }}
            onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = "#6b21a8"}
            onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = "#7e22ce"}
          >
            <span style={{ fontSize: "18px" }}>👨‍✈️</span>
            <span style={{ textAlign: "center", lineHeight: "1.2" }}>Kılavuz Kaptan Bilgileri</span>
          </button>
        </div>

        {/* Protocol and Shift Creation Buttons - Two Column Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
          <button
            onClick={() => navigateTo("protocol")}
            style={{
              backgroundColor: "#dc2626",
              color: "white",
              padding: "12px 8px",
              borderRadius: "8px",
              border: "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              minHeight: "80px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
            }}
            onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = "#b91c1c"}
            onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = "#dc2626"}
          >
            <span style={{ fontSize: "18px" }}>📄</span>
            <span style={{ textAlign: "center", lineHeight: "1.2" }}>Vardiya Protokol Maddeleri</span>
          </button>

          <button
            onClick={() => navigateTo("yearly")}
            style={{
              backgroundColor: "#0891b2",
              color: "white",
              padding: "12px 8px",
              borderRadius: "8px",
              border: "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              minHeight: "80px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: "18px" }}>📊</span>
            <span style={{ textAlign: "center", lineHeight: "1.2" }}>Yıllık Vardiya Takvimi</span>
          </button>
        </div>

        {/* Istanbul Strait Map Button (centered, smaller) */}
        <div style={{ marginBottom: "24px", display: "flex", justifyContent: "center" }}>
          <button
            onClick={() => openExternalLink("https://kagantatlici.github.io/istanbul-strait-map/")}
            style={{
              backgroundColor: "#92A07F",
              color: "#111827",
              padding: "8px 12px",
              borderRadius: "8px",
              border: "none",
              display: "inline-flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              minHeight: "48px",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#7F8E6C")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#92A07F")}
          >
            <span style={{ fontSize: "16px" }}>🗺️</span>
            <span style={{ textAlign: "center", lineHeight: "1.2", whiteSpace: "nowrap" }}>İstanbul Boğazı CPA Simülasyonu</span>
          </button>
        </div>

        {/* Full Month Shift Calendar */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "16px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            marginBottom: "16px",
          }}
        >
          {/* Calendar Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <button
              onClick={goToPreviousMonth}
              style={{
                backgroundColor: "#f3f4f6",
                border: "none",
                borderRadius: "8px",
                padding: "8px 12px",
                cursor: "pointer",
                fontSize: "14px",
                color: "#374151",
              }}
            >
              ← Önceki
            </button>

            <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#374151" }}>
              🗓️ {getMonthName(currentMonth)} {currentYear}
            </h3>

            <button
              onClick={goToNextMonth}
              style={{
                backgroundColor: "#f3f4f6",
                border: "none",
                borderRadius: "8px",
                padding: "8px 12px",
                cursor: "pointer",
                fontSize: "14px",
                color: "#374151",
              }}
            >
              Sonraki →
            </button>
          </div>

          {/* Days of week header */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "1px", marginBottom: "4px" }}>
            {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((day) => (
              <div
                key={day}
                style={{
                  textAlign: "center",
                  fontWeight: "600",
                  color: "#6b7280",
                  padding: "8px 4px",
                  fontSize: "12px",
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: "1px",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            {renderCalendarGrid()}
          </div>

          {/* Legend */}
          <div
            style={{
              marginTop: "12px",
              display: "flex",
              justifyContent: "center",
              gap: "16px",
              fontSize: "11px",
              color: "#6b7280",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  backgroundColor: "#dbeafe",
                  border: "1px solid #e5e7eb",
                  borderRadius: "2px",
                }}
              />
              <span>Vardiya</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  backgroundColor: "white",
                  border: "2px solid #facc15",
                  borderRadius: "2px",
                }}
              />
              <span>Bugün</span>
            </div>
          </div>
        </div>

        {/* Quick Bonus Preview */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "16px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "12px",
            }}
          >
            <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#374151" }}>
              💰 Yaklaşan İkramiye
            </h3>
            <button
              onClick={() => navigateTo("bonus")}
              style={{
                backgroundColor: "#ea580c",
                color: "white",
                padding: "6px 12px",
                borderRadius: "6px",
                border: "none",
                fontSize: "12px",
                fontWeight: "500",
                cursor: "pointer",
              }}
            >
              Tüm İkramiyeler →
            </button>
          </div>
          {(() => {
            const nextBonus = getNextUpcomingBonus();
            if (!nextBonus) {
              return (
                <div
                  style={{
                    backgroundColor: "#f3f4f6",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                  }}
                >
                  <div style={{ fontSize: "14px", fontWeight: "500", color: "#6b7280", marginBottom: "4px" }}>
                    Yaklaşan İkramiye
                  </div>
                  <div style={{ fontSize: "13px", color: "#6b7280" }}>Henüz belirlenmedi</div>
                </div>
              );
            }
            
            return (
              <div
                style={{
                  backgroundColor: "#f0fdf4",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #bbf7d0",
                }}
              >
                <div style={{ fontSize: "14px", fontWeight: "500", color: "#16a34a", marginBottom: "4px" }}>
                  {nextBonus.type}
                </div>
                <div style={{ fontSize: "13px", color: "#16a34a" }}>{nextBonus.date}</div>
              </div>
            );
          })()}
        </div>

        {/* Son değişiklikler paneli */}
        <div style={{ marginTop: 12 }}>
          <AuditLogPanel />
        </div>
      </main>
    </div>
  );
};

export default React.memo(MainScreen);
