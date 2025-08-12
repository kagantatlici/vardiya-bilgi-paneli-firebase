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
        // First, mark as initialized immediately for fast UI
        if (mounted) {
          setIsInitialized(true);
        }

        // Then check and migrate in background
        setTimeout(async () => {
          try {
            const existingCaptains = await CaptainService.getAllCaptains();
            
            if (existingCaptains.length === 0 && mounted) {
              // No data exists, run full migration silently in background
              await migrateAllData();
            }
          } catch (error) {
            // Silent error - don't break the UI
          }
        }, 0);
        
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