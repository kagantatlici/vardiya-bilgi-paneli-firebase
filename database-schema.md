# Database Schema Design - Vardiya Bilgi Paneli

## Firestore Collections Structure

### 1. `captains` Collection
```typescript
interface Captain {
  id: string;                    // Firestore document ID
  sicilNo: string;              // Registry number
  isim: string;                 // Full name
  aisMobNo: string;             // AIS-MOB number
  aktifEhliyetler: string[];    // Active licenses ["İst", "Çkl", etc.]
  tumEhliyetler: {              // All licenses (boolean flags)
    istanbul: boolean;
    canakkale: boolean;
    hpasa: boolean;
    kepez: boolean;
    izmir: boolean;
    mersin: boolean;
    zonguldak: boolean;
  };
  melbusat: {                   // Uniform sizes
    pantolon: string;
    gomlek: string;
    tshirt: string;
    yelek: string;
    polar: string;
    mont: string;
    ayakkabi: string;
  };
  durum: "Aktif" | "Pasif";     // Status
  siraNo: number;               // Order position for drag & drop
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 2. `leaves` Collection  
```typescript
interface LeaveEntry {
  id: string;                   // Firestore document ID
  weekNumber: number;           // Week number in year
  startDate: string;            // Start date (DD MMM format)
  endDate: string;              // End date (DD MMM format)
  year: number;                 // 2025, 2026, etc.
  month: string;                // "Ağustos", "Eylül", etc.
  pilots: string[];             // Array of pilot names on leave
  approved: boolean;            // Approval status
  type: "summer" | "annual";    // Leave type
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 3. `shifts` Collection
```typescript
interface ShiftData {
  id: string;                   // Firestore document ID (date format: YYYY-MM-DD)
  date: string;                 // "2025-08-15"
  shiftNumber: number;          // 38, 39, etc.
  year: number;                 // 2025
  month: number;                // 8 (August)
  day: number;                  // 15
}
```

### 4. `system_config` Collection
```typescript
interface SystemConfig {
  id: string;                   // Document ID: "general"
  totalCaptainSlots: number;    // 28
  activeCaptainCount: number;   // Calculated from captains
  currentShift: {
    number: number;
    startDate: string;
    endDate: string;
  };
  lastUpdated: Timestamp;
}
```

## Migration Strategy

1. **Phase 1:** Create collections with existing data
2. **Phase 2:** Update components to read from Firestore
3. **Phase 3:** Add real-time updates
4. **Phase 4:** Add CRUD operations

## Database Rules (Security)

- Read access: Allow all (public app)
- Write access: Allow all (for now, add auth later)
- Future: Add admin authentication for write operations