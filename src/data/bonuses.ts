export interface BonusItem {
  id: number;
  type: string;
  date: string;
  compareDate: Date; // Algoritmik karşılaştırmalar için referans tarih
}

export const bonuses: BonusItem[] = [
  // 2026 YILI SENDİKA İKRAMİYE TARİHLERİ
  { 
    id: 1, 
    type: "Sendika - 1", 
    date: "16 Ocak 2026", 
    compareDate: new Date(2026, 0, 16) 
  },
  { 
    id: 2, 
    type: "Sendika - 2", 
    date: "18 Nisan 2026", 
    compareDate: new Date(2026, 3, 18) 
  },
  { 
    id: 3, 
    type: "Sendika - 3", 
    date: "18 Temmuz 2026", 
    compareDate: new Date(2026, 6, 18) 
  },
  { 
    id: 4, 
    type: "Sendika - 4", 
    date: "05 Eylül 2026", 
    compareDate: new Date(2026, 8, 5) 
  },

  // 2026 YILI DEVLET İKRAMİYELERİ (BEKLENEN)
  { 
    id: 5, 
    type: "Devlet - 1", 
    date: "Ocak 2026 son haftası", 
    compareDate: new Date(2026, 0, 26) 
  },
  { 
    id: 6, 
    type: "Devlet - 2", 
    date: "Mart 2026 son haftası", 
    compareDate: new Date(2026, 2, 26) 
  },
  { 
    id: 7, 
    type: "Devlet - 3", 
    date: "Haziran 2026 başı", 
    compareDate: new Date(2026, 5, 1) 
  },
  { 
    id: 8, 
    type: "Devlet - 4", 
    date: "Aralık 2026 ortası", 
    compareDate: new Date(2026, 11, 15) 
  },
];

/**
 * Ana sayfada bugünden sonraki en yakın ikramiyeyi döndüren fonksiyon.
 * Karşılaştırma için compareDate alanını kullanır.
 */
export const getNextUpcomingBonus = (): BonusItem | null => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingBonuses = bonuses
    .filter(bonus => bonus.compareDate >= today)
    .sort((a, b) => a.compareDate.getTime() - b.compareDate.getTime());

  return upcomingBonuses.length > 0 ? upcomingBonuses[0] : null;
};
