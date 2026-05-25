import { useEffect, useState } from 'react';
import { CaptainService } from '../services/database';

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
            
            if (existingCaptains.length === 0) {
              // DİKKAT: migrateAllData() çağrısı güvenlik nedeniyle iptal edilmiştir.
              // Eğer veritabanı boşsa manuel olarak işlem yapılmalıdır.
              // await migrateAllData();
              
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