import { useEffect, useState } from 'react';
import { CaptainService } from '../services/database';
import { migrateAllData } from '../scripts/migrate-data';

export function useAutoMigration() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeDatabase = async () => {
      try {
        // Check if data already exists
        const existingCaptains = await CaptainService.getAllCaptains();
        
        if (existingCaptains.length === 0 && mounted) {
          // No data exists, run migration silently
          await migrateAllData();
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