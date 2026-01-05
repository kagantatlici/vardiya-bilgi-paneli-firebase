import React from "react";
import { bonuses } from "../data/bonuses";

interface BonusTableProps {
  onBack?: () => void;
}

const BonusTable: React.FC<BonusTableProps> = ({ onBack }) => {

  // Mevcut tarih referansı
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // compareDate üzerinden gelecek tarih kontrolü
  const isUpcoming = (compareDate: Date): boolean => {
    return compareDate >= today;
  };

  // compareDate üzerinden geçmiş tarih kontrolü
  const isPast = (compareDate: Date): boolean => {
    return compareDate < today;
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      {/* Header */}
      <header style={{ backgroundColor: "#ea580c", color: "white", padding: "16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", gap: "8px" }}>
          {onBack ? (
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
          ) : (
            <div />
          )}
          <div style={{ textAlign: "center" }}>
            <h1 style={{ 
              fontSize: "16px", 
              fontWeight: "600", 
              margin: 0,
              lineHeight: "1.2"
            }}>
              2026 İkramiye Takvimi
            </h1>
          </div>
          <div />
        </div>
      </header>

      {/* Table Container */}
      <div style={{ padding: "16px" }}>
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          }}
        >
          {/* Table Header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              backgroundColor: "#fee2e2",
              padding: "16px",
              gap: "16px",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#dc2626",
                textAlign: "center",
              }}
            >
              💰 İkramiye Türü
            </div>
            <div
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#dc2626",
                textAlign: "center",
              }}
            >
              📅 Tarih
            </div>
          </div>

          {/* Table Rows */}
          <div style={{ padding: "8px 0" }}>
            {bonuses.map((bonus, index) => {
              const upcoming = isUpcoming(bonus.compareDate);
              const past = isPast(bonus.compareDate);
              
              return (
                <div
                  key={bonus.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    padding: "12px 16px",
                    gap: "16px",
                    borderBottom: index < bonuses.length - 1 ? "1px solid #f3f4f6" : "none",
                    backgroundColor: upcoming
                      ? "#f0fdf4"
                      : past
                      ? "#fafafa"
                      : "#ffffff",
                    position: "relative",
                  }}
                >
                  {upcoming && (
                    <div
                      style={{
                        position: "absolute",
                        left: "4px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: "3px",
                        height: "20px",
                        backgroundColor: "#16a34a",
                        borderRadius: "2px",
                      }}
                    />
                  )}
                  
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: past ? "#9ca3af" : "#1f2937",
                      textAlign: "center",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {bonus.type}
                  </div>

                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: upcoming ? "600" : "400",
                      color: upcoming
                        ? "#16a34a"
                        : past
                        ? "#9ca3af"
                        : "#6b7280",
                      textAlign: "center",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {bonus.date}
                    {upcoming && (
                      <span style={{ marginLeft: "6px", fontSize: "12px" }}>⏰</span>
                    )}
                    {past && (
                      <span style={{ marginLeft: "6px", fontSize: "12px" }}>✓</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div
          style={{
            marginTop: "16px",
            padding: "12px",
            backgroundColor: "white",
            borderRadius: "8px",
            fontSize: "12px",
          }}
        >
          <div style={{ fontWeight: "600", marginBottom: "8px", color: "#374151" }}>
            📋 Açıklama:
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  backgroundColor: "#16a34a",
                  borderRadius: "2px",
                }}
              />
              <span style={{ color: "#16a34a", fontSize: "11px" }}>Yaklaşan İkramiye</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#9ca3af", fontSize: "11px" }}>✓</span>
              <span style={{ color: "#9ca3af", fontSize: "11px" }}>Geçmiş İkramiye (Ödendi)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(BonusTable);
