import React, { useState, useMemo, useCallback, startTransition, useEffect, useRef } from "react";
import CaptainInfoTable from "./CaptainInfoTable";
import ProtocolViewer from "./ProtocolViewer";
import BonusTable from "./BonusTable";
import LeaveManagement from "./LeaveManagement";
import AuditLogPanel from "./AuditLogPanel";
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

  // Custom Color State
  const [shiftColor, setShiftColor] = useState<string>(() => {
    return localStorage.getItem("shiftColor") || "#fde047";
  });
  const [exitColor, setExitColor] = useState<string>(() => {
    return localStorage.getItem("exitColor") || "#fff4c5";
  });

  // Persist colors
  useEffect(() => {
    localStorage.setItem("shiftColor", shiftColor);
  }, [shiftColor]);

  useEffect(() => {
    localStorage.setItem("exitColor", exitColor);
  }, [exitColor]);

  const yearlyGridRef = useRef<HTMLDivElement | null>(null);
  const yearlyCaptureRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    const loadShifts = async () => {
      try {
        const shifts = await ShiftService.getAllShifts();
        setFirestoreShifts(shifts);
        setShiftsLoaded(true);
      } catch (error) {
        console.error("❌ Shifts yükleme hatası:", error);
        setShiftsLoaded(true);
      }
    };
    if (isInitialized) loadShifts();
  }, [isInitialized]);

  useEffect(() => {
    const loadLeaveData = async () => {
      try {
        const currentYear = new Date().getFullYear();
        const leaves = await LeaveService.getLeavesByYear(currentYear);
        setLeaveData(leaves);
        setLeaveDataLoaded(true);
      } catch (error) {
        console.error("❌ Leave data yükleme hatası:", error);
        setLeaveDataLoaded(true);
      }
    };
    if (isInitialized) loadLeaveData();
  }, [isInitialized]);

  useEffect(() => {
    const loadCaptains = async () => {
      try {
        const captainsData = await CaptainService.getAllCaptains();
        setCaptains(captainsData);
        setCaptainsLoaded(true);
      } catch (error) {
        console.error("❌ Captains yükleme hatası:", error);
        setCaptainsLoaded(true);
      }
    };
    if (isInitialized) loadCaptains();
  }, [isInitialized]);

  const createShiftData = (): ShiftData => {
    const shifts: ShiftData = {};
    if (shiftsLoaded && firestoreShifts.length > 0) {
      firestoreShifts.forEach(shift => {
        let displayShiftNumber = shift.shiftNumber;
        if (shift.year === 2025) {
          displayShiftNumber = shift.shiftNumber;
        } else if (shift.year === 2026) {
          displayShiftNumber = shift.shiftNumber <= 61 ? shift.shiftNumber : shift.shiftNumber - 61;
        } else if (shift.year === 2027) {
          displayShiftNumber = shift.shiftNumber <= 122 ? shift.shiftNumber - 61 : shift.shiftNumber - 122;
        }
        shifts[shift.date] = displayShiftNumber;
      });
    }
    return shifts;
  };

  const shiftData = useMemo(() => createShiftData(), [shiftsLoaded, firestoreShifts]);

  // 2025, 2026 ve 2027 Vardiya Tarihleri (Statik Liste)
  const fullShiftSchedule: ShiftInfo[] = [
    // 2025
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
    { shiftNumber: 61, startDate: "31 Aralık", endDate: "2 Ocak", startDateObj: new Date(2025, 11, 31), endDateObj: new Date(2026, 0, 2) },
    // 2026
    { shiftNumber: 1, startDate: "6 Ocak", endDate: "8 Ocak", startDateObj: new Date(2026, 0, 6), endDateObj: new Date(2026, 0, 8) },
    { shiftNumber: 2, startDate: "12 Ocak", endDate: "14 Ocak", startDateObj: new Date(2026, 0, 12), endDateObj: new Date(2026, 0, 14) },
    { shiftNumber: 3, startDate: "18 Ocak", endDate: "20 Ocak", startDateObj: new Date(2026, 0, 18), endDateObj: new Date(2026, 0, 20) },
    { shiftNumber: 4, startDate: "24 Ocak", endDate: "26 Ocak", startDateObj: new Date(2026, 0, 24), endDateObj: new Date(2026, 0, 26) },
    { shiftNumber: 5, startDate: "30 Ocak", endDate: "1 Şubat", startDateObj: new Date(2026, 0, 30), endDateObj: new Date(2026, 1, 1) },
    { shiftNumber: 6, startDate: "5 Şubat", endDate: "7 Şubat", startDateObj: new Date(2026, 1, 5), endDateObj: new Date(2026, 1, 7) },
    { shiftNumber: 7, startDate: "11 Şubat", endDate: "13 Şubat", startDateObj: new Date(2026, 1, 11), endDateObj: new Date(2026, 1, 13) },
    { shiftNumber: 8, startDate: "17 Şubat", endDate: "19 Şubat", startDateObj: new Date(2026, 1, 17), endDateObj: new Date(2026, 1, 19) },
    { shiftNumber: 9, startDate: "23 Şubat", endDate: "25 Şubat", startDateObj: new Date(2026, 1, 23), endDateObj: new Date(2026, 1, 25) },
    { shiftNumber: 10, startDate: "1 Mart", endDate: "3 Mart", startDateObj: new Date(2026, 2, 1), endDateObj: new Date(2026, 2, 3) },
    { shiftNumber: 11, startDate: "7 Mart", endDate: "9 Mart", startDateObj: new Date(2026, 2, 7), endDateObj: new Date(2026, 2, 9) },
    { shiftNumber: 12, startDate: "13 Mart", endDate: "15 Mart", startDateObj: new Date(2026, 2, 13), endDateObj: new Date(2026, 2, 15) },
    { shiftNumber: 13, startDate: "19 Mart", endDate: "21 Mart", startDateObj: new Date(2026, 2, 19), endDateObj: new Date(2026, 2, 21) },
    { shiftNumber: 14, startDate: "25 Mart", endDate: "27 Mart", startDateObj: new Date(2026, 2, 25), endDateObj: new Date(2026, 2, 27) },
    { shiftNumber: 15, startDate: "31 Mart", endDate: "2 Nisan", startDateObj: new Date(2026, 2, 31), endDateObj: new Date(2026, 3, 2) },
    { shiftNumber: 16, startDate: "6 Nisan", endDate: "8 Nisan", startDateObj: new Date(2026, 3, 6), endDateObj: new Date(2026, 3, 8) },
    { shiftNumber: 17, startDate: "12 Nisan", endDate: "14 Nisan", startDateObj: new Date(2026, 3, 12), endDateObj: new Date(2026, 3, 14) },
    { shiftNumber: 18, startDate: "18 Nisan", endDate: "20 Nisan", startDateObj: new Date(2026, 3, 18), endDateObj: new Date(2026, 3, 20) },
    { shiftNumber: 19, startDate: "24 Nisan", endDate: "26 Nisan", startDateObj: new Date(2026, 3, 24), endDateObj: new Date(2026, 3, 26) },
    { shiftNumber: 20, startDate: "30 Nisan", endDate: "2 Mayıs", startDateObj: new Date(2026, 3, 30), endDateObj: new Date(2026, 4, 2) },
    { shiftNumber: 21, startDate: "6 Mayıs", endDate: "8 Mayıs", startDateObj: new Date(2026, 4, 6), endDateObj: new Date(2026, 4, 8) },
    { shiftNumber: 22, startDate: "12 Mayıs", endDate: "14 Mayıs", startDateObj: new Date(2026, 4, 12), endDateObj: new Date(2026, 4, 14) },
    { shiftNumber: 23, startDate: "18 Mayıs", endDate: "20 Mayıs", startDateObj: new Date(2026, 4, 18), endDateObj: new Date(2026, 4, 20) },
    { shiftNumber: 24, startDate: "24 Mayıs", endDate: "26 Mayıs", startDateObj: new Date(2026, 4, 24), endDateObj: new Date(2026, 4, 26) },
    { shiftNumber: 25, startDate: "30 Mayıs", endDate: "1 Haziran", startDateObj: new Date(2026, 4, 30), endDateObj: new Date(2026, 5, 1) },
    { shiftNumber: 26, startDate: "6 Haziran", endDate: "8 Haziran", startDateObj: new Date(2026, 5, 6), endDateObj: new Date(2026, 5, 8) },
    { shiftNumber: 27, startDate: "12 Haziran", endDate: "14 Haziran", startDateObj: new Date(2026, 5, 12), endDateObj: new Date(2026, 5, 14) },
    { shiftNumber: 28, startDate: "18 Haziran", endDate: "20 Haziran", startDateObj: new Date(2026, 5, 18), endDateObj: new Date(2026, 5, 20) },
    { shiftNumber: 29, startDate: "24 Haziran", endDate: "26 Haziran", startDateObj: new Date(2026, 5, 24), endDateObj: new Date(2026, 5, 26) },
    { shiftNumber: 30, startDate: "30 Haziran", endDate: "2 Temmuz", startDateObj: new Date(2026, 5, 30), endDateObj: new Date(2026, 6, 2) },
    { shiftNumber: 31, startDate: "6 Temmuz", endDate: "8 Temmuz", startDateObj: new Date(2026, 6, 6), endDateObj: new Date(2026, 6, 8) },
    { shiftNumber: 32, startDate: "12 Temmuz", endDate: "14 Temmuz", startDateObj: new Date(2026, 6, 12), endDateObj: new Date(2026, 6, 14) },
    { shiftNumber: 33, startDate: "18 Temmuz", endDate: "20 Temmuz", startDateObj: new Date(2026, 6, 18), endDateObj: new Date(2026, 6, 20) },
    { shiftNumber: 34, startDate: "24 Temmuz", endDate: "26 Temmuz", startDateObj: new Date(2026, 6, 24), endDateObj: new Date(2026, 6, 26) },
    { shiftNumber: 35, startDate: "30 Temmuz", endDate: "1 Ağustos", startDateObj: new Date(2026, 6, 30), endDateObj: new Date(2026, 7, 1) },
    { shiftNumber: 36, startDate: "5 Ağustos", endDate: "7 Ağustos", startDateObj: new Date(2026, 7, 5), endDateObj: new Date(2026, 7, 7) },
    { shiftNumber: 37, startDate: "11 Ağustos", endDate: "13 Ağustos", startDateObj: new Date(2026, 7, 11), endDateObj: new Date(2026, 7, 13) },
    { shiftNumber: 38, startDate: "17 Ağustos", endDate: "19 Ağustos", startDateObj: new Date(2026, 7, 17), endDateObj: new Date(2026, 7, 19) },
    { shiftNumber: 39, startDate: "23 Ağustos", endDate: "25 Ağustos", startDateObj: new Date(2026, 7, 23), endDateObj: new Date(2026, 7, 25) },
    { shiftNumber: 40, startDate: "29 Ağustos", endDate: "31 Ağustos", startDateObj: new Date(2026, 7, 29), endDateObj: new Date(2026, 7, 31) },
    { shiftNumber: 41, startDate: "4 Eylül", endDate: "6 Eylül", startDateObj: new Date(2026, 8, 4), endDateObj: new Date(2026, 8, 6) },
    { shiftNumber: 42, startDate: "10 Eylül", endDate: "12 Eylül", startDateObj: new Date(2026, 8, 10), endDateObj: new Date(2026, 8, 12) },
    { shiftNumber: 43, startDate: "16 Eylül", endDate: "18 Eylül", startDateObj: new Date(2026, 8, 16), endDateObj: new Date(2026, 8, 18) },
    { shiftNumber: 44, startDate: "22 Eylül", endDate: "24 Eylül", startDateObj: new Date(2026, 8, 22), endDateObj: new Date(2026, 8, 24) },
    { shiftNumber: 45, startDate: "28 Eylül", endDate: "30 Eylül", startDateObj: new Date(2026, 8, 28), endDateObj: new Date(2026, 8, 30) },
    { shiftNumber: 46, startDate: "4 Ekim", endDate: "6 Ekim", startDateObj: new Date(2026, 9, 4), endDateObj: new Date(2026, 9, 6) },
    { shiftNumber: 47, startDate: "10 Ekim", endDate: "12 Ekim", startDateObj: new Date(2026, 9, 10), endDateObj: new Date(2026, 9, 12) },
    { shiftNumber: 48, startDate: "16 Ekim", endDate: "18 Ekim", startDateObj: new Date(2026, 9, 16), endDateObj: new Date(2026, 9, 18) },
    { shiftNumber: 49, startDate: "22 Ekim", endDate: "24 Ekim", startDateObj: new Date(2026, 9, 22), endDateObj: new Date(2026, 9, 24) },
    { shiftNumber: 50, startDate: "28 Ekim", endDate: "30 Ekim", startDateObj: new Date(2026, 9, 28), endDateObj: new Date(2026, 9, 30) },
    { shiftNumber: 51, startDate: "3 Kasım", endDate: "5 Kasım", startDateObj: new Date(2026, 10, 3), endDateObj: new Date(2026, 10, 5) },
    { shiftNumber: 52, startDate: "9 Kasım", endDate: "11 Kasım", startDateObj: new Date(2026, 10, 9), endDateObj: new Date(2026, 10, 11) },
    { shiftNumber: 53, startDate: "15 Kasım", endDate: "17 Kasım", startDateObj: new Date(2026, 10, 15), endDateObj: new Date(2026, 10, 17) },
    { shiftNumber: 54, startDate: "21 Kasım", endDate: "23 Kasım", startDateObj: new Date(2026, 10, 21), endDateObj: new Date(2026, 10, 23) },
    { shiftNumber: 55, startDate: "27 Kasım", endDate: "29 Kasım", startDateObj: new Date(2026, 10, 27), endDateObj: new Date(2026, 10, 29) },
    { shiftNumber: 56, startDate: "3 Aralık", endDate: "5 Aralık", startDateObj: new Date(2026, 11, 3), endDateObj: new Date(2026, 11, 5) },
    { shiftNumber: 57, startDate: "9 Aralık", endDate: "11 Aralık", startDateObj: new Date(2026, 11, 9), endDateObj: new Date(2026, 11, 11) },
    { shiftNumber: 58, startDate: "15 Aralık", endDate: "17 Aralık", startDateObj: new Date(2026, 11, 15), endDateObj: new Date(2026, 11, 17) },
    { shiftNumber: 59, startDate: "21 Aralık", endDate: "23 Aralık", startDateObj: new Date(2026, 11, 21), endDateObj: new Date(2026, 11, 23) },
    { shiftNumber: 60, startDate: "27 Aralık", endDate: "29 Aralık", startDateObj: new Date(2026, 11, 27), endDateObj: new Date(2026, 11, 29) },
    // 2027
    { shiftNumber: 1, startDate: "2 Ocak", endDate: "4 Ocak", startDateObj: new Date(2027, 0, 2), endDateObj: new Date(2027, 0, 4) },
    { shiftNumber: 2, startDate: "8 Ocak", endDate: "10 Ocak", startDateObj: new Date(2027, 0, 8), endDateObj: new Date(2027, 0, 10) },
    { shiftNumber: 3, startDate: "14 Ocak", endDate: "16 Ocak", startDateObj: new Date(2027, 0, 14), endDateObj: new Date(2027, 0, 16) },
    { shiftNumber: 4, startDate: "20 Ocak", endDate: "22 Ocak", startDateObj: new Date(2027, 0, 20), endDateObj: new Date(2027, 0, 22) },
    { shiftNumber: 5, startDate: "26 Ocak", endDate: "28 Ocak", startDateObj: new Date(2027, 0, 26), endDateObj: new Date(2027, 0, 28) },
    { shiftNumber: 6, startDate: "1 Şubat", endDate: "3 Şubat", startDateObj: new Date(2027, 1, 1), endDateObj: new Date(2027, 1, 3) },
    { shiftNumber: 7, startDate: "7 Şubat", endDate: "9 Şubat", startDateObj: new Date(2027, 1, 7), endDateObj: new Date(2027, 1, 9) },
    { shiftNumber: 8, startDate: "13 Şubat", endDate: "15 Şubat", startDateObj: new Date(2027, 1, 13), endDateObj: new Date(2027, 1, 15) },
    { shiftNumber: 9, startDate: "19 Şubat", endDate: "21 Şubat", startDateObj: new Date(2027, 1, 19), endDateObj: new Date(2027, 1, 21) },
    { shiftNumber: 10, startDate: "25 Şubat", endDate: "27 Şubat", startDateObj: new Date(2027, 1, 25), endDateObj: new Date(2027, 1, 27) },
  ];

  const getCurrentAndNextShift = (): { current: ShiftInfo | null; next: ShiftInfo | null } => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    for (let i = 0; i < fullShiftSchedule.length; i++) {
      const shift = fullShiftSchedule[i];
      if (now >= shift.startDateObj && now <= shift.endDateObj) {
        return { current: shift, next: fullShiftSchedule[i + 1] || null };
      }
      if (now < shift.startDateObj) {
        return { current: shift, next: fullShiftSchedule[i + 1] || null };
      }
    }
    return { current: fullShiftSchedule[fullShiftSchedule.length - 1], next: null };
  };

  const activePilotCount = useMemo((): number => {
    if (!captainsLoaded || captains.length === 0) return 21;
    return captains.filter(captain => captain.durum === "Aktif" && captain.isim.trim() !== "").length;
  }, [captains, captainsLoaded]);

  const getPilotsOnLeaveForShift = useCallback((shiftNumber: number): string[] => {
    if (!leaveDataLoaded) return [];
    const year = new Date().getFullYear();
    const sameWeek = leaveData.filter(l => l.year === year && l.weekNumber === shiftNumber);
    const annual = sameWeek.filter(l => l.type === 'annual' && (l.approved !== false));
    const source = annual.length > 0 ? annual : sameWeek.filter(l => l.type === 'summer' && l.approved === true);
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

  const calculateShiftCounts = useCallback((shiftNumber: number): { working: number; onLeave: number } => {
    const pilotsOnLeave = getPilotsOnLeaveForShift(shiftNumber);
    const onLeaveCount = pilotsOnLeave.length;
    const workingCount = activePilotCount - onLeaveCount;
    return { working: workingCount, onLeave: onLeaveCount };
  }, [getPilotsOnLeaveForShift, activePilotCount]);

  const getShiftNumber = (date: Date): number | null => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;
    return shiftData[dateKey] || null;
  };

  const isToday = (date: Date): boolean => date.toDateString() === today.toDateString();

  const getMonthName = (month: number): string => {
    const months = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
    return months[month];
  };

  const getDaysInMonth = (year: number, month: number): number => new Date(year, month + 1, 0).getDate();

  const getFirstDayOfMonth = (year: number, month: number): number => {
    const day = new Date(year, month, 1).getDay();
    return (day + 6) % 7;
  };

  const renderYearMonth = (year: number, month: number) => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const totalCells = 42;
    const monthBoxStyle: React.CSSProperties = { background: "#fff", border: "2px solid #111827" };
    const monthTitleStyle: React.CSSProperties = { textAlign: "center", fontWeight: 800, fontSize: "16px", padding: "6px 0", textTransform: "uppercase" };
    const dowWrapStyle: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderTop: "1px solid #111827", borderBottom: "1px solid #111827" };
    const dowCellStyle: React.CSSProperties = { textAlign: "center", fontWeight: 700, fontSize: "11px", padding: "4px 0" };
    const daysWrapStyle: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(7, 1fr)" };
    const cellBase: React.CSSProperties = { height: 26, lineHeight: "26px", textAlign: "center", borderRight: "1px solid #111827", borderBottom: "1px solid #111827", fontSize: "12px" };

    return (
      <div style={monthBoxStyle}>
        <div style={monthTitleStyle}>{getMonthName(month).toUpperCase()}</div>
        <div style={dowWrapStyle}>
          {["PZT", "SA", "ÇA", "PE", "CU", "CTS", "PAZ"].map(d => <div key={d} style={dowCellStyle}>{d}</div>)}
        </div>
        <div style={daysWrapStyle}>
          {Array.from({ length: totalCells }).map((_, i) => {
            const dayIndex = i - firstDay + 1;
            const inMonth = dayIndex >= 1 && dayIndex <= daysInMonth;
            if (!inMonth) return <div key={i} style={{ ...cellBase, background: "#fff" }} />;
            const date = new Date(year, month, dayIndex);
            const shiftNum = getShiftNumber(date);
            const isSun = i % 7 === 6;
            const isT = isToday(date);
            const style: React.CSSProperties = {
              ...cellBase,
              background: shiftNum ? (() => {
                const nextDate = new Date(year, month, dayIndex + 1);
                const nextShiftNum = getShiftNumber(nextDate);
                const isLastDay = !nextShiftNum || nextShiftNum !== shiftNum;
                return isLastDay ? exitColor : shiftColor;
              })() : "#fff",
              outline: isT ? "2px solid #facc15" : undefined,
              outlineOffset: isT ? -2 : undefined,
              color: isSun ? "#dc2626" : undefined,
              fontWeight: 700,
            };
            return <div key={i} style={style}>{dayIndex}</div>;
          })}
        </div>
      </div>
    );
  };

  const renderYearGrid = (year: number) => {
    const gridStyle: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, padding: "12px 16px" };
    return (
      <div ref={yearlyGridRef} style={gridStyle}>
        {Array.from({ length: 12 }).map((_, m) => <div key={m}>{renderYearMonth(year, m)}</div>)}
      </div>
    );
  };

  const goToPreviousMonth = useCallback(() => {
    if (currentMonth === 0) { setCurrentYear(currentYear - 1); setCurrentMonth(11); }
    else { setCurrentMonth(currentMonth - 1); }
  }, [currentMonth, currentYear]);

  const goToNextMonth = useCallback(() => {
    if (currentMonth === 11) { setCurrentYear(currentYear + 1); setCurrentMonth(0); }
    else { setCurrentMonth(currentMonth + 1); }
  }, [currentMonth, currentYear]);

  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const days: Array<{ day: number | null, isFromOtherMonth?: boolean, otherMonthType?: 'prev' | 'next', realDate?: Date }> = [];
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

    for (let i = firstDay - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const rDate = new Date(prevYear, prevMonth, d);
      const sNum = getShiftNumber(rDate);
      if (sNum && sNum === getShiftNumber(new Date(currentYear, currentMonth, 1))) {
        days.push({ day: d, isFromOtherMonth: true, otherMonthType: 'prev', realDate: rDate });
      } else { days.push({ day: null }); }
    }
    for (let d = 1; d <= daysInMonth; d++) { days.push({ day: d, realDate: new Date(currentYear, currentMonth, d) }); }
    const cellsToFill = 42 - days.length;
    for (let d = 1; d <= cellsToFill; d++) {
      if (d <= 3) {
        const rDate = new Date(nextYear, nextMonth, d);
        if (getShiftNumber(rDate) && getShiftNumber(rDate) === getShiftNumber(new Date(currentYear, currentMonth, daysInMonth))) {
          days.push({ day: d, isFromOtherMonth: true, otherMonthType: 'next', realDate: rDate });
          continue;
        }
      }
      days.push({ day: null });
    }

    return days.map((dayInfo, index) => {
      const { day, isFromOtherMonth, otherMonthType, realDate } = dayInfo;
      if (day === null) return <div key={index} style={{ height: "60px", border: "1px solid #e5e7eb", backgroundColor: "#ffffff" }} />;
      const sNum = realDate ? getShiftNumber(realDate) : null;
      const tFlag = realDate ? isToday(realDate) : false;
      return (
        <div key={index} style={{
          height: "60px", padding: "4px", border: tFlag ? "2px solid #facc15" : isFromOtherMonth ? "2px dashed #94a3b8" : "1px solid #e5e7eb",
          backgroundColor: sNum ? (isFromOtherMonth ? "#e2e8f0" : "#dbeafe") : (isFromOtherMonth ? "#f1f5f9" : "#ffffff"),
          display: "flex", flexDirection: "column", justifyContent: "space-between", fontSize: "10px"
        }}>
          <div style={{ fontWeight: isFromOtherMonth ? "500" : "600", color: isFromOtherMonth ? "#64748b" : "#374151", fontSize: "12px" }}>
            {day} {isFromOtherMonth && <span style={{ fontSize: "9px", color: "#94a3b8" }}>{otherMonthType === 'next' ? "→" : "←"}</span>}
          </div>
          {sNum && <div style={{ color: isFromOtherMonth ? "#64748b" : "#2563eb", fontWeight: "500", textAlign: "center", fontSize: "8px" }}>V#{sNum}</div>}
        </div>
      );
    });
  };

  if (currentView === "captains") return <CaptainInfoTable onBack={goBack} />;
  if (currentView === "protocol") return <ProtocolViewer onBack={goBack} />;
  if (currentView === "bonus") return <BonusTable onBack={goBack} />;
  if (currentView === "leave") return <LeaveManagement onBack={goBack} />;
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

        {/* Controls Section */}
        <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: 16, display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
          {/* Year Selectors */}
          <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
            {[2025, 2026, 2027].map(y => (
              <button
                key={y}
                onClick={() => setYearlyYear(y)}
                style={{
                  padding: "6px 16px",
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: yearlyYear === y ? "#2563eb" : "#e5e7eb",
                  color: yearlyYear === y ? "#fff" : "#374151",
                  transition: "all 0.2s"
                }}
              >
                {y}
              </button>
            ))}
          </div>

          {/* Action Buttons & Color Pickers */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16, alignItems: 'center' }}>
            <button onClick={captureYearGrid} style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>📷</span> Ekran Görüntüsü Al
            </button>

            <div style={{ display: "flex", gap: 12, alignItems: "center", backgroundColor: "#f3f4f6", padding: "6px 12px", borderRadius: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input
                  type="color"
                  value={shiftColor}
                  onChange={(e) => setShiftColor(e.target.value)}
                  style={{ width: 24, height: 24, padding: 0, border: "none", borderRadius: 4, cursor: "pointer", backgroundColor: "transparent" }}
                />
                <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>Vardiya</span>
              </div>
              <div style={{ width: 1, height: 20, backgroundColor: "#d1d5db" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input
                  type="color"
                  value={exitColor}
                  onChange={(e) => setExitColor(e.target.value)}
                  style={{ width: 24, height: 24, padding: 0, border: "none", borderRadius: 4, cursor: "pointer", backgroundColor: "transparent" }}
                />
                <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>Çıkış</span>
              </div>
              <div style={{ width: 1, height: 20, backgroundColor: "#d1d5db" }} />
              <button
                onClick={() => { setShiftColor("#fde047"); setExitColor("#fff4c5"); }}
                style={{ fontSize: 11, color: "#ef4444", background: "none", border: "none", cursor: "pointer", fontWeight: 500, padding: "0 4px" }}
                title="Renkleri Sıfırla"
              >
                Sıfırla
              </button>
            </div>
          </div>
        </div>

        <div ref={yearlyCaptureRef} style={{ background: '#ffffff', margin: '0 12px 12px', border: '2px solid #111827' }}>
          <div style={{ textAlign: 'center', fontWeight: 800, fontSize: 18, padding: '10px 8px', borderBottom: '2px solid #111827' }}>{`3. Vardiya ${yearlyYear} Çalışma Takvimi`}</div>
          {renderYearGrid(yearlyYear)}
        </div>
        <div style={{ padding: "0 16px 16px", fontSize: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 16, height: 16, border: "1px solid #111827", background: shiftColor }} />
            <span>Vardiya Günü</span>
            <div style={{ width: 16, height: 16, border: "1px solid #111827", background: exitColor, marginLeft: 12 }} />
            <span>Çıkış Günü</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isInitialized) return <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ textAlign: "center" }}><div style={{ fontSize: "24px", marginBottom: "16px" }}>⏳</div><div style={{ fontSize: "16px", fontWeight: "500", color: "#6b7280" }}>Sistem başlatılıyor...</div></div></div>;
  if (hasError) return <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ textAlign: "center" }}><div style={{ fontSize: "24px", marginBottom: "16px" }}>⚠️</div><div style={{ fontSize: "16px", fontWeight: "500", color: "#dc2626" }}>Sistem başlatılamadı. Lütfen yenileyin.</div></div></div>;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      <header style={{ backgroundColor: "#1f2937", color: "white", padding: "16px" }}><h1 style={{ fontSize: "18px", fontWeight: "600", textAlign: "center" }}>İstanbul Boğazı 3. Vardiya Bilgilendirme Ekranı</h1></header>
      <main style={{ padding: "16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
          <button onClick={() => openExternalLink("https://gemi-trafik-2025.vercel.app/")} style={{ backgroundColor: "#059669", color: "white", padding: "10px 12px", borderRadius: "8px", border: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", minHeight: "52px", fontSize: "15px", fontWeight: "600", cursor: "pointer" }}>🚢 📊 ANLIK GEMİ SAYILARI</button>
          <button onClick={() => openExternalLink("https://pilot-sira.vercel.app/")} style={{ backgroundColor: "#2563eb", color: "white", padding: "10px 12px", borderRadius: "8px", border: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", minHeight: "52px", fontSize: "15px", fontWeight: "600", cursor: "pointer" }}>🇵🇱 Pilotlu Gemi Sıralaması</button>
        </div>

        {(() => {
          const { current, next } = getCurrentAndNextShift();
          if (!current) return null;
          const currentCounts = calculateShiftCounts(current.shiftNumber);
          const nextCounts = next ? calculateShiftCounts(next.shiftNumber) : null;
          return (
            <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "16px", marginBottom: "20px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", border: "2px solid #1e40af" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "14px", fontWeight: "500", color: "#1e40af" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "16px", fontWeight: "600" }}>{current.startDate} ({current.shiftNumber}. Vardiya)</span>
                  <span>👥 {currentCounts.working} Kılavuz görevde,</span><span>🏠 {currentCounts.onLeave} Kılavuz izinde</span>
                </div>
                {next && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", paddingLeft: "16px" }}>
                    <span>→ →</span><span style={{ fontSize: "16px", fontWeight: "600" }}>{next.startDate} ({next.shiftNumber}. Vardiya)</span>
                    <span>👥 {nextCounts?.working || 0} Kılavuz görevde,</span><span>🏠 {nextCounts?.onLeave || 0} Kılavuz izinde</span>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
          <button onClick={() => navigateTo("leave")} style={{ backgroundColor: "#16a34a", color: "white", padding: "12px 8px", borderRadius: "8px", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", minHeight: "80px", fontSize: "14px", cursor: "pointer" }}>📅 İzin Yönetimi</button>
          <button onClick={() => navigateTo("captains")} style={{ backgroundColor: "#7e22ce", color: "white", padding: "12px 8px", borderRadius: "8px", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", minHeight: "80px", fontSize: "14px", cursor: "pointer" }}>👨‍✈️ Kılavuz Kaptanlar</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
          <button onClick={() => navigateTo("protocol")} style={{ backgroundColor: "#dc2626", color: "white", padding: "12px 8px", borderRadius: "8px", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", minHeight: "80px", fontSize: "14px", cursor: "pointer" }}>📄 Vardiya Protokolü</button>
          <button onClick={() => navigateTo("yearly")} style={{ backgroundColor: "#0891b2", color: "white", padding: "12px 8px", borderRadius: "8px", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", minHeight: "80px", fontSize: "14px", cursor: "pointer" }}>📊 Yıllık Takvim</button>
        </div>

        <div style={{ marginBottom: "24px", display: "flex", justifyContent: "center" }}>
          <button onClick={() => openExternalLink("https://kagantatlici.github.io/istanbul-strait-map/")} style={{ backgroundColor: "#92A07F", color: "#111827", padding: "8px 12px", borderRadius: "8px", border: "none", display: "inline-flex", alignItems: "center", gap: "6px", minHeight: "48px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>🗺️ CPA Simülasyonu</button>
        </div>

        <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "16px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <button onClick={goToPreviousMonth} style={{ backgroundColor: "#f3f4f6", border: "none", borderRadius: "8px", padding: "8px 12px", cursor: "pointer" }}>← Önceki</button>
            <h3 style={{ fontSize: "18px", fontWeight: "600" }}>🗓️ {getMonthName(currentMonth)} {currentYear}</h3>
            <button onClick={goToNextMonth} style={{ backgroundColor: "#f3f4f6", border: "none", borderRadius: "8px", padding: "8px 12px", cursor: "pointer" }}>Sonraki →</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "1px", marginBottom: "4px" }}>
            {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map(day => <div key={day} style={{ textAlign: "center", fontWeight: "600", color: "#6b7280", fontSize: "12px" }}>{day}</div>)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "1px", border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" }}>{renderCalendarGrid()}</div>
        </div>

        <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "16px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "600" }}>💰 Yaklaşan İkramiye</h3>
            <button onClick={() => navigateTo("bonus")} style={{ backgroundColor: "#ea580c", color: "white", padding: "6px 12px", borderRadius: "6px", border: "none", fontSize: "12px", cursor: "pointer" }}>Tüm İkramiyeler →</button>
          </div>
          {(() => {
            const nextB = getNextUpcomingBonus();
            return nextB ? (
              <div style={{ backgroundColor: "#f0fdf4", padding: "12px", borderRadius: "8px", border: "1px solid #bbf7d0" }}>
                <div style={{ fontSize: "14px", fontWeight: "500", color: "#16a34a" }}>{nextB.type}</div>
                <div style={{ fontSize: "13px", color: "#16a34a" }}>{nextB.date}</div>
              </div>
            ) : <div style={{ backgroundColor: "#f3f4f6", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db" }}><div style={{ fontSize: "13px", color: "#6b7280" }}>Henüz belirlenmedi</div></div>;
          })()}
        </div>
        <div style={{ marginTop: 12 }}><AuditLogPanel /></div>
      </main>
    </div>
  );
};

export default React.memo(MainScreen);
