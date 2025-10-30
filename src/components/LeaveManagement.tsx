import React, { useState, useEffect, useMemo, useCallback } from "react";
import Toast from "./Toast";
import { useToast } from "../hooks/useToast";
import { LeaveService, CaptainService } from "../services/database";
import type { Captain as FirestoreCaptain, LeaveEntry } from "../services/database";

// Use Captain type from database service
type Captain = FirestoreCaptain;

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
  const { toasts, showSuccess, showError, removeToast } = useToast();
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [captains, setCaptains] = useState<Captain[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  // Leave weeks data from shift calendar - get data based on selected year
  const leaveWeeksData: LeaveWeek[] = useMemo(() => {
    if (selectedYear === 2025) {
      return [
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
        { weekNumber: 61, dateRange: "31 Aralık - 5 Ocak", month: "Aralık" },
      ];
    } else if (selectedYear === 2026) {
      return [
        // Ocak
        { weekNumber: 1, dateRange: "6-11 Ocak", month: "Ocak" },
        { weekNumber: 2, dateRange: "12-17 Ocak", month: "Ocak" },
        { weekNumber: 3, dateRange: "18-23 Ocak", month: "Ocak" },
        { weekNumber: 4, dateRange: "24-29 Ocak", month: "Ocak" },
        // Şubat
        { weekNumber: 5, dateRange: "30 Ocak - 4 Şubat", month: "Şubat" },
        { weekNumber: 6, dateRange: "5-10 Şubat", month: "Şubat" },
        { weekNumber: 7, dateRange: "11-16 Şubat", month: "Şubat" },
        { weekNumber: 8, dateRange: "17-22 Şubat", month: "Şubat" },
        { weekNumber: 9, dateRange: "23-28 Şubat", month: "Şubat" },
        // Mart
        { weekNumber: 10, dateRange: "1-6 Mart", month: "Mart" },
        { weekNumber: 11, dateRange: "7-12 Mart", month: "Mart" },
        { weekNumber: 12, dateRange: "13-18 Mart", month: "Mart" },
        { weekNumber: 13, dateRange: "19-24 Mart", month: "Mart" },
        { weekNumber: 14, dateRange: "25-30 Mart", month: "Mart" },
        // Nisan
        { weekNumber: 15, dateRange: "31 Mart - 5 Nisan", month: "Nisan" },
        { weekNumber: 16, dateRange: "6-11 Nisan", month: "Nisan" },
        { weekNumber: 17, dateRange: "12-17 Nisan", month: "Nisan" },
        { weekNumber: 18, dateRange: "18-23 Nisan", month: "Nisan" },
        { weekNumber: 19, dateRange: "24-29 Nisan", month: "Nisan" },
        // Mayıs
        { weekNumber: 20, dateRange: "30 Nisan - 5 Mayıs", month: "Mayıs" },
        { weekNumber: 21, dateRange: "6-11 Mayıs", month: "Mayıs" },
        { weekNumber: 22, dateRange: "12-17 Mayıs", month: "Mayıs" },
        { weekNumber: 23, dateRange: "18-23 Mayıs", month: "Mayıs" },
        { weekNumber: 24, dateRange: "24-29 Mayıs", month: "Mayıs" },
        // Haziran - Summer period starts
        { weekNumber: 25, dateRange: "30 Mayıs - 4 Haziran", month: "Haziran" },
        { weekNumber: 26, dateRange: "5-10 Haziran", month: "Haziran" },
        { weekNumber: 27, dateRange: "11-16 Haziran", month: "Haziran" },
        { weekNumber: 28, dateRange: "17-22 Haziran", month: "Haziran" },
        { weekNumber: 29, dateRange: "23-28 Haziran", month: "Haziran" },
        // Temmuz
        { weekNumber: 30, dateRange: "29 Haziran - 4 Temmuz", month: "Temmuz" },
        { weekNumber: 31, dateRange: "5-10 Temmuz", month: "Temmuz" },
        { weekNumber: 32, dateRange: "11-16 Temmuz", month: "Temmuz" },
        { weekNumber: 33, dateRange: "17-22 Temmuz", month: "Temmuz" },
        { weekNumber: 34, dateRange: "23-28 Temmuz", month: "Temmuz" },
        // Ağustos
        { weekNumber: 35, dateRange: "29 Temmuz - 3 Ağustos", month: "Ağustos" },
        { weekNumber: 36, dateRange: "4-9 Ağustos", month: "Ağustos" },
        { weekNumber: 37, dateRange: "10-15 Ağustos", month: "Ağustos" },
        { weekNumber: 38, dateRange: "16-21 Ağustos", month: "Ağustos" },
        { weekNumber: 39, dateRange: "22-27 Ağustos", month: "Ağustos" },
        // Eylül - Summer period ends
        { weekNumber: 40, dateRange: "28 Ağustos - 2 Eylül", month: "Eylül" },
        { weekNumber: 41, dateRange: "3-8 Eylül", month: "Eylül" },
        { weekNumber: 42, dateRange: "9-14 Eylül", month: "Eylül" },
        { weekNumber: 43, dateRange: "15-20 Eylül", month: "Eylül" },
        { weekNumber: 44, dateRange: "21-26 Eylül", month: "Eylül" },
        // Ekim
        { weekNumber: 45, dateRange: "27 Eylül - 2 Ekim", month: "Ekim" },
        { weekNumber: 46, dateRange: "3-8 Ekim", month: "Ekim" },
        { weekNumber: 47, dateRange: "9-14 Ekim", month: "Ekim" },
        { weekNumber: 48, dateRange: "15-20 Ekim", month: "Ekim" },
        { weekNumber: 49, dateRange: "21-26 Ekim", month: "Ekim" },
        { weekNumber: 50, dateRange: "27 Ekim - 1 Kasım", month: "Ekim" },
        // Kasım
        { weekNumber: 51, dateRange: "2-7 Kasım", month: "Kasım" },
        { weekNumber: 52, dateRange: "8-13 Kasım", month: "Kasım" },
        { weekNumber: 53, dateRange: "14-19 Kasım", month: "Kasım" },
        { weekNumber: 54, dateRange: "20-25 Kasım", month: "Kasım" },
        { weekNumber: 55, dateRange: "26 Kasım - 1 Aralık", month: "Kasım" },
        // Aralık
        { weekNumber: 56, dateRange: "2-7 Aralık", month: "Aralık" },
        { weekNumber: 57, dateRange: "8-13 Aralık", month: "Aralık" },
        { weekNumber: 58, dateRange: "14-19 Aralık", month: "Aralık" },
        { weekNumber: 59, dateRange: "20-25 Aralık", month: "Aralık" },
        { weekNumber: 60, dateRange: "26-31 Aralık", month: "Aralık" },
      ];
    } else if (selectedYear === 2027) {
      return [
        // Ocak
        { weekNumber: 1, dateRange: "4-9 Ocak", month: "Ocak" },
        { weekNumber: 2, dateRange: "10-15 Ocak", month: "Ocak" },
        { weekNumber: 3, dateRange: "16-21 Ocak", month: "Ocak" },
        { weekNumber: 4, dateRange: "22-27 Ocak", month: "Ocak" },
        // Şubat
        { weekNumber: 5, dateRange: "28 Ocak - 2 Şubat", month: "Şubat" },
        { weekNumber: 6, dateRange: "3-8 Şubat", month: "Şubat" },
        { weekNumber: 7, dateRange: "9-14 Şubat", month: "Şubat" },
        { weekNumber: 8, dateRange: "15-20 Şubat", month: "Şubat" },
        { weekNumber: 9, dateRange: "21-26 Şubat", month: "Şubat" },
        // Mart
        { weekNumber: 10, dateRange: "27 Şubat - 4 Mart", month: "Mart" },
        { weekNumber: 11, dateRange: "5-10 Mart", month: "Mart" },
        { weekNumber: 12, dateRange: "11-16 Mart", month: "Mart" },
        { weekNumber: 13, dateRange: "17-22 Mart", month: "Mart" },
        { weekNumber: 14, dateRange: "23-28 Mart", month: "Mart" },
        // Nisan
        { weekNumber: 15, dateRange: "29 Mart - 3 Nisan", month: "Nisan" },
        { weekNumber: 16, dateRange: "4-9 Nisan", month: "Nisan" },
        { weekNumber: 17, dateRange: "10-15 Nisan", month: "Nisan" },
        { weekNumber: 18, dateRange: "16-21 Nisan", month: "Nisan" },
        { weekNumber: 19, dateRange: "22-27 Nisan", month: "Nisan" },
        // Mayıs
        { weekNumber: 20, dateRange: "28 Nisan - 3 Mayıs", month: "Mayıs" },
        { weekNumber: 21, dateRange: "4-9 Mayıs", month: "Mayıs" },
        { weekNumber: 22, dateRange: "10-15 Mayıs", month: "Mayıs" },
        { weekNumber: 23, dateRange: "16-21 Mayıs", month: "Mayıs" },
        { weekNumber: 24, dateRange: "22-27 Mayıs", month: "Mayıs" },
        // Haziran - Summer period starts
        { weekNumber: 25, dateRange: "28 Mayıs - 2 Haziran", month: "Haziran" },
        { weekNumber: 26, dateRange: "3-8 Haziran", month: "Haziran" },
        { weekNumber: 27, dateRange: "9-14 Haziran", month: "Haziran" },
        { weekNumber: 28, dateRange: "15-20 Haziran", month: "Haziran" },
        { weekNumber: 29, dateRange: "21-26 Haziran", month: "Haziran" },
        // Temmuz
        { weekNumber: 30, dateRange: "27 Haziran - 2 Temmuz", month: "Temmuz" },
        { weekNumber: 31, dateRange: "3-8 Temmuz", month: "Temmuz" },
        { weekNumber: 32, dateRange: "9-14 Temmuz", month: "Temmuz" },
        { weekNumber: 33, dateRange: "15-20 Temmuz", month: "Temmuz" },
        { weekNumber: 34, dateRange: "21-26 Temmuz", month: "Temmuz" },
        // Ağustos
        { weekNumber: 35, dateRange: "27 Temmuz - 1 Ağustos", month: "Ağustos" },
        { weekNumber: 36, dateRange: "2-7 Ağustos", month: "Ağustos" },
        { weekNumber: 37, dateRange: "8-13 Ağustos", month: "Ağustos" },
        { weekNumber: 38, dateRange: "14-19 Ağustos", month: "Ağustos" },
        { weekNumber: 39, dateRange: "20-25 Ağustos", month: "Ağustos" },
        { weekNumber: 40, dateRange: "26-31 Ağustos", month: "Ağustos" },
        // Eylül - Summer period ends
        { weekNumber: 41, dateRange: "1-6 Eylül", month: "Eylül" },
        { weekNumber: 42, dateRange: "7-12 Eylül", month: "Eylül" },
        { weekNumber: 43, dateRange: "13-18 Eylül", month: "Eylül" },
        { weekNumber: 44, dateRange: "19-24 Eylül", month: "Eylül" },
        { weekNumber: 45, dateRange: "25-30 Eylül", month: "Eylül" },
        // Ekim
        { weekNumber: 46, dateRange: "1-6 Ekim", month: "Ekim" },
        { weekNumber: 47, dateRange: "7-12 Ekim", month: "Ekim" },
        { weekNumber: 48, dateRange: "13-18 Ekim", month: "Ekim" },
        { weekNumber: 49, dateRange: "19-24 Ekim", month: "Ekim" },
        { weekNumber: 50, dateRange: "25-30 Ekim", month: "Ekim" },
        // Kasım
        { weekNumber: 51, dateRange: "31 Ekim - 5 Kasım", month: "Kasım" },
        { weekNumber: 52, dateRange: "6-11 Kasım", month: "Kasım" },
        { weekNumber: 53, dateRange: "12-17 Kasım", month: "Kasım" },
        { weekNumber: 54, dateRange: "18-23 Kasım", month: "Kasım" },
        { weekNumber: 55, dateRange: "24-29 Kasım", month: "Kasım" },
        // Aralık
        { weekNumber: 56, dateRange: "30 Kasım - 5 Aralık", month: "Aralık" },
        { weekNumber: 57, dateRange: "6-11 Aralık", month: "Aralık" },
        { weekNumber: 58, dateRange: "12-17 Aralık", month: "Aralık" },
        { weekNumber: 59, dateRange: "18-23 Aralık", month: "Aralık" },
        { weekNumber: 60, dateRange: "24-29 Aralık", month: "Aralık" },
        { weekNumber: 61, dateRange: "30 Aralık - 4 Ocak", month: "Aralık" },
      ];
    }
    return [];
  }, [selectedYear]);

  // Summer leave periods (20 June - 8 September school closure period) - get data based on selected year
  const summerLeaveWeeks: SummerLeaveEntry[] = useMemo(() => {
    if (selectedYear === 2025) {
      return [
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
      ];
    } else if (selectedYear === 2026) {
      return [
        { weekNumber: 26, startDate: "05 Haziran", endDate: "10 Haziran", person1: "", person2: "", person3: "", person4: "", person5: "", approved: false },
        { weekNumber: 27, startDate: "11 Haziran", endDate: "16 Haziran", person1: "", person2: "", person3: "", person4: "", person5: "", approved: false },
        { weekNumber: 28, startDate: "17 Haziran", endDate: "22 Haziran", person1: "", person2: "", person3: "", person4: "", person5: "", approved: false },
        { weekNumber: 29, startDate: "23 Haziran", endDate: "28 Haziran", person1: "", person2: "", person3: "", person4: "", person5: "", approved: false },
        { weekNumber: 30, startDate: "29 Haziran", endDate: "04 Temmuz", person1: "", person2: "", person3: "", person4: "", person5: "", approved: false },
        { weekNumber: 31, startDate: "05 Temmuz", endDate: "10 Temmuz", person1: "", person2: "", person3: "", person4: "", person5: "", approved: false },
        { weekNumber: 32, startDate: "11 Temmuz", endDate: "16 Temmuz", person1: "", person2: "", person3: "", person4: "", person5: "", approved: false },
        { weekNumber: 33, startDate: "17 Temmuz", endDate: "22 Temmuz", person1: "", person2: "", person3: "", person4: "", person5: "", approved: false },
        { weekNumber: 34, startDate: "23 Temmuz", endDate: "28 Temmuz", person1: "", person2: "", person3: "", person4: "", person5: "", approved: false },
        { weekNumber: 35, startDate: "29 Temmuz", endDate: "03 Ağustos", person1: "", person2: "", person3: "", person4: "", person5: "", approved: false },
        { weekNumber: 36, startDate: "04 Ağustos", endDate: "09 Ağustos", person1: "", person2: "", person3: "", person4: "", person5: "", approved: false },
        { weekNumber: 37, startDate: "10 Ağustos", endDate: "15 Ağustos", person1: "", person2: "", person3: "", person4: "", person5: "", approved: false },
        { weekNumber: 38, startDate: "16 Ağustos", endDate: "21 Ağustos", person1: "", person2: "", person3: "", person4: "", person5: "", approved: false },
        { weekNumber: 39, startDate: "22 Ağustos", endDate: "27 Ağustos", person1: "", person2: "", person3: "", person4: "", person5: "", approved: false },
        { weekNumber: 40, startDate: "28 Ağustos", endDate: "02 Eylül", person1: "", person2: "", person3: "", person4: "", person5: "", approved: false },
        { weekNumber: 41, startDate: "03 Eylül", endDate: "08 Eylül", person1: "", person2: "", person3: "", person4: "", person5: "", approved: false },
        { weekNumber: 42, startDate: "09 Eylül", endDate: "14 Eylül", person1: "", person2: "", person3: "", person4: "", person5: "", approved: false },
        { weekNumber: 43, startDate: "15 Eylül", endDate: "20 Eylül", person1: "", person2: "", person3: "", person4: "", person5: "", approved: false },
        { weekNumber: 44, startDate: "21 Eylül", endDate: "26 Eylül", person1: "", person2: "", person3: "", person4: "", person5: "", approved: false },
        { weekNumber: 45, startDate: "27 Eylül", endDate: "02 Ekim", person1: "", person2: "", person3: "", person4: "", person5: "", approved: false },
      ];
    } else if (selectedYear === 2027) {
      return [
        { weekNumber: 26, startDate: "03 Haziran", endDate: "08 Haziran", person1: "", person2: "", person3: "", person4: "", person5: "", approved: false },
        { weekNumber: 27, startDate: "09 Haziran", endDate: "14 Haziran", person1: "", person2: "", person3: "", person4: "", person5: "", approved: false },
        { weekNumber: 28, startDate: "15 Haziran", endDate: "20 Haziran", person1: "", person2: "", person3: "", person4: "", person5: "", approved: false },
        { weekNumber: 29, startDate: "21 Haziran", endDate: "26 Hazinan", person1: "", person2: "", person3: "", person4: "", person5: "", approved: false },
        { weekNumber: 30, startDate: "27 Haziran", endDate: "02 Temmuz", person1: "", person2: "", person3: "", person4: "", person5: "", approved: false },
        { weekNumber: 31, startDate: "03 Temmuz", endDate: "08 Temmuz", person1: "", person2: "", person3: "", person4: "", person5: "", approved: false },
        { weekNumber: 32, startDate: "09 Temmuz", endDate: "14 Temmuz", person1: "", person2: "", person3: "", person4: "", person5: "", approved: false },
        { weekNumber: 33, startDate: "15 Temmuz", endDate: "20 Temmuz", person1: "", person2: "", person3: "", person4: "", person5: "", approved: false },
        { weekNumber: 34, startDate: "21 Temmuz", endDate: "26 Temmuz", person1: "", person2: "", person3: "", person4: "", person5: "", approved: false },
        { weekNumber: 35, startDate: "27 Temmuz", endDate: "01 Ağustos", person1: "", person2: "", person3: "", person4: "", person5: "", approved: false },
        { weekNumber: 36, startDate: "02 Ağustos", endDate: "07 Ağustos", person1: "", person2: "", person3: "", person4: "", person5: "", approved: false },
        { weekNumber: 37, startDate: "08 Ağustos", endDate: "13 Ağustos", person1: "", person2: "", person3: "", person4: "", person5: "", approved: false },
        { weekNumber: 38, startDate: "14 Ağustos", endDate: "19 Ağustos", person1: "", person2: "", person3: "", person4: "", person5: "", approved: false },
        { weekNumber: 39, startDate: "20 Ağustos", endDate: "25 Ağustos", person1: "", person2: "", person3: "", person4: "", person5: "", approved: false },
        { weekNumber: 40, startDate: "26 Ağustos", endDate: "31 Ağustos", person1: "", person2: "", person3: "", person4: "", person5: "", approved: false },
        { weekNumber: 41, startDate: "01 Eylül", endDate: "06 Eylül", person1: "", person2: "", person3: "", person4: "", person5: "", approved: false },
        { weekNumber: 42, startDate: "07 Eylül", endDate: "12 Eylül", person1: "", person2: "", person3: "", person4: "", person5: "", approved: false },
        { weekNumber: 43, startDate: "13 Eylül", endDate: "18 Eylül", person1: "", person2: "", person3: "", person4: "", person5: "", approved: false },
        { weekNumber: 44, startDate: "19 Eylül", endDate: "24 Eylül", person1: "", person2: "", person3: "", person4: "", person5: "", approved: false },
        { weekNumber: 45, startDate: "25 Eylül", endDate: "30 Eylül", person1: "", person2: "", person3: "", person4: "", person5: "", approved: false },
      ];
    }
    return [];
  }, [selectedYear]);

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

  // Update summer leave data when year changes
  useEffect(() => {
    setSummerLeaveData(summerLeaveWeeks);
  }, [summerLeaveWeeks]);

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

    // Check summer leave data (block duplicate selections within the same week)
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

  // Helper functions for card highlighting
  const getPilotCountForWeek = (week: AnnualLeaveEntry): number => {
    return [week.person1, week.person2, week.person3, week.person4]
      .filter(p => p !== '' && p !== '*').length;
  };

  const getCardBackgroundColor = (pilotCount: number): string => {
    if (pilotCount <= 3 && pilotCount > 0) return "#f0fdf4";
    if (pilotCount === 4) return "#fef2f2";
    return "white";
  };

  const getCardBorderColor = (pilotCount: number): string => {
    if (pilotCount <= 3 && pilotCount > 0) return "#bbf7d0";
    if (pilotCount === 4) return "#fecaca";
    return "#e5e7eb";
  };

  const getPilotCountForSummerWeek = (week: SummerLeaveEntry): number => {
    return [week.person1, week.person2, week.person3, week.person4, week.person5]
      .filter(p => p !== '' && p !== '*').length;
  };

  // Save functions with single-source rule between annual/summer
  const handleSaveAnnualLeave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const updatePromises: Promise<any>[] = [];
      const leaveEntries: Omit<LeaveEntry, 'id' | 'createdAt' | 'updatedAt'>[] = [];

      for (const week of annualLeaveData) {
        const pilots = [week.person1, week.person2, week.person3, week.person4]
          .map(p => (p === '*' ? '' : p));

        if (pilots.length === 0) {
          // Clear annual only (summer kalabilir)
          updatePromises.push(
            LeaveService.deleteLeaveByWeekAndYear(week.weekNumber, selectedYear, 'annual')
          );
        } else {
          // Upsert annual...
          leaveEntries.push({
            weekNumber: week.weekNumber,
            startDate: week.dateRange.split('-')[0].trim(),
            endDate: week.dateRange.split('-')[1]?.trim() || week.dateRange,
            year: selectedYear,
            month: week.month,
            pilots,
            approved: true,
            type: 'annual' as const
          });
          // ...ve aynı haftanın summer kaydını sil (tek kaynak kuralı)
          updatePromises.push(
            LeaveService.deleteLeaveByWeekAndYear(week.weekNumber, selectedYear, 'summer')
          );
        }
      }

      // Execute all deletes
      await Promise.all(updatePromises);

      // Batch upsert all leave entries
      if (leaveEntries.length > 0) {
        await LeaveService.batchUpsertLeaves(leaveEntries);
      }

      showSuccess(`📋 Yıllık izin verileri kaydedildi! (${leaveEntries.length} kayıt güncellendi)`);
    } catch (error) {
      console.error('Error saving annual leave data:', error);
      showError('Yıllık izin verileri kaydedilirken hata oluştu!');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSummerLeave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const updatePromises: Promise<any>[] = [];
      const leaveEntries: Omit<LeaveEntry, 'id' | 'createdAt' | 'updatedAt'>[] = [];

      for (const week of summerLeaveData) {
        const pilots = [week.person1, week.person2, week.person3, week.person4, week.person5]
          .map(p => (p === '*' ? '' : p));

        if (pilots.length === 0) {
          // Clear summer only
          updatePromises.push(
            LeaveService.deleteLeaveByWeekAndYear(week.weekNumber, selectedYear, 'summer')
          );
        } else {
          // Upsert summer
          leaveEntries.push({
            weekNumber: week.weekNumber,
            startDate: week.startDate,
            endDate: week.endDate,
            year: selectedYear,
            month: getMonthFromDate(week.startDate),
            pilots,
            approved: week.approved,
            type: 'summer' as const
          });

          // Eğer summer onaylıysa, aynı haftanın annual kaydını sil (tek kaynak kuralı)
          if (week.approved) {
            updatePromises.push(
              LeaveService.deleteLeaveByWeekAndYear(week.weekNumber, selectedYear, 'annual')
            );
          }
        }
      }

      // Execute all deletes
      await Promise.all(updatePromises);

      // Batch upsert all leave entries
      if (leaveEntries.length > 0) {
        await LeaveService.batchUpsertLeaves(leaveEntries);
      }

      showSuccess(`🏖️ Yaz izni verileri kaydedildi! (${leaveEntries.length} kayıt güncellendi)`);
    } catch (error) {
      console.error('Error saving summer leave data:', error);
      showError('Yaz izni verileri kaydedilirken hata oluştu!');
    } finally {
      setSaving(false);
    }
  };

  // Helper function to extract month from date string
  const getMonthFromDate = (dateStr: string): string => {
    const monthNames = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    const month = dateStr.split(' ')[1];
    return monthNames.find(m => m === month) || 'Bilinmiyor';
  };

  // Load data from Firestore
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [captainsData, leavesData] = await Promise.all([
        CaptainService.getAllCaptains(),
        LeaveService.getLeavesByYear(selectedYear)
      ]);

      setCaptains(captainsData);

      // Split by type
      const annualLeaves = leavesData.filter(l => l.type === 'annual');
      const summerLeaves = leavesData.filter(l => l.type === 'summer');

      // Yıl içinde annual'ı olan haftaları set'e al (tek kaynak önceliği)
      const annualWeeksWithData = new Set(
        annualLeaves.filter(l => (l.pilots?.length ?? 0) > 0).map(l => l.weekNumber)
      );

      // Annual UI'yi doldur
      const updatedAnnualData = leaveWeeksData.map(week => {
        const existingLeave = annualLeaves.find(l => l.weekNumber === week.weekNumber);
        return {
          weekNumber: week.weekNumber,
          dateRange: week.dateRange,
          month: week.month,
          person1: existingLeave?.pilots[0] || '',
          person2: existingLeave?.pilots[1] || '',
          person3: existingLeave?.pilots[2] || '',
          person4: existingLeave?.pilots[3] || ''
        };
      });
      setAnnualLeaveData(updatedAnnualData);

      // Summer UI'yi doldur (annual varsa aynı hafta summer'ı ekranda boş göster)
      const updatedSummerData = summerLeaveWeeks.map(week => {
        if (annualWeeksWithData.has(week.weekNumber)) {
          return {
            ...week,
            person1: '',
            person2: '',
            person3: '',
            person4: '',
            person5: '',
            approved: false
          };
        }
        const existingLeave = summerLeaves.find(l => l.weekNumber === week.weekNumber);
        if (existingLeave) {
          return {
            ...week,
            person1: existingLeave.pilots[0] || '',
            person2: existingLeave.pilots[1] || '',
            person3: existingLeave.pilots[2] || '',
            person4: existingLeave.pilots[3] || '',
            person5: existingLeave.pilots[4] || '',
            approved: existingLeave.approved
          };
        }
        return week;
      });
      setSummerLeaveData(updatedSummerData);

    } catch (error) {
      console.error('Error loading leave data:', error);
      showError('İzin verileri yüklenirken hata oluştu!');
    } finally {
      setLoading(false);
    }
  }, [selectedYear, showError, leaveWeeksData, summerLeaveWeeks]);

  // Load captains and leave data from Firestore
  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
        {/* Header */}
        <header style={{ backgroundColor: "#1f2937", color: "white", padding: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h1 style={{ fontSize: "18px", fontWeight: "600", textAlign: "center", lineHeight: "1.3", flex: 1 }}>
              İzin Yönetim Paneli
            </h1>
            {onBack && (
              <button
                onClick={onBack}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  color: "white",
                  fontSize: "14px",
                  cursor: "pointer",
                  padding: "8px",
                  whiteSpace: "nowrap",
                }}
              >
                ← Ana Sayfa
              </button>
            )}
          </div>
        </header>

        {/* Loading Content */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 20px",
          backgroundColor: "white",
          margin: "20px",
          borderRadius: "12px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}>
          <div style={{
            fontSize: "16px",
            color: "#6b7280",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}>
            <div style={{
              width: "20px",
              height: "20px",
              border: "2px solid #e5e7eb",
              borderTop: "2px solid #1f2937",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }} />
            İzin verileri yükleniyor...
          </div>
        </div>

        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      {/* Header */}
      <header style={{ backgroundColor: "#1f2937", color: "white", padding: "16px" }}>
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

      {/* Year Tabs */}
      <div style={{ padding: "16px 16px 0 16px" }}>
        <div style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "16px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          marginBottom: "16px"
        }}>
          <div style={{
            display: "flex",
            gap: "8px",
            justifyContent: "center",
            flexWrap: "wrap"
          }}>
            {[2025, 2026, 2027].map(year => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                style={{
                  padding: "12px 24px",
                  fontSize: "14px",
                  fontWeight: "600",
                  borderRadius: "8px",
                  border: "2px solid #e5e7eb",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  backgroundColor: selectedYear === year ? "#059669" : "white",
                  color: selectedYear === year ? "white" : "#374151",
                  minWidth: "120px"
                }}
                onMouseOver={(e) => {
                  if (selectedYear !== year) {
                    (e.target as HTMLElement).style.backgroundColor = "#eff6ff";
                    (e.target as HTMLElement).style.borderColor = "#bfdbfe";
                  }
                }}
                onMouseOut={(e) => {
                  if (selectedYear !== year) {
                    (e.target as HTMLElement).style.backgroundColor = "white";
                    (e.target as HTMLElement).style.borderColor = "#e5e7eb";
                  }
                }}
              >
                {year} Yılı
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Person Selection */}
      <div style={{ padding: "0 16px" }}>
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
              {captains.filter(captain => captain.isim.trim() !== "").map(captain => (
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
              📅 {selectedYear} Yılı Önemli Tarihler
            </h3>
            <div style={{ color: "#1e40af", fontSize: "13px", lineHeight: "1.5" }}>
              {selectedYear === 2025 && (
                <>
                  <div style={{ marginBottom: "4px" }}>
                    <strong>Ramazan Bayramı:</strong> 30 Mart - 1 Nisan
                  </div>
                  <div style={{ marginBottom: "4px" }}>
                    <strong>Kurban Bayramı:</strong> 6 - 9 Haziran
                  </div>
                  <div>
                    <strong>Yaz Tatili:</strong> 20 Haziran - 8 Eylül
                  </div>
                </>
              )}
              {selectedYear === 2026 && (
                <>
                  <div style={{ marginBottom: "4px" }}>
                    <strong>Ramazan Bayramı:</strong> 20 Mart - 22 Mart
                  </div>
                  <div style={{ marginBottom: "4px" }}>
                    <strong>Kurban Bayramı:</strong> 27 Mayıs - 30 Mayıs
                  </div>
                  <div>
                    <strong>Yaz Tatili:</strong> 27 Haziran - 7 Eylül
                  </div>
                </>
              )}
              {selectedYear === 2027 && (
                <>
                  <div style={{ marginBottom: "4px" }}>
                    <strong>Ramazan Bayramı:</strong> 9 Mart - 11 Mart
                  </div>
                  <div style={{ marginBottom: "4px" }}>
                    <strong>Kurban Bayramı:</strong> 16 Mayıs - 19 Mayıs
                  </div>
                  <div>
                    <strong>Yaz Tatili:</strong> 19 Haziran - 6 Eylül
                  </div>
                </>
              )}
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
                📋 {selectedYear} YILI İZİN PLANLAMASI
              </h2>
              <button
                onClick={handleSaveAnnualLeave}
                disabled={saving}
                style={{
                  backgroundColor: saving ? "#9ca3af" : "#1e40af",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: saving ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  opacity: saving ? 0.7 : 1
                }}
                onMouseOver={(e) => {
                  if (!saving) {
                    (e.target as HTMLElement).style.backgroundColor = "#1d4ed8";
                  }
                }}
                onMouseOut={(e) => {
                  if (!saving) {
                    (e.target as HTMLElement).style.backgroundColor = "#1e40af";
                  }
                }}
              >
                {saving ? "⏳ Kaydediliyor..." : "💾 Yıllık İzin Kaydet"}
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
              {currentMonth === "Tümü" ? "📅 TÜM AYLAR" : `📅 ${currentMonth.toUpperCase()} ${selectedYear}`}
            </div>

            {/* Annual Leave Table - Mobile Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {getFilteredAnnualData().map(week => {
                const pilotCount = getPilotCountForWeek(week);
                return (
                <div key={week.weekNumber} style={{
                  backgroundColor: getCardBackgroundColor(pilotCount),
                  borderRadius: "8px",
                  border: `1px solid ${getCardBorderColor(pilotCount)}`,
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
                            {captains.filter(captain => captain.isim.trim() !== "").map(captain => (
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
                );
              })}
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
                🏖️ {selectedYear} YAZ DÖNEMİ İZİN TALEP ÇİZELGESİ
              </h2>
              <button
                onClick={handleSaveSummerLeave}
                disabled={saving}
                style={{
                  backgroundColor: saving ? "#9ca3af" : "#dc2626",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: saving ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  opacity: saving ? 0.7 : 1
                }}
                onMouseOver={(e) => {
                  if (!saving) {
                    (e.target as HTMLElement).style.backgroundColor = "#b91c1c";
                  }
                }}
                onMouseOut={(e) => {
                  if (!saving) {
                    (e.target as HTMLElement).style.backgroundColor = "#dc2626";
                  }
                }}
              >
                {saving ? "⏳ Kaydediliyor..." : "💾 Yaz İzinleri Kaydet"}
              </button>
            </div>

            {/* Summer Leave Cards - Responsive Grid Layout */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "10px"
            }}>
              {summerLeaveData.map(week => {
                const pilotCount = getPilotCountForSummerWeek(week);
                return (
                <div key={week.weekNumber} style={{
                  backgroundColor: getCardBackgroundColor(pilotCount),
                  borderRadius: "8px",
                  border: `1px solid ${getCardBorderColor(pilotCount)}`,
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
                            {captains.filter(captain => captain.isim.trim() !== "").map(captain => (
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
                        {captains.filter(captain => captain.isim.trim() !== "").map(captain => (
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
                );
              })}
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
