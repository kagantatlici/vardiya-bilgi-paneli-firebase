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

## 🔐 AdminKey, Audit ve Geri Al (Revert)

- Uygulama kimlik doğrulaması istemez; değişiklikler anında yayına alınır.
- Yönetici yetkileri cihaz bazında `adminKey` ile etkinleşir.

### Admin etkinleştirme (desktop ve telefon)
- Tek seferlik gizli bağlantıyı açın: `/admin/link?k=<adminKey>`
  - Örnek: `https://<site-domain>/admin/link?k=RANDOM_UZUN_ANAHTAR`
  - Bu sayfa `localStorage.adminKey` değerini yazar, Firestore `settings/admin` belgesine anahtarı kaydeder ve “Admin etkin” gösterir.
  - Aynı cihazda tekrar giriş gerekmez; admin kontrolleri görünür olur.

### Admin anahtarını döndürme (rotate)
- Firestore `settings/admin` belgesine yeni uzun rastgele bir anahtar yazın (`adminKey` alanı).
- Güvenilen cihazlarda yeni bağlantıyı tekrar ziyaret edin: `/admin/link?k=<newAdminKey>`
- Eski anahtarı bilenler artık geri alma işlemine yetkili olmaz.

### Audit kaydı (ekleme/güncelleme/yumuşak silme)
- Her izin veya pilot bilgi değişikliğinde şu veriler kaydedilir:
  - `ts` (sunucu saati), `clientTs` (cihaz saati)
  - `changeType`: `create | update | soft_delete | reverted`
  - `actorName`: formdaki serbest metin (kimlik doğrulama yok)
  - `changedFields`: sadece alan adları (değerler yok)
  - `prevSnapshot`: önceki belgenin tam görüntüsü (geri alma için)
  - `humanLine`: Türkçe, değerler gizlenmiş özet satır
- Audit alt koleksiyonu: `leaves/{id}/audit/{autoId}` ve `captains/{id}/audit/{autoId}` (eklemeli, değiştirilemez/silinez)

### Geri Al (admin)
- Her audit satırında (sadece admin görünür) küçük “Geri Al” butonu bulunur.
- Buton, callable Cloud Function `revertLeave(auditPath)` fonksiyonunu çağırır.
- Sunucu, `settings/admin.adminKey` ile eşitliği doğrular; eşleşirse `prevSnapshot` canlı dökümana yazılır ve `reverted` türünde yeni bir audit satırı eklenir.

### Güvenlik Kuralları (özet)
- Sert silme yok: `allow delete: if false;`
- Kimlik/hafta/slot alanları değiştirilemez (yalnızca beyaz listeli alanlar değiştirilebilir).
- Audit alt koleksiyonları sadece `create` izni verir (eklemeli günlük).

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
