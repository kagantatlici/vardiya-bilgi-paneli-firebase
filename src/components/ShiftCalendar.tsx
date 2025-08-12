import React, { useState } from "react";

interface CalendarProps {
  initialYear?: number;
  initialMonth?: number;
}

interface ShiftData {
  [key: string]: number; // "YYYY-MM-DD": shiftNumber
}

interface ExtendedCalendarProps extends CalendarProps {
  onBack?: () => void;
}

const ShiftCalendar: React.FC<ExtendedCalendarProps> = ({
  initialYear = new Date().getFullYear(),
  initialMonth = new Date().getMonth(),
  onBack,
}) => {
  const [currentYear, setCurrentYear] = useState<number>(initialYear);
  const [currentMonth, setCurrentMonth] = useState<number>(initialMonth);
  const [today] = useState<Date>(new Date());

  // Real shift data from shift_calendar_2025_2027.txt
  const createShiftData = (): ShiftData => {
    const shifts: ShiftData = {};

    // 2025 shifts
    const shifts2025 = [
      [1, [5, 6, 7], 1],
      [2, [11, 12, 13], 1],
      [3, [17, 18, 19], 1],
      [4, [23, 24, 25], 1],
      [5, [29, 30, 31], 1],
      [6, [4, 5, 6], 2],
      [7, [10, 11, 12], 2],
      [8, [16, 17, 18], 2],
      [9, [22, 23, 24], 2],
      [10, [28, 1, 2], [2, 3]],
      [11, [6, 7, 8], 3],
      [12, [12, 13, 14], 3],
      [13, [18, 19, 20], 3],
      [14, [24, 25, 26], 3],
      [15, [30, 31, 1], [3, 4]],
      [16, [5, 6, 7], 4],
      [17, [11, 12, 13], 4],
      [18, [17, 18, 19], 4],
      [19, [23, 24, 25], 4],
      [20, [29, 30, 1], [4, 5]],
      [21, [5, 6, 7], 5],
      [22, [11, 12, 13], 5],
      [23, [17, 18, 19], 5],
      [24, [23, 24, 25], 5],
      [25, [29, 30, 31], 5],
      [26, [4, 5, 6], 6],
      [27, [10, 11, 12], 6],
      [28, [16, 17, 18], 6],
      [29, [22, 23, 24], 6],
      [30, [28, 29, 30], 6],
      [31, [4, 5, 6], 7],
      [32, [10, 11, 12], 7],
      [33, [16, 17, 18], 7],
      [34, [22, 23, 24], 7],
      [35, [28, 29, 30], 7],
      [36, [3, 4, 5], 8],
      [37, [9, 10, 11], 8],
      [38, [15, 16, 17], 8],
      [39, [21, 22, 23], 8],
      [40, [27, 28, 29], 8],
      [41, [2, 3, 4], 9],
      [42, [8, 9, 10], 9],
      [43, [14, 15, 16], 9],
      [44, [20, 21, 22], 9],
      [45, [26, 27, 28], 9],
      [46, [2, 3, 4], 10],
      [47, [8, 9, 10], 10],
      [48, [14, 15, 16], 10],
      [49, [20, 21, 22], 10],
      [50, [26, 27, 28], 10],
      [51, [1, 2, 3], 11],
      [52, [7, 8, 9], 11],
      [53, [13, 14, 15], 11],
      [54, [19, 20, 21], 11],
      [55, [25, 26, 27], 11],
      [56, [1, 2, 3], 12],
      [57, [7, 8, 9], 12],
      [58, [13, 14, 15], 12],
      [59, [19, 20, 21], 12],
      [60, [25, 26, 27], 12],
      [61, [31, 1, 2], [12, 1]],
    ];

    // 2026 shifts
    const shifts2026 = [
      [1, [6, 7, 8], 1],
      [2, [12, 13, 14], 1],
      [3, [18, 19, 20], 1],
      [4, [24, 25, 26], 1],
      [5, [30, 31, 1], [1, 2]],
      [6, [5, 6, 7], 2],
      [7, [11, 12, 13], 2],
      [8, [17, 18, 19], 2],
      [9, [23, 24, 25], 2],
      [10, [1, 2, 3], 3],
      [11, [7, 8, 9], 3],
      [12, [13, 14, 15], 3],
      [13, [19, 20, 21], 3],
      [14, [25, 26, 27], 3],
      [15, [31, 1, 2], [3, 4]],
      [16, [6, 7, 8], 4],
      [17, [12, 13, 14], 4],
      [18, [18, 19, 20], 4],
      [19, [24, 25, 26], 4],
      [20, [30, 1, 2], [4, 5]],
      [21, [6, 7, 8], 5],
      [22, [12, 13, 14], 5],
      [23, [18, 19, 20], 5],
      [24, [24, 25, 26], 5],
      [25, [30, 31, 1], [5, 6]],
      [26, [5, 6, 7], 6],
      [27, [11, 12, 13], 6],
      [28, [17, 18, 19], 6],
      [29, [23, 24, 25], 6],
      [30, [29, 30, 1], [6, 7]],
      [31, [5, 6, 7], 7],
      [32, [11, 12, 13], 7],
      [33, [17, 18, 19], 7],
      [34, [23, 24, 25], 7],
      [35, [29, 30, 31], 7],
      [36, [4, 5, 6], 8],
      [37, [10, 11, 12], 8],
      [38, [16, 17, 18], 8],
      [39, [22, 23, 24], 8],
      [40, [28, 29, 30], 8],
      [41, [3, 4, 5], 9],
      [42, [9, 10, 11], 9],
      [43, [15, 16, 17], 9],
      [44, [21, 22, 23], 9],
      [45, [27, 28, 29], 9],
      [46, [3, 4, 5], 10],
      [47, [9, 10, 11], 10],
      [48, [15, 16, 17], 10],
      [49, [21, 22, 23], 10],
      [50, [27, 28, 29], 10],
      [51, [2, 3, 4], 11],
      [52, [8, 9, 10], 11],
      [53, [14, 15, 16], 11],
      [54, [20, 21, 22], 11],
      [55, [26, 27, 28], 11],
      [56, [2, 3, 4], 12],
      [57, [8, 9, 10], 12],
      [58, [14, 15, 16], 12],
      [59, [20, 21, 22], 12],
      [60, [26, 27, 28], 12],
    ];

    // 2027 shifts - first part only for simplicity
    const shifts2027 = [
      [1, [4, 5, 6], 1],
      [2, [10, 11, 12], 1],
      [3, [16, 17, 18], 1],
      [4, [22, 23, 24], 1],
      [5, [28, 29, 30], 1],
      [6, [3, 4, 5], 2],
      [7, [9, 10, 11], 2],
      [8, [15, 16, 17], 2],
      [9, [21, 22, 23], 2],
      [10, [27, 28, 1], [2, 3]],
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

    // Process 2027 shifts (partial)
    shifts2027.forEach(([shiftNum, days, months]) => {
      addShiftDates(shiftNum as number, days as number[], months as number | number[], 2027);
    });

    return shifts;
  };

  const shiftData = createShiftData();

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
      "Ocak",
      "Şubat",
      "Mart",
      "Nisan",
      "Mayıs",
      "Haziran",
      "Temmuz",
      "Ağustos",
      "Eylül",
      "Ekim",
      "Kasım",
      "Aralık",
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

  const goToYear = (year: number) => {
    setCurrentYear(year);
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
              height: "80px",
              minHeight: "80px",
              border: "1px solid #d1d5db",
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
            height: "80px",
            minHeight: "80px",
            padding: "8px",
            border: todayFlag ? "2px solid #facc15" : "1px solid #d1d5db",
            backgroundColor: shiftNumber ? "#dbeafe" : "#ffffff",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            fontSize: "12px",
          }}
        >
          <div style={{ fontWeight: "600", color: "#374151" }}>{day}</div>
          {shiftNumber && (
            <div
              style={{
                color: "#2563eb",
                fontWeight: "500",
                textAlign: "center",
                fontSize: "10px",
              }}
            >
              Vardiya #{shiftNumber}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      {/* Header */}
      <header style={{ backgroundColor: "#1e40af", color: "white", padding: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", position: "relative" }}>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                position: "absolute",
                left: 0,
                backgroundColor: "transparent",
                border: "none",
                color: "white",
                fontSize: "20px",
                cursor: "pointer",
                padding: "4px",
              }}
            >
              ← Ana Sayfa
            </button>
          )}
          <h1 style={{ fontSize: "18px", fontWeight: "600", textAlign: "center", width: "100%" }}>
            Vardiya Takvimi
          </h1>
        </div>
      </header>

      {/* Calendar Controls */}
      <div
        style={{
          backgroundColor: "white",
          borderBottom: "1px solid #e5e7eb",
          padding: "16px",
        }}
      >
        {/* Year Selector */}
        <div
          style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "16px" }}
        >
          {[2025, 2026, 2027].map((year) => (
            <button
              key={year}
              onClick={() => goToYear(year)}
              style={{
                padding: "4px 12px",
                borderRadius: "4px",
                fontSize: "14px",
                fontWeight: "500",
                border: "none",
                cursor: "pointer",
                backgroundColor: currentYear === year ? "#2563eb" : "#e5e7eb",
                color: currentYear === year ? "white" : "#374151",
              }}
            >
              {year}
            </button>
          ))}
        </div>

        {/* Month Navigation */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button
            onClick={goToPreviousMonth}
            style={{
              padding: "8px",
              borderRadius: "50%",
              border: "none",
              backgroundColor: "transparent",
              cursor: "pointer",
            }}
          >
            ◀
          </button>

          <h2 style={{ fontSize: "18px", fontWeight: "600" }}>
            {getMonthName(currentMonth)} {currentYear}
          </h2>

          <button
            onClick={goToNextMonth}
            style={{
              padding: "8px",
              borderRadius: "50%",
              border: "none",
              backgroundColor: "transparent",
              cursor: "pointer",
            }}
          >
            ▶
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div style={{ padding: "16px" }}>
        {/* Days of week header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: "0",
            marginBottom: "8px",
          }}
        >
          {["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"].map((day) => (
            <div
              key={day}
              style={{
                textAlign: "center",
                fontWeight: "600",
                color: "#4b5563",
                padding: "8px",
                fontSize: "14px",
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
            gap: "0",
            border: "1px solid #d1d5db",
          }}
        >
          {renderCalendarGrid()}
        </div>

        {/* Legend */}
        <div style={{ marginTop: "16px", fontSize: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <div
              style={{
                width: "16px",
                height: "16px",
                backgroundColor: "#dbeafe",
                border: "1px solid #d1d5db",
              }}
            />
            <span>Vardiya Günü (3 gün vardiya)</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <div
              style={{
                width: "16px",
                height: "16px",
                backgroundColor: "#ffffff",
                border: "1px solid #d1d5db",
              }}
            />
            <span>İzin Günü</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "16px",
                height: "16px",
                backgroundColor: "#ffffff",
                border: "2px solid #facc15",
              }}
            />
            <span>Bugün</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftCalendar;
