import React, { useState, useEffect, useMemo } from "react";
import Toast from "./Toast";
import { useToast } from "../hooks/useToast";

interface Captain {
  id: number;
  sicilNo: string;
  isim: string;
  aisMobNo: string;
  aktifEhliyetler: string[];
  durum: "Aktif" | "Pasif";
}

interface LeaveWeek {
  weekNumber: number;
  dateRange: string;
  month: string;
}

interface AnnualLeaveEntry {
  weekNumber: number;
  dateRange: string;
  month: string;
  person1: string;
  person2: string;
  person3: string;
  person4: string;
}

interface SummerLeaveEntry {
  weekNumber: number;
  startDate: string;
  endDate: string;
  person1: string;
  person2: string;
  person3: string;
  person4: string;
  person5: string;
  approved: boolean;
}

interface LeaveManagementProps {
  onBack?: () => void;
}

const LeaveManagement: React.FC<LeaveManagementProps> = ({ onBack }) => {
  const { toasts, showSuccess, removeToast } = useToast();
  // Captain data from CaptainInfoTable
  const realCaptainsData: Captain[] = [
    { id: 1, sicilNo: "51793", isim: "Harun DOKUZ (BK)", aisMobNo: "972410883", aktifEhliyetler: ["İst", "Çkl"], durum: "Aktif" },
    { id: 2, sicilNo: "51043", isim: "Osman ORHAL (BKV)", aisMobNo: "972410768", aktifEhliyetler: ["İst", "Çkl"], durum: "Aktif" },
    { id: 3, sicilNo: "51739", isim: "Kıvanç ERGÖNÜL", aisMobNo: "972410763", aktifEhliyetler: ["İst", "Çkl"], durum: "Aktif" },
    { id: 4, sicilNo: "51806", isim: "Yavuz ENGİNER", aisMobNo: "972410780", aktifEhliyetler: ["İst", "Çkl"], durum: "Aktif" },
    { id: 5, sicilNo: "50886", isim: "Tamer AZGIN", aisMobNo: "972410778", aktifEhliyetler: ["İst", "Çkl"], durum: "Aktif" },
    { id: 6, sicilNo: "50974", isim: "Berker İRİCİOĞLU", aisMobNo: "972410776", aktifEhliyetler: ["İst", "Çkl"], durum: "Aktif" },
    { id: 7, sicilNo: "52216", isim: "Selim KANDEMİRLİ", aisMobNo: "972410769", aktifEhliyetler: ["İst", "Çkl"], durum: "Aktif" },
    { id: 8, sicilNo: "52820", isim: "Sami ASLAN", aisMobNo: "972410765", aktifEhliyetler: ["İst", "Çkl"], durum: "Aktif" },
    { id: 9, sicilNo: "52361", isim: "Cihan BASA", aisMobNo: "972410757", aktifEhliyetler: ["İst", "Çkl"], durum: "Aktif" },
    { id: 10, sicilNo: "52818", isim: "Ahmet DURAK", aisMobNo: "972410753", aktifEhliyetler: ["İst", "Çkl"], durum: "Aktif" },
    { id: 11, sicilNo: "52953", isim: "Turgut KAYA", aisMobNo: "972410779", aktifEhliyetler: ["İst", "Çkl"], durum: "Aktif" },
    { id: 12, sicilNo: "52806", isim: "Alphan TÜRKANIK", aisMobNo: "972410820", aktifEhliyetler: ["İst"], durum: "Aktif" },
    { id: 13, sicilNo: "52958", isim: "Selahattin KUT", aisMobNo: "972410700", aktifEhliyetler: ["İst", "Çkl"], durum: "Aktif" },
    { id: 14, sicilNo: "53675", isim: "Kağan TATLICI", aisMobNo: "972410786", aktifEhliyetler: ["İst"], durum: "Aktif" },
    { id: 15, sicilNo: "53196", isim: "Serhat YALÇIN", aisMobNo: "972410847", aktifEhliyetler: ["İst"], durum: "Aktif" },
    { id: 16, sicilNo: "52187", isim: "Uğraş AKYOL", aisMobNo: "972410741", aktifEhliyetler: ["İst", "Çkl"], durum: "Aktif" },
    { id: 17, sicilNo: "52942", isim: "Taylan GÜLER", aisMobNo: "972410864", aktifEhliyetler: ["İst"], durum: "Aktif" },
    { id: 18, sicilNo: "53677", isim: "Aytaç BAHADIR", aisMobNo: "", aktifEhliyetler: ["İst"], durum: "Aktif" },
    { id: 19, sicilNo: "53759", isim: "M.Kemal ONUR", aisMobNo: "972410689", aktifEhliyetler: ["İst"], durum: "Aktif" },
    { id: 20, sicilNo: "53752", isim: "Dilek ALTAY", aisMobNo: "972410706", aktifEhliyetler: ["İst"], durum: "Aktif" },
    { id: 21, sicilNo: "53857", isim: "Gökmen ALTUNDOĞAN", aisMobNo: "972410903", aktifEhliyetler: [], durum: "Pasif" },
    { id: 22, sicilNo: "53891", isim: "Mustafa TÜRKOĞLU", aisMobNo: "", aktifEhliyetler: [], durum: "Pasif" },
    { id: 23, sicilNo: "50978", isim: "Rahmi Alpaslan SOYUER", aisMobNo: "", aktifEhliyetler: ["İst", "Çkl"], durum: "Aktif" },
    // Empty slots for future pilots
    { id: 24, sicilNo: "", isim: "", aisMobNo: "", aktifEhliyetler: [], durum: "Pasif" },
    { id: 25, sicilNo: "", isim: "", aisMobNo: "", aktifEhliyetler: [], durum: "Pasif" },
    { id: 26, sicilNo: "", isim: "", aisMobNo: "", aktifEhliyetler: [], durum: "Pasif" },
    { id: 27, sicilNo: "", isim: "", aisMobNo: "", aktifEhliyetler: [], durum: "Pasif" },
    { id: 28, sicilNo: "", isim: "", aisMobNo: "", aktifEhliyetler: [], durum: "Pasif" },
  ];

  // Leave weeks data from shift calendar
  const leaveWeeksData: LeaveWeek[] = useMemo(() => [
    // Ocak
    { weekNumber: 1, dateRange: "5-10 Ocak", month: "Ocak" },
    { weekNumber: 2, dateRange: "11-16 Ocak", month: "Ocak" },
    { weekNumber: 3, dateRange: "17-22 Ocak", month: "Ocak" },
    { weekNumber: 4, dateRange: "23-28 Ocak", month: "Ocak" },
    // Şubat
    { weekNumber: 5, dateRange: "29 Ocak - 3 Şubat", month: "Şubat" },
    { weekNumber: 6, dateRange: "4-9 Şubat", month: "Şubat" },
    { weekNumber: 7, dateRange: "10-15 Şubat", month: "Şubat" },
    { weekNumber: 8, dateRange: "16-21 Şubat", month: "Şubat" },
    { weekNumber: 9, dateRange: "22-27 Şubat", month: "Şubat" },
    // Mart
    { weekNumber: 10, dateRange: "28 Şubat - 5 Mart", month: "Mart" },
    { weekNumber: 11, dateRange: "6-11 Mart", month: "Mart" },
    { weekNumber: 12, dateRange: "12-17 Mart", month: "Mart" },
    { weekNumber: 13, dateRange: "18-23 Mart", month: "Mart" },
    { weekNumber: 14, dateRange: "24-29 Mart", month: "Mart" },
    // Nisan
    { weekNumber: 15, dateRange: "30 Mart - 4 Nisan", month: "Nisan" },
    { weekNumber: 16, dateRange: "5-10 Nisan", month: "Nisan" },
    { weekNumber: 17, dateRange: "11-16 Nisan", month: "Nisan" },
    { weekNumber: 18, dateRange: "17-22 Nisan", month: "Nisan" },
    { weekNumber: 19, dateRange: "23-28 Nisan", month: "Nisan" },
    // Mayıs
    { weekNumber: 20, dateRange: "29 Nisan - 4 Mayıs", month: "Mayıs" },
    { weekNumber: 21, dateRange: "5-10 Mayıs", month: "Mayıs" },
    { weekNumber: 22, dateRange: "11-16 Mayıs", month: "Mayıs" },
    { weekNumber: 23, dateRange: "17-22 Mayıs", month: "Mayıs" },
    { weekNumber: 24, dateRange: "23-28 Mayıs", month: "Mayıs" },
    // Haziran - Summer period starts
    { weekNumber: 25, dateRange: "29 Mayıs - 3 Haziran", month: "Haziran" },
    { weekNumber: 26, dateRange: "4-9 Haziran", month: "Haziran" },
    { weekNumber: 27, dateRange: "10-15 Haziran", month: "Haziran" },
    { weekNumber: 28, dateRange: "16-21 Haziran", month: "Haziran" },
    { weekNumber: 29, dateRange: "22-27 Haziran", month: "Haziran" },
    // Temmuz
    { weekNumber: 30, dateRange: "28 Haziran - 3 Temmuz", month: "Temmuz" },
    { weekNumber: 31, dateRange: "4-9 Temmuz", month: "Temmuz" },
    { weekNumber: 32, dateRange: "10-15 Temmuz", month: "Temmuz" },
    { weekNumber: 33, dateRange: "16-21 Temmuz", month: "Temmuz" },
    { weekNumber: 34, dateRange: "22-27 Temmuz", month: "Temmuz" },
    // Ağustos
    { weekNumber: 35, dateRange: "28 Temmuz - 2 Ağustos", month: "Ağustos" },
    { weekNumber: 36, dateRange: "3-8 Ağustos", month: "Ağustos" },
    { weekNumber: 37, dateRange: "9-14 Ağustos", month: "Ağustos" },
    { weekNumber: 38, dateRange: "15-20 Ağustos", month: "Ağustos" },
    { weekNumber: 39, dateRange: "21-26 Ağustos", month: "Ağustos" },
    // Eylül - Summer period ends
    { weekNumber: 40, dateRange: "27 Ağustos - 1 Eylül", month: "Eylül" },
    { weekNumber: 41, dateRange: "2-7 Eylül", month: "Eylül" },
    { weekNumber: 42, dateRange: "8-13 Eylül", month: "Eylül" },
    { weekNumber: 43, dateRange: "14-19 Eylül", month: "Eylül" },
    { weekNumber: 44, dateRange: "20-25 Eylül", month: "Eylül" },
    // Ekim
    { weekNumber: 45, dateRange: "26 Eylül - 1 Ekim", month: "Ekim" },
    { weekNumber: 46, dateRange: "2-7 Ekim", month: "Ekim" },
    { weekNumber: 47, dateRange: "8-13 Ekim", month: "Ekim" },
    { weekNumber: 48, dateRange: "14-19 Ekim", month: "Ekim" },
    { weekNumber: 49, dateRange: "20-25 Ekim", month: "Ekim" },
    { weekNumber: 50, dateRange: "26-31 Ekim", month: "Ekim" },
    // Kasım
    { weekNumber: 51, dateRange: "1-6 Kasım", month: "Kasım" },
    { weekNumber: 52, dateRange: "7-12 Kasım", month: "Kasım" },
    { weekNumber: 53, dateRange: "13-18 Kasım", month: "Kasım" },
    { weekNumber: 54, dateRange: "19-24 Kasım", month: "Kasım" },
    { weekNumber: 55, dateRange: "25-30 Kasım", month: "Kasım" },
    // Aralık
    { weekNumber: 56, dateRange: "1-6 Aralık", month: "Aralık" },
    { weekNumber: 57, dateRange: "7-12 Aralık", month: "Aralık" },
    { weekNumber: 58, dateRange: "13-18 Aralık", month: "Aralık" },
    { weekNumber: 59, dateRange: "19-24 Aralık", month: "Aralık" },
    { weekNumber: 60, dateRange: "25-30 Aralık", month: "Aralık" },
  ], []);

  // Summer leave periods (20 June - 8 September school closure period)
  const summerLeaveWeeks: SummerLeaveEntry[] = useMemo(() => [
    { weekNumber: 26, startDate: "04 Haziran", endDate: "09 Haziran", person1: "", person2: "", person3: "", person4: "", person5: "", approved: false },
    { weekNumber: 27, startDate: "10 Haziran", endDate: "15 Haziran", person1: "", person2: "", person3: "", person4: "", person5: "", approved: false },
    { weekNumber: 28, startDate: "16 Haziran", endDate: "21 Haziran", person1: "", person2: "", person3: "", person4: "", person5: "", approved: false },
    { weekNumber: 29, startDate: "22 Haziran", endDate: "27 Haziran", person1: "", person2: "", person3: "", person4: "", person5: "", approved: false },
    { weekNumber: 30, startDate: "28 Haziran", endDate: "03 Temmuz", person1: "", person2: "", person3: "", person4: "", person5: "", approved: false },
    { weekNumber: 31, startDate: "04 Temmuz", endDate: "09 Temmuz", person1: "", person2: "", person3: "", person4: "", person5: "", approved: false },
    { weekNumber: 32, startDate: "10 Temmuz", endDate: "15 Temmuz", person1: "", person2: "", person3: "", person4: "", person5: "", approved: false },
    { weekNumber: 33, startDate: "16 Temmuz", endDate: "21 Temmuz", person1: "", person2: "", person3: "", person4: "", person5: "", approved: false },
    { weekNumber: 34, startDate: "22 Temmuz", endDate: "27 Temmuz", person1: "", person2: "", person3: "", person4: "", person5: "", approved: false },
    // Ağustos 2025 izin planı
    { weekNumber: 35, startDate: "28 Temmuz", endDate: "02 Ağustos", person1: "Selahattin KUT", person2: "Uğraş AKYOL", person3: "", person4: "", person5: "", approved: true },
    { weekNumber: 36, startDate: "03 Ağustos", endDate: "08 Ağustos", person1: "Selim KANDEMİRLİ", person2: "", person3: "", person4: "", person5: "", approved: true },
    { weekNumber: 37, startDate: "09 Ağustos", endDate: "14 Ağustos", person1: "Uğraş AKYOL", person2: "M.Kemal ONUR", person3: "Selahattin KUT", person4: "", person5: "", approved: true },
    { weekNumber: 38, startDate: "15 Ağustos", endDate: "20 Ağustos", person1: "Uğraş AKYOL", person2: "Kağan TATLICI", person3: "Harun DOKUZ (BK)", person4: "", person5: "", approved: true },
    { weekNumber: 39, startDate: "21 Ağustos", endDate: "26 Ağustos", person1: "Turgut KAYA", person2: "Berker İRİCİOĞLU", person3: "Cihan BASA", person4: "", person5: "", approved: true },
    { weekNumber: 40, startDate: "27 Ağustos", endDate: "01 Eylül", person1: "Serhat YALÇIN", person2: "Aytaç BAHADIR", person3: "Taylan GÜLER", person4: "", person5: "", approved: true },
    // Eylül 2025 izin planı
    { weekNumber: 41, startDate: "02 Eylül", endDate: "07 Eylül", person1: "Kıvanç ERGÖNÜL", person2: "Selahattin KUT", person3: "Aytaç BAHADIR", person4: "", person5: "", approved: true },
    { weekNumber: 42, startDate: "08 Eylül", endDate: "13 Eylül", person1: "Kıvanç ERGÖNÜL", person2: "", person3: "", person4: "", person5: "", approved: true },
    { weekNumber: 43, startDate: "14 Eylül", endDate: "19 Eylül", person1: "Kıvanç ERGÖNÜL", person2: "Turgut KAYA", person3: "", person4: "", person5: "", approved: true },
    { weekNumber: 44, startDate: "20 Eylül", endDate: "25 Eylül", person1: "", person2: "", person3: "", person4: "", person5: "", approved: false },
    { weekNumber: 45, startDate: "26 Eylül", endDate: "01 Ekim", person1: "", person2: "", person3: "", person4: "", person5: "", approved: false },
  ], []);

  const [selectedPerson, setSelectedPerson] = useState<string>("");
  // Get current month name in Turkish
  const getCurrentMonthName = () => {
    const currentDate = new Date();
    const monthIndex = currentDate.getMonth();
    const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
    return monthNames[monthIndex];
  };

  const [currentMonth, setCurrentMonth] = useState<string>(getCurrentMonthName());
  const [annualLeaveData, setAnnualLeaveData] = useState<AnnualLeaveEntry[]>([]);
  const [summerLeaveData, setSummerLeaveData] = useState<SummerLeaveEntry[]>(summerLeaveWeeks);

  const months = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

  // Initialize annual leave data and transfer approved summer leaves
  useEffect(() => {
    const initialData: AnnualLeaveEntry[] = leaveWeeksData.map(week => ({
      weekNumber: week.weekNumber,
      dateRange: week.dateRange,
      month: week.month,
      person1: "",
      person2: "",
      person3: "",
      person4: ""
    }));

    // Transfer approved summer leaves to annual leave data
    const updatedData = initialData.map(annualWeek => {
      const summerWeek = summerLeaveWeeks.find(sw => sw.weekNumber === annualWeek.weekNumber && sw.approved);
      if (summerWeek) {
        const peopleToTransfer = [
          summerWeek.person1,
          summerWeek.person2,
          summerWeek.person3,
          summerWeek.person4,
          summerWeek.person5
        ].filter(p => p !== "");

        return {
          ...annualWeek,
          person1: peopleToTransfer[0] || "",
          person2: peopleToTransfer[1] || "",
          person3: peopleToTransfer[2] || "",
          person4: peopleToTransfer[3] || ""
        };
      }
      return annualWeek;
    });

    setAnnualLeaveData(updatedData);
  }, [leaveWeeksData, summerLeaveWeeks]);

  // Handle person selection validation
  const isPersonAvailableForWeek = (personName: string, weekNumber: number): boolean => {
    if (!personName) return true;

    // Check annual leave data
    const weekData = annualLeaveData.find(w => w.weekNumber === weekNumber);
    if (weekData) {
      const assignments = [weekData.person1, weekData.person2, weekData.person3, weekData.person4];
      if (assignments.filter(p => p === personName).length > 0) {
        return false;
      }
    }

    // Check summer leave data
    const summerWeekData = summerLeaveData.find(w => w.weekNumber === weekNumber);
    if (summerWeekData) {
      const summerAssignments = [
        summerWeekData.person1,
        summerWeekData.person2,
        summerWeekData.person3,
        summerWeekData.person4,
        summerWeekData.person5
      ];
      if (summerAssignments.filter(p => p === personName).length > 0) {
        return false;
      }
    }

    return true;
  };

  // Handle annual leave person selection
  const handleAnnualLeaveChange = (weekNumber: number, field: keyof Omit<AnnualLeaveEntry, 'weekNumber' | 'dateRange' | 'month'>, value: string) => {
    setAnnualLeaveData(prev => prev.map(week => {
      if (week.weekNumber === weekNumber) {
        return { ...week, [field]: value };
      }
      return week;
    }));
  };

  // Handle summer leave person selection
  const handleSummerLeaveChange = (weekNumber: number, field: keyof Omit<SummerLeaveEntry, 'weekNumber' | 'startDate' | 'endDate' | 'approved'>, value: string | boolean) => {
    setSummerLeaveData(prev => prev.map(week => {
      if (week.weekNumber === weekNumber) {
        return { ...week, [field]: value };
      }
      return week;
    }));
  };

  // Handle approval and transfer to annual planning
  const handleApproval = (weekNumber: number, approved: boolean) => {
    const summerWeek = summerLeaveData.find(w => w.weekNumber === weekNumber);
    if (!summerWeek) return;

    if (approved) {
      // Transfer approved summer leaves to annual planning
      const peopleToTransfer = [
        summerWeek.person1,
        summerWeek.person2,
        summerWeek.person3,
        summerWeek.person4,
        summerWeek.person5
      ].filter(p => p !== "");

      setAnnualLeaveData(prev => prev.map(week => {
        if (week.weekNumber === weekNumber) {
          return {
            ...week,
            person1: peopleToTransfer[0] || "",
            person2: peopleToTransfer[1] || "",
            person3: peopleToTransfer[2] || "",
            person4: peopleToTransfer[3] || ""
          };
        }
        return week;
      }));
    }

    // Update approved status directly in summer leave data
    setSummerLeaveData(prev => prev.map(week => {
      if (week.weekNumber === weekNumber) {
        return { ...week, approved };
      }
      return week;
    }));
  };

  // Filter data by month
  const getFilteredAnnualData = () => {
    if (currentMonth === "Tümü") {
      return annualLeaveData;
    }
    return annualLeaveData.filter(week => week.month === currentMonth);
  };

  // Save functions
  const handleSaveAnnualLeave = () => {
    console.log("Annual leave data saved:", annualLeaveData);
    showSuccess("📋 Yıllık izin verileri kaydedildi!");
  };

  const handleSaveSummerLeave = () => {
    console.log("Summer leave data saved:", summerLeaveData);
    showSuccess("🏖️ Yaz izni verileri kaydedildi!");
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      {/* Header */}
      <header style={{ backgroundColor: "#1e40af", color: "white", padding: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h1 style={{ fontSize: "18px", fontWeight: "600", textAlign: "center", lineHeight: "1.3", flex: 1 }}>
            İzin Yönetim Paneli
          </h1>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                backgroundColor: "rgba(255,255,255,0.1)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
                padding: "8px 12px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              ← Geri
            </button>
          )}
        </div>
      </header>

      {/* Person Selection */}
      <div style={{ padding: "16px" }}>
        <div style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "20px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          marginBottom: "16px"
        }}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              color: "#374151",
              fontSize: "16px",
              fontWeight: "600",
              marginBottom: "8px"
            }}>
              İşlem Yapan Kişi:
            </label>
            <select 
              value={selectedPerson}
              onChange={(e) => setSelectedPerson(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                fontSize: "16px",
                border: "2px solid #e5e7eb",
                borderRadius: "8px",
                backgroundColor: "white",
                color: "#374151",
                outline: "none",
                cursor: "pointer"
              }}
              onFocus={(e) => e.target.style.borderColor = "#2563eb"}
              onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
            >
              <option value="">Lütfen seçiniz</option>
              {realCaptainsData.filter(captain => captain.isim.trim() !== "").map(captain => (
                <option key={captain.id} value={captain.isim}>
                  {captain.isim}
                </option>
              ))}
            </select>
          </div>
          
          {/* Important Dates Info */}
          <div style={{
            backgroundColor: "#eff6ff",
            border: "1px solid #bfdbfe",
            padding: "16px",
            borderRadius: "8px"
          }}>
            <h3 style={{
              color: "#1e40af",
              fontSize: "14px",
              fontWeight: "600",
              marginBottom: "12px",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}>
              📅 2025 Yılı Önemli Tarihler
            </h3>
            <div style={{ color: "#1e40af", fontSize: "13px", lineHeight: "1.5" }}>
              <div style={{ marginBottom: "4px" }}>
                <strong>Ramazan Bayramı:</strong> 30 Mart - 1 Nisan
              </div>
              <div style={{ marginBottom: "4px" }}>
                <strong>Kurban Bayramı:</strong> 6 - 9 Haziran
              </div>
              <div>
                <strong>Yaz Tatili:</strong> 20 Haziran - 8 Eylül
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Show tables only if person is selected */}
      {selectedPerson && (
        <>
          {/* Annual Leave Planning */}
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "20px",
            margin: "0 16px 16px 16px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "20px",
              flexWrap: "wrap",
              gap: "12px"
            }}>
              <h2 style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "#1e40af",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}>
                📋 2025 YILI İZİN PLANLAMASI
              </h2>
              <button
                onClick={handleSaveAnnualLeave}
                style={{
                  backgroundColor: "#1e40af",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
                onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = "#1d4ed8"}
                onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = "#1e40af"}
              >
                💾 Yıllık İzin Kaydet
              </button>
            </div>

            {/* Monthly Tabs */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))",
                gap: "8px",
                marginBottom: "12px"
              }}>
                {months.map(month => (
                  <button
                    key={month}
                    onClick={() => setCurrentMonth(month)}
                    style={{
                      padding: "8px 4px",
                      fontSize: "12px",
                      fontWeight: "500",
                      borderRadius: "6px",
                      border: "1px solid #e5e7eb",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      backgroundColor: currentMonth === month ? "#1e40af" : "white",
                      color: currentMonth === month ? "white" : "#374151"
                    }}
                    onMouseOver={(e) => {
                      if (currentMonth !== month) {
                        (e.target as HTMLElement).style.backgroundColor = "#eff6ff";
                      }
                    }}
                    onMouseOut={(e) => {
                      if (currentMonth !== month) {
                        (e.target as HTMLElement).style.backgroundColor = "white";
                      }
                    }}
                  >
                    {month}
                  </button>
                ))}
              </div>
              <div style={{ textAlign: "center" }}>
                <button
                  onClick={() => setCurrentMonth("Tümü")}
                  style={{
                    padding: "8px 16px",
                    fontSize: "13px",
                    fontWeight: "500",
                    borderRadius: "8px",
                    border: "none",
                    cursor: "pointer",
                    backgroundColor: currentMonth === "Tümü" ? "#dc2626" : "#ef4444",
                    color: "white"
                  }}
                  onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = "#dc2626"}
                  onMouseOut={(e) => {
                    if (currentMonth !== "Tümü") {
                      (e.target as HTMLElement).style.backgroundColor = "#ef4444";
                    }
                  }}
                >
                  📅 Tüm Ayları Göster
                </button>
              </div>
            </div>

            {/* Current Month Display */}
            <div style={{
              textAlign: "center",
              fontSize: "14px",
              fontWeight: "600",
              color: "#059669",
              marginBottom: "16px",
              padding: "8px 12px",
              backgroundColor: "#ecfdf5",
              borderRadius: "6px",
              border: "1px solid #a7f3d0"
            }}>
              {currentMonth === "Tümü" ? "📅 TÜM AYLAR" : `📅 ${currentMonth.toUpperCase()} 2025`}
            </div>

            {/* Annual Leave Table - Mobile Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {getFilteredAnnualData().map(week => (
                <div key={week.weekNumber} style={{
                  backgroundColor: "white",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  overflow: "hidden"
                }}>
                  <div style={{
                    backgroundColor: "#eff6ff",
                    padding: "12px 16px",
                    borderBottom: "1px solid #bfdbfe"
                  }}>
                    <h3 style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#1e40af",
                      textAlign: "center",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px"
                    }}>
                      📅 {week.dateRange}
                    </h3>
                  </div>
                  <div style={{ padding: "16px" }}>
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: "12px"
                    }}>
                      {[1, 2, 3, 4].map(personIndex => (
                        <div key={personIndex} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <label style={{
                            fontSize: "12px",
                            fontWeight: "500",
                            color: "#6b7280"
                          }}>
                            İzin {personIndex}:
                          </label>
                          <select
                            value={week[`person${personIndex}` as keyof AnnualLeaveEntry] as string}
                            onChange={(e) => handleAnnualLeaveChange(week.weekNumber, `person${personIndex}` as keyof Omit<AnnualLeaveEntry, 'weekNumber' | 'dateRange' | 'month'>, e.target.value)}
                            style={{
                              padding: "8px 12px",
                              fontSize: "13px",
                              border: "1px solid #d1d5db",
                              borderRadius: "6px",
                              backgroundColor: "white",
                              color: "#374151",
                              cursor: "pointer"
                            }}
                          >
                            <option value="">*</option>
                            {realCaptainsData.filter(captain => captain.isim.trim() !== "").map(captain => (
                              <option
                                key={captain.id}
                                value={captain.isim}
                                disabled={!isPersonAvailableForWeek(captain.isim, week.weekNumber)}
                              >
                                {captain.isim}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summer Leave Request */}
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "20px",
            margin: "0 16px 16px 16px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "20px",
              flexWrap: "wrap",
              gap: "12px"
            }}>
              <h2 style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "#dc2626",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}>
                🏖️ 2025 YAZ DÖNEMİ İZİN TALEP ÇİZELGESİ
              </h2>
              <button
                onClick={handleSaveSummerLeave}
                style={{
                  backgroundColor: "#dc2626",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
                onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = "#b91c1c"}
                onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = "#dc2626"}
              >
                💾 Yaz İzinleri Kaydet
              </button>
            </div>

            {/* Summer Leave Cards - Responsive Grid Layout */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "10px"
            }}>
              {summerLeaveData.map(week => (
                <div key={week.weekNumber} style={{
                  backgroundColor: "white",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  overflow: "hidden"
                }}>
                  <div style={{
                    backgroundColor: week.approved ? "#fef2f2" : "#fef3f2",
                    padding: "12px 16px",
                    borderBottom: "1px solid #fca5a5"
                  }}>
                    <h3 style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#dc2626",
                      textAlign: "center",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px"
                    }}>
                      📅 {week.startDate} → {week.endDate}
                      {week.approved && <span style={{ color: "#16a34a" }}>✅</span>}
                    </h3>
                  </div>
                  <div style={{ padding: "10px" }}>
                    {/* Flexible layout for person selections */}
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(115px, 1fr))",
                      gap: "5px",
                      marginBottom: "8px"
                    }}>
                      {[1, 2, 3, 4].map(personIndex => (
                        <div 
                          key={personIndex} 
                          style={{ 
                            display: "flex", 
                            flexDirection: "column", 
                            gap: "3px"
                          }}
                        >
                          <label style={{
                            fontSize: "10px",
                            fontWeight: "500",
                            color: "#6b7280"
                          }}>
                            {personIndex}.
                          </label>
                          <select
                            value={week[`person${personIndex}` as keyof SummerLeaveEntry] as string}
                            onChange={(e) => handleSummerLeaveChange(week.weekNumber, `person${personIndex}` as keyof Omit<SummerLeaveEntry, 'weekNumber' | 'startDate' | 'endDate' | 'approved'>, e.target.value)}
                            style={{
                              padding: "4px 6px",
                              fontSize: "11px",
                              border: "1px solid #d1d5db",
                              borderRadius: "4px",
                              backgroundColor: week.approved ? "#f3f4f6" : "white",
                              color: "#374151",
                              cursor: week.approved ? "not-allowed" : "pointer",
                              width: "100%",
                              boxSizing: "border-box"
                            }}
                            disabled={week.approved}
                          >
                            <option value="">*</option>
                            {realCaptainsData.filter(captain => captain.isim.trim() !== "").map(captain => (
                              <option
                                key={captain.id}
                                value={captain.isim}
                                disabled={!isPersonAvailableForWeek(captain.isim, week.weekNumber)}
                              >
                                {captain.isim}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                    
                    {/* Fifth person - full width */}
                    <div style={{
                      display: "flex", 
                      flexDirection: "column", 
                      gap: "3px",
                      marginBottom: "8px"
                    }}>
                      <label style={{
                        fontSize: "10px",
                        fontWeight: "500",
                        color: "#6b7280"
                      }}>
                        5.
                      </label>
                      <select
                        value={week.person5}
                        onChange={(e) => handleSummerLeaveChange(week.weekNumber, 'person5', e.target.value)}
                        style={{
                          padding: "4px 6px",
                          fontSize: "11px",
                          border: "1px solid #d1d5db",
                          borderRadius: "4px",
                          backgroundColor: week.approved ? "#f3f4f6" : "white",
                          color: "#374151",
                          cursor: week.approved ? "not-allowed" : "pointer",
                          width: "100%",
                          boxSizing: "border-box"
                        }}
                        disabled={week.approved}
                      >
                        <option value="">*</option>
                        {realCaptainsData.filter(captain => captain.isim.trim() !== "").map(captain => (
                          <option
                            key={captain.id}
                            value={captain.isim}
                            disabled={!isPersonAvailableForWeek(captain.isim, week.weekNumber)}
                          >
                            {captain.isim}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Approval checkbox */}
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingTop: "12px",
                      borderTop: "1px solid #e5e7eb"
                    }}>
                      <span style={{
                        fontSize: "12px",
                        fontWeight: "500",
                        color: "#6b7280"
                      }}>
                        ✅ Onaylandı:
                      </span>
                      <input
                        type="checkbox"
                        checked={week.approved}
                        onChange={(e) => handleApproval(week.weekNumber, e.target.checked)}
                        style={{
                          width: "16px",
                          height: "16px",
                          cursor: "pointer",
                          accentColor: "#dc2626"
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default React.memo(LeaveManagement);