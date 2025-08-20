export interface BonusItem {
  id: number;
  type: string;
  date: string;
}

export const bonuses: BonusItem[] = [
  // 2025 İkramiyeleri
  { id: 1, type: "Devlet - 1", date: "24 Ocak 2025" },
  { id: 2, type: "Devlet - 2", date: "24 Mart 2025" },
  { id: 3, type: "Devlet - 3", date: "02 Haziran 2025" },
  { id: 4, type: "Devlet - 4", date: "17 Aralık 2025" },
  { id: 5, type: "Sendika - 1", date: "30 Ocak 2025" },
  { id: 6, type: "Sendika - 2", date: "26 Nisan 2025" },
  { id: 7, type: "Sendika - 3", date: "7 Ağustos 2025" },
  { id: 8, type: "Sendika - 4", date: "06 Eylül 2025" },
  // 2026 İkramiyeleri
  { id: 9, type: "Devlet - 1", date: "2026 (Tarih Bekleniyor)" },
  { id: 10, type: "Devlet - 2", date: "2026 (Tarih Bekleniyor)" },
  { id: 11, type: "Devlet - 3", date: "2026 (Tarih Bekleniyor)" },
  { id: 12, type: "Devlet - 4", date: "2026 (Tarih Bekleniyor)" },
  { id: 13, type: "Sendika - 1", date: "2026 (Tarih Bekleniyor)" },
  { id: 14, type: "Sendika - 2", date: "2026 (Tarih Bekleniyor)" },
  { id: 15, type: "Sendika - 3", date: "2026 (Tarih Bekleniyor)" },
  { id: 16, type: "Sendika - 4", date: "2026 (Tarih Bekleniyor)" },
];

export const getNextUpcomingBonus = (): BonusItem | null => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingBonuses = bonuses
    .filter(bonus => {
      if (bonus.date.includes("(Tarih Bekleniyor)")) {
        return false; // 2026 ikramiyelerini şimdilik hariç tutuyoruz
      }
      
      const [day, month, year] = bonus.date.split(" ");
      const months = [
        "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
        "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
      ];
      const monthIndex = months.indexOf(month);
      const bonusDate = new Date(parseInt(year), monthIndex, parseInt(day));
      
      return bonusDate >= today;
    })
    .sort((a, b) => {
      const getDateFromString = (dateStr: string) => {
        const [day, month, year] = dateStr.split(" ");
        const months = [
          "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
          "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
        ];
        const monthIndex = months.indexOf(month);
        return new Date(parseInt(year), monthIndex, parseInt(day));
      };
      
      return getDateFromString(a.date).getTime() - getDateFromString(b.date).getTime();
    });

  return upcomingBonuses.length > 0 ? upcomingBonuses[0] : null;
};