import React, { useState } from "react";
import CaptainInfoTable from "./CaptainInfoTable";
import ProtocolViewer from "./ProtocolViewer";
import BonusTable from "./BonusTable";
import LeaveManagement from "./LeaveManagement";
import { realCaptainsData } from "../data/captainsData";

type View = "main" | "captains" | "protocol" | "bonus" | "leave";

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
  const [today] = useState<Date>(new Date());
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());

  const openExternalLink = (url: string) => {
    window.open(url, "_blank");
  };

  const navigateTo = (view: View) => {
    setCurrentView(view);
  };

  const goBack = () => {
    setCurrentView("main");
  };

  // Real shift data (full version from ShiftCalendar)
  const createShiftData = (): ShiftData => {
    const shifts: ShiftData = {};
    
    // 2025 shifts
    const shifts2025 = [
      [1, [5,6,7], 1], [2, [11,12,13], 1], [3, [17,18,19], 1], [4, [23,24,25], 1], [5, [29,30,31], 1],
      [6, [4,5,6], 2], [7, [10,11,12], 2], [8, [16,17,18], 2], [9, [22,23,24], 2], [10, [28,1,2], [2,3]],
      [11, [6,7,8], 3], [12, [12,13,14], 3], [13, [18,19,20], 3], [14, [24,25,26], 3], [15, [30,31,1], [3,4]],
      [16, [5,6,7], 4], [17, [11,12,13], 4], [18, [17,18,19], 4], [19, [23,24,25], 4], [20, [29,30,1], [4,5]],
      [21, [5,6,7], 5], [22, [11,12,13], 5], [23, [17,18,19], 5], [24, [23,24,25], 5], [25, [29,30,31], 5],
      [26, [4,5,6], 6], [27, [10,11,12], 6], [28, [16,17,18], 6], [29, [22,23,24], 6], [30, [28,29,30], 6],
      [31, [4,5,6], 7], [32, [10,11,12], 7], [33, [16,17,18], 7], [34, [22,23,24], 7], [35, [28,29,30], 7],
      [36, [3,4,5], 8], [37, [9,10,11], 8], [38, [15,16,17], 8], [39, [21,22,23], 8], [40, [27,28,29], 8],
      [41, [2,3,4], 9], [42, [8,9,10], 9], [43, [14,15,16], 9], [44, [20,21,22], 9], [45, [26,27,28], 9],
      [46, [2,3,4], 10], [47, [8,9,10], 10], [48, [14,15,16], 10], [49, [20,21,22], 10], [50, [26,27,28], 10],
      [51, [1,2,3], 11], [52, [7,8,9], 11], [53, [13,14,15], 11], [54, [19,20,21], 11], [55, [25,26,27], 11],
      [56, [1,2,3], 12], [57, [7,8,9], 12], [58, [13,14,15], 12], [59, [19,20,21], 12], [60, [25,26,27], 12],
      [61, [31,1,2], [12,1]]
    ];

    // 2026 shifts
    const shifts2026 = [
      [1, [6,7,8], 1], [2, [12,13,14], 1], [3, [18,19,20], 1], [4, [24,25,26], 1], [5, [30,31,1], [1,2]],
      [6, [5,6,7], 2], [7, [11,12,13], 2], [8, [17,18,19], 2], [9, [23,24,25], 2], [10, [1,2,3], 3],
      [11, [7,8,9], 3], [12, [13,14,15], 3], [13, [19,20,21], 3], [14, [25,26,27], 3], [15, [31,1,2], [3,4]],
      [16, [6,7,8], 4], [17, [12,13,14], 4], [18, [18,19,20], 4], [19, [24,25,26], 4], [20, [30,1,2], [4,5]],
      [21, [6,7,8], 5], [22, [12,13,14], 5], [23, [18,19,20], 5], [24, [24,25,26], 5], [25, [30,31,1], [5,6]],
      [26, [5,6,7], 6], [27, [11,12,13], 6], [28, [17,18,19], 6], [29, [23,24,25], 6], [30, [29,30,1], [6,7]],
      [31, [5,6,7], 7], [32, [11,12,13], 7], [33, [17,18,19], 7], [34, [23,24,25], 7], [35, [29,30,31], 7],
      [36, [4,5,6], 8], [37, [10,11,12], 8], [38, [16,17,18], 8], [39, [22,23,24], 8], [40, [28,29,30], 8],
      [41, [3,4,5], 9], [42, [9,10,11], 9], [43, [15,16,17], 9], [44, [21,22,23], 9], [45, [27,28,29], 9],
      [46, [3,4,5], 10], [47, [9,10,11], 10], [48, [15,16,17], 10], [49, [21,22,23], 10], [50, [27,28,29], 10],
      [51, [2,3,4], 11], [52, [8,9,10], 11], [53, [14,15,16], 11], [54, [20,21,22], 11], [55, [26,27,28], 11],
      [56, [2,3,4], 12], [57, [8,9,10], 12], [58, [14,15,16], 12], [59, [20,21,22], 12], [60, [26,27,28], 12]
    ];

    // Helper to add shift dates
    const addShiftDates = (
      shiftNumber: number,
      days: number[],
      months: number | number[],
      year: number
    ) => {
      days.forEach((day, index) => {
        let targetYear = year;
        const month = Array.isArray(months) ? months[index] - 1 : months - 1;
        
        // Handle year transition (e.g., December 31 -> January 1)
        if (month < 0) {
          targetYear = year + 1;
        }
        if (month > 11) {
          targetYear = year - 1;
        }
        
        const adjustedMonth = month < 0 ? 11 : month > 11 ? 0 : month;
        
        // Validate date before creating
        if (day >= 1 && day <= 31 && adjustedMonth >= 0 && adjustedMonth <= 11) {
          const date = new Date(targetYear, adjustedMonth, day);
          
          // Double check the date is valid
          if (date.getFullYear() === targetYear && date.getMonth() === adjustedMonth && date.getDate() === day) {
            const dateKey = date.toISOString().split("T")[0];
            shifts[dateKey] = shiftNumber;
          }
        }
      });
    };

    // Process 2025 shifts
    shifts2025.forEach(([shiftNum, days, months]) => {
      addShiftDates(shiftNum as number, days as number[], months as number | number[], 2025);
    });

    // Process 2026 shifts
    shifts2026.forEach(([shiftNum, days, months]) => {
      addShiftDates(shiftNum as number, days as number[], months as number | number[], 2026);
    });

    return shifts;
  };

  const shiftData = createShiftData();

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

  // Function to get active pilot count (only "Aktif" status pilots with non-empty names)
  const getActivePilotCount = (): number => {
    return realCaptainsData.filter(captain => 
      captain.durum === "Aktif" && 
      captain.isim.trim() !== ""
    ).length;
  };

  // Function to get pilots on leave for a specific shift
  const getPilotsOnLeaveForShift = (shiftNumber: number): string[] => {
    // This is a mock implementation since we don't have actual leave management data yet
    // In the real implementation, this would check the leave management data
    // For now, let's simulate some pilots being on leave for demonstration
    
    // Example mock data - in real implementation, this would come from LeaveManagement component
    const mockLeaveData: { [key: number]: string[] } = {
      38: ["Harun DOKUZ (BK)", "Uğraş ALPASLAN", "Kağan TATLICI"], // 3 pilots on leave for shift 38
      39: [], // No pilots on leave for shift 39
    };
    
    return mockLeaveData[shiftNumber] || [];
  };

  // Function to calculate working and leave counts for a shift
  const calculateShiftCounts = (shiftNumber: number): { working: number; onLeave: number } => {
    const activePilotCount = getActivePilotCount();
    const pilotsOnLeave = getPilotsOnLeaveForShift(shiftNumber);
    const onLeaveCount = pilotsOnLeave.length;
    const workingCount = activePilotCount - onLeaveCount;
    
    return {
      working: workingCount,
      onLeave: onLeaveCount
    };
  };

  // Get shift number for a date
  const getShiftNumber = (date: Date): number | null => {
    const dateKey = date.toISOString().split("T")[0];
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

  // Get first day of month (0 = Sunday)
  const getFirstDayOfMonth = (year: number, month: number): number => {
    return new Date(year, month, 1).getDay();
  };

  // Navigation functions
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear(currentYear - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear(currentYear + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Render calendar grid
  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const days: (number | null)[] = [];

    // Add empty cells for days before first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days.map((day, index) => {
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

      const date = new Date(currentYear, currentMonth, day);
      const shiftNumber = getShiftNumber(date);
      const todayFlag = isToday(date);

      return (
        <div
          key={index}
          style={{
            height: "60px",
            padding: "4px",
            border: todayFlag ? "2px solid #facc15" : "1px solid #e5e7eb",
            backgroundColor: shiftNumber ? "#dbeafe" : "#ffffff",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            fontSize: "10px",
          }}
        >
          <div style={{ fontWeight: "600", color: "#374151", fontSize: "12px" }}>{day}</div>
          {shiftNumber && (
            <div
              style={{
                color: "#2563eb",
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

  // Main menu view
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      {/* Header */}
      <header style={{ backgroundColor: "#1e40af", color: "white", padding: "16px" }}>
        <h1 style={{ fontSize: "18px", fontWeight: "600", textAlign: "center", lineHeight: "1.3" }}>
          İstanbul Boğazı 3. Posta Bilgilendirme Ekranı
        </h1>
      </header>

      {/* Main Content */}
      <main style={{ padding: "16px" }}>
        {/* Primary Button - Anlık Gemi Sayıları */}
        <button
          onClick={() =>
            openExternalLink(
              "https://script.google.com/macros/s/AKfycby5sVTDpxoTHDbSriD5Qq5-zRFxHD-2qs2zfn5W70VGHl5bVe8M7CtbOPbJqYM6quJ4/exec"
            )
          }
          style={{
            width: "100%",
            backgroundColor: "#1e40af",
            color: "white",
            padding: "16px 20px",
            borderRadius: "12px",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            minHeight: "60px",
            fontSize: "18px",
            fontWeight: "600",
            cursor: "pointer",
            marginBottom: "20px",
            boxShadow: "0 4px 12px rgba(30, 64, 175, 0.3)",
            transform: "scale(1)",
            transition: "all 0.2s ease"
          }}
          onMouseOver={(e) => {
            const target = e.target as HTMLElement;
            target.style.backgroundColor = "#1d4ed8";
            target.style.transform = "scale(1.02)";
            target.style.boxShadow = "0 6px 16px rgba(30, 64, 175, 0.4)";
          }}
          onMouseOut={(e) => {
            const target = e.target as HTMLElement;
            target.style.backgroundColor = "#1e40af";
            target.style.transform = "scale(1)";
            target.style.boxShadow = "0 4px 12px rgba(30, 64, 175, 0.3)";
          }}
        >
          <span style={{ fontSize: "24px" }}>🚢</span>
          <span>📊 ANLIK GEMİ SAYILARI</span>
        </button>

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
            onClick={() => openExternalLink("https://script.google.com/macros/s/AKfycbzVhY5LoSCNp2jc5eFlR2WpFkAQCpFZv4DjCerecUGpIPFWgys-KjV4_UCl8DsU-5ck4g/exec")}
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
            onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = "#0e7490"}
            onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = "#0891b2"}
          >
            <span style={{ fontSize: "18px" }}>⚙️</span>
            <span style={{ textAlign: "center", lineHeight: "1.2" }}>Vardiya Takvimi Oluştur</span>
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
            {["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"].map((day) => (
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
          <div
            style={{
              backgroundColor: "#f0fdf4",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #bbf7d0",
            }}
          >
            <div style={{ fontSize: "14px", fontWeight: "500", color: "#16a34a", marginBottom: "4px" }}>
              Devlet - 2
            </div>
            <div style={{ fontSize: "13px", color: "#16a34a" }}>24 Mart 2025</div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainScreen;
