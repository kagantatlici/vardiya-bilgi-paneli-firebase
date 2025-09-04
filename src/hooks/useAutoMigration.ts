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

        // Check if migration has already been run before
        const migrationFlag = localStorage.getItem('firebase-migration-completed');
        
        // Only run migration if it has never been run before
        if (!migrationFlag && mounted) {
          try {
            const existingCaptains = await CaptainService.getAllCaptains();
            
            // Only migrate if truly no data exists AND migration never ran
            if (existingCaptains.length === 0) {
              await migrateAllData();
              // Mark migration as completed so it never runs again
              localStorage.setItem('firebase-migration-completed', 'true');
            } else {
              // Data exists, mark migration as completed
              localStorage.setItem('firebase-migration-completed', 'true');
            }
          } catch (error) {
            // Silent error - don't break the UI
          }
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