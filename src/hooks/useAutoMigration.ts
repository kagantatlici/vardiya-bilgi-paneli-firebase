import { useEffect, useState } from 'react';
import { CaptainService, ShiftService } from '../services/database';
import { migrateAllData } from '../scripts/migrate-data';
import { clearAndRemigrate } from '../scripts/clear-and-remigrate';

export function useAutoMigration() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeDatabase = async () => {
      try {
        // Check if data already exists
        const existingCaptains = await CaptainService.getAllCaptains();
        const existingShifts = await ShiftService.getAllShifts();
        
        if (existingCaptains.length === 0 && mounted) {
          // No data exists, run full migration silently
          await migrateAllData();
        } else if (existingShifts.length < 1000 && mounted) {
          // Incomplete shift data, run full shift migration
          await clearAndRemigrate();
        }
        
        if (mounted) {
          setIsInitialized(true);
        }
      } catch {
        if (mounted) {
          setHasError(true);
          setIsInitialized(true);
        }
      }
    };

    initializeDatabase();

    return () => {
      mounted = false;
    };
  }, []);

  return { isInitialized, hasError };
}