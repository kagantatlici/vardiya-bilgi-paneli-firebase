# 🚢 Vardiya Bilgi Paneli

İstanbul Boğazı kılavuz pilotlarının vardiya ve izin yönetimi için geliştirilmiş modern web uygulaması.

## 🌟 Özellikler

### 📋 **Kılavuz Kaptan Yönetimi**
- Pilot bilgileri ve sertifika takibi
- Melbusat (üniforma) beden bilgileri
- Aktif/pasif durum yönetimi
- Firestore real-time senkronizasyon

### 📅 **Vardiya Takvimi**
- 2025-2027 arası tüm vardiya programı
- Haftanın başlangıcı Pazartesi
- Güncel vardiya bilgisi gösterimi
- Responsive mobil tasarım

### 🏖️ **İzin Yönetimi**
- Yıllık izin planlaması
- Yaz dönemi izin talepçizelgesi
- **Akıllı renk kodlaması:**
  - 🟢 **Yeşil**: ≤3 pilot izinde (güvenli seviye)
  - 🔴 **Kırmızı**: 4 pilot izinde (uyarı seviyesi)
- Real-time izin sayısı takibi

### 📊 **Ana Sayfa Dashboard**
- Güncel vardiya bilgileri
- İzindeki/görevdeki pilot sayıları
- Dinamik Firestore veri entegrasyonu
- Önemli tarihler (bayram, tatil)

### 📄 **Protokol Görüntüleyici**
- Vardiya protokol maddelerini görüntüleme
- Arama ve filtreleme özellikleri

## 🛠️ Teknoloji Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Hosting**: Firebase Hosting
- **Styling**: Inline CSS (responsive design)
- **State Management**: React Hooks (useState, useEffect, useCallback)

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+
- npm veya yarn
- Firebase CLI

### Local Development

```bash
# Repository'yi klonlayın
git clone https://github.com/kagantatlici/vardiya-bilgi-paneli-firebase.git
cd vardiya-bilgi-paneli-firebase

# Bağımlılıkları yükleyin
npm install

# Firebase config dosyasını ayarlayın
# src/config/firebase.ts dosyasında Firebase ayarlarını güncelleyin

# Development server'ı başlatın
npm run dev
```

### Production Build

```bash
# Production build
npm run build

# Firebase'e deploy
firebase deploy
```

## 📁 Proje Yapısı

```
src/
├── components/           # React bileşenleri
│   ├── MainScreen.tsx   # Ana dashboard
│   ├── CaptainInfoTable.tsx # Pilot yönetimi
│   ├── LeaveManagement.tsx  # İzin yönetimi
│   ├── ShiftCalendar.tsx    # Vardiya takvimi
│   └── ...
├── services/            # Firebase servisleri
│   └── database.ts      # Firestore CRUD işlemleri
├── hooks/              # Custom React hooks
├── data/               # Static data (fallback)
└── config/             # Firebase configuration
```

## 🎯 Temel Kullanım

1. **Ana Sayfa**: Güncel vardiya ve izin durumunu görüntüleyin
2. **Kılavuz Kaptan Bilgileri**: Pilot bilgilerini düzenleyin
3. **İzin Sayfası**: Yıllık ve yaz izinlerini planlayın
4. **Vardiya Takvimi**: Gelecek vardiya programını görüntüleyin

## 🔥 Firebase Yapılandırması

### Firestore Collections:
- `captains` - Pilot bilgileri
- `leaves` - İzin kayıtları
- `shifts` - Vardiya verileri

### Firestore Indexes:
- `leaves` collection için compound index: `year + weekNumber`

## 🎨 Tasarım Özellikleri

- **Responsive Design**: Mobil ve desktop uyumlu
- **Color Coding**: İzin seviyelerine göre renk kodlaması
- **Real-time Updates**: Anlık veri senkronizasyonu
- **Loading States**: Kullanıcı dostu yükleme göstergeleri
- **Error Handling**: Kapsamlı hata yönetimi

## 📱 Desteklenen Platformlar

- ✅ Desktop (Chrome, Firefox, Safari, Edge)
- ✅ Mobile (iOS Safari, Android Chrome)
- ✅ Tablet (iPad, Android tablet)

## 🔧 Development

### Önemli Komutlar

```bash
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Code linting
firebase deploy      # Deploy to Firebase
```

### Code Quality
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Git hooks with pre-commit

## 🌐 Canlı Demo

**🔗 Production URL**: [https://istanbul-bogazi-pilot-panel.web.app](https://istanbul-bogazi-pilot-panel.web.app)

## 📝 Changelog

### v2.0.0 (Ocak 2025)
- ✅ Firestore entegrasyonu tamamlandı
- ✅ İzin kartlarına renk kodlaması eklendi
- ✅ Real-time veri senkronizasyonu
- ✅ Gelişmiş upsert operasyonları
- ✅ Ana sayfa dinamik veri gösterimi

### v1.0.0 (Ağustos 2024)
- ✅ İlk sürüm tamamlandı
- ✅ Temel CRUD işlemleri
- ✅ Vardiya takvimi entegrasyonu
- ✅ İzin yönetimi sistemi

## 👥 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit atın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje [MIT License](LICENSE) altında lisanslanmıştır.

## 📞 İletişim

**Proje Geliştiricisi**: Kağan TATLICI
- GitHub: [@kagantatlici](https://github.com/kagantatlici)

---

*🤖 Bu proje [Claude Code](https://claude.ai/code) ile geliştirilmiştir.*