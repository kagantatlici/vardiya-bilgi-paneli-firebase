import React, { useState } from 'react';
import { migrateAllData } from '../scripts/migrate-data';

interface MigrationUtilityProps {
  onBack: () => void;
}

const MigrationUtility: React.FC<MigrationUtilityProps> = ({ onBack }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasError, setHasError] = useState(false);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runMigration = async () => {
    setIsLoading(true);
    setLogs([]);
    setIsCompleted(false);
    setHasError(false);

    // Override console.log to capture migration logs
    const originalLog = console.log;
    const originalError = console.error;
    
    console.log = (message: string) => {
      addLog(message);
      originalLog(message);
    };
    
    console.error = (message: string) => {
      addLog(`ERROR: ${message}`);
      originalError(message);
    };

    try {
      addLog('🚀 Migration başlatılıyor...');
      await migrateAllData();
      addLog('✅ Migration başarıyla tamamlandı!');
      setIsCompleted(true);
    } catch (error) {
      addLog(`❌ Migration hatası: ${error}`);
      setHasError(true);
    } finally {
      setIsLoading(false);
      // Restore original console methods
      console.log = originalLog;
      console.error = originalError;
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      {/* Header */}
      <header style={{ backgroundColor: "#7e22ce", color: "white", padding: "16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", gap: "8px" }}>
          <button
            onClick={onBack}
            style={{
              backgroundColor: "transparent",
              border: "none",
              color: "white",
              fontSize: "14px",
              cursor: "pointer",
              padding: "8px",
              whiteSpace: "nowrap",
            }}
          >
            ← Ana Sayfa
          </button>
          <h1 style={{ 
            fontSize: "16px", 
            fontWeight: "600", 
            textAlign: "center", 
            margin: 0,
            lineHeight: "1.2"
          }}>
            Database Migration Utility
          </h1>
          <div />
        </div>
      </header>

      <div style={{ padding: "20px" }}>
        {/* Migration Control */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "20px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}>
          <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}>
            Veri Migration İşlemi
          </h2>
          <p style={{ color: "#6b7280", marginBottom: "16px" }}>
            Bu araç mevcut verilerinizi Firebase Firestore veritabanına aktarır.
          </p>
          
          <div style={{ marginBottom: "16px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}>
              Aktarılacak Veriler:
            </h3>
            <ul style={{ fontSize: "14px", color: "#6b7280", margin: "0", paddingLeft: "20px" }}>
              <li>Kılavuz Kaptan Bilgileri (28 kayıt)</li>
              <li>Yaz İzin Planlaması (Ağustos-Eylül 2025)</li>
              <li>Vardiya Takvimi Verileri</li>
            </ul>
          </div>

          <button
            onClick={runMigration}
            disabled={isLoading || isCompleted}
            style={{
              backgroundColor: isCompleted ? "#10b981" : isLoading ? "#6b7280" : "#1e40af",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "12px 24px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: isLoading || isCompleted ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            {isLoading && <span>⏳</span>}
            {isCompleted && <span>✅</span>}
            {hasError && <span>❌</span>}
            {isLoading ? "Migration Çalışıyor..." : 
             isCompleted ? "Migration Tamamlandı" : 
             hasError ? "Migration Hatası" : 
             "Migration Başlat"}
          </button>
        </div>

        {/* Migration Logs */}
        {logs.length > 0 && (
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>
            <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px" }}>
              Migration Logları
            </h3>
            <div style={{
              backgroundColor: "#1f2937",
              color: "#f9fafb",
              padding: "16px",
              borderRadius: "8px",
              fontFamily: "monospace",
              fontSize: "12px",
              maxHeight: "400px",
              overflowY: "auto"
            }}>
              {logs.map((log, index) => (
                <div key={index} style={{ marginBottom: "4px" }}>
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}

        {isCompleted && (
          <div style={{
            backgroundColor: "#f0f9ff",
            border: "1px solid #0ea5e9",
            borderRadius: "8px",
            padding: "16px",
            marginTop: "20px"
          }}>
            <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#0c4a6e", marginBottom: "8px" }}>
              🎉 Migration Başarıyla Tamamlandı!
            </h3>
            <p style={{ fontSize: "12px", color: "#075985", margin: 0 }}>
              Verileriniz artık Firebase Firestore'da güvenle saklanıyor. 
              Ana sayfaya dönebilir ve sistem işlevselliğini test edebilirsiniz.
            </p>
          </div>
        )}

        {hasError && (
          <div style={{
            backgroundColor: "#fef2f2",
            border: "1px solid #f87171",
            borderRadius: "8px",
            padding: "16px",
            marginTop: "20px"
          }}>
            <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#991b1b", marginBottom: "8px" }}>
              ⚠️ Migration Hatası
            </h3>
            <p style={{ fontSize: "12px", color: "#7f1d1d", margin: 0 }}>
              Migration sırasında bir hata oluştu. Lütfen logları kontrol edin ve tekrar deneyin.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MigrationUtility;