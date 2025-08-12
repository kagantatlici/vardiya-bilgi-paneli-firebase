import React, { useState, useRef } from "react";
import Toast from "./Toast";
import { useToast } from "../hooks/useToast";
import { realCaptainsData } from "../data/captainsData";

interface Captain {
  id: number;
  sicilNo: string;
  isim: string;
  aisMobNo: string;
  aktifEhliyetler: string[];
  tumEhliyetler: {
    istanbul: boolean;
    canakkale: boolean;
    hpasa: boolean;
    kepez: boolean;
    izmir: boolean;
    mersin: boolean;
    zonguldak: boolean;
  };
  melbusat: {
    pantolon: string;
    gomlek: string;
    tshirt: string;
    yelek: string;
    polar: string;
    mont: string;
    ayakkabi: string;
  };
  durum: "Aktif" | "Pasif";
}

interface CaptainInfoTableProps {
  onBack?: () => void;
}

const CaptainInfoTable: React.FC<CaptainInfoTableProps> = ({ onBack }) => {
  const { toasts, showSuccess, showError, removeToast } = useToast();
  
  const [captains, setCaptains] = useState<Captain[]>(realCaptainsData);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragMode, setDragMode] = useState<boolean>(false);
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [selectedCaptain, setSelectedCaptain] = useState<Captain | null>(null);
  const longPressTimer = useRef<number | null>(null);
  const longPressStartTime = useRef<number>(0);

  // Long press handlers
  const handleTouchStart = (index: number) => {
    longPressStartTime.current = Date.now();
    longPressTimer.current = window.setTimeout(() => {
      setDragMode(true);
      setDraggedIndex(index);
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 1500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleRowClick = (targetIndex: number) => {
    if (dragMode && draggedIndex !== null && draggedIndex !== targetIndex) {
      const newCaptains = [...captains];
      const [draggedItem] = newCaptains.splice(draggedIndex, 1);
      newCaptains.splice(targetIndex, 0, draggedItem);
      
      setCaptains(newCaptains);
      setDragMode(false);
      setDraggedIndex(null);
      setShowSaveModal(true);
    }
  };

  const handleSave = () => {
    setShowSaveModal(false);
    showSuccess("Sıralama değişikliği kaydedildi!");
  };

  const handleCancel = () => {
    setShowSaveModal(false);
  };

  const handleDetailClick = (captain: Captain) => {
    setSelectedCaptain(captain);
    setShowDetailModal(true);
  };

  const handleDetailModalClose = () => {
    setShowDetailModal(false);
    setSelectedCaptain(null);
  };

  const handleDetailSave = () => {
    if (selectedCaptain) {
      setCaptains(prev => prev.map(captain => 
        captain.id === selectedCaptain.id ? selectedCaptain : captain
      ));
    }
    setShowDetailModal(false);
    setSelectedCaptain(null);
    showSuccess("Pilot bilgileri kaydedildi!");
  };

  const handleDeleteCaptain = () => {
    if (selectedCaptain && window.confirm(`${selectedCaptain.isim || 'Bu pilot'} silinsin mi?`)) {
      const emptyCaptain: Captain = {
        ...selectedCaptain,
        sicilNo: "",
        isim: "",
        aisMobNo: "",
        aktifEhliyetler: [],
        durum: "Pasif",
        tumEhliyetler: { istanbul: false, canakkale: false, hpasa: false, kepez: false, izmir: false, mersin: false, zonguldak: false },
        melbusat: { pantolon: "", gomlek: "", tshirt: "", yelek: "", polar: "", mont: "", ayakkabi: "" }
      };

      setCaptains(prev => prev.map(captain => 
        captain.id === selectedCaptain.id ? emptyCaptain : captain
      ));
      
      setShowDetailModal(false);
      setSelectedCaptain(null);
      showError("Pilot silindi!");
    }
  };

  const handleCaptainFieldChange = (field: keyof Captain, value: any) => {
    if (selectedCaptain) {
      setSelectedCaptain({
        ...selectedCaptain,
        [field]: value
      });
    }
  };

  const handleEhliyetChange = (port: keyof Captain['tumEhliyetler'], checked: boolean) => {
    if (selectedCaptain) {
      const newEhliyetler = {
        ...selectedCaptain.tumEhliyetler,
        [port]: checked
      };

      const aktifEhliyetler: string[] = [];
      if (newEhliyetler.istanbul) aktifEhliyetler.push("İst");
      if (newEhliyetler.canakkale) aktifEhliyetler.push("Çkl");
      if (newEhliyetler.hpasa) aktifEhliyetler.push("HPaşa");
      if (newEhliyetler.kepez) aktifEhliyetler.push("Kepez");
      if (newEhliyetler.izmir) aktifEhliyetler.push("İzmir");
      if (newEhliyetler.mersin) aktifEhliyetler.push("Mersin");
      if (newEhliyetler.zonguldak) aktifEhliyetler.push("Zonguldak");

      const durum = newEhliyetler.istanbul ? "Aktif" : "Pasif";

      setSelectedCaptain({
        ...selectedCaptain,
        tumEhliyetler: newEhliyetler,
        aktifEhliyetler,
        durum
      });
    }
  };

  const handleMelbusatChange = (item: keyof Captain['melbusat'], value: string) => {
    if (selectedCaptain) {
      setSelectedCaptain({
        ...selectedCaptain,
        melbusat: {
          ...selectedCaptain.melbusat,
          [item]: value
        }
      });
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      {/* Header */}
      <header style={{ backgroundColor: "#7e22ce", color: "white", padding: "16px" }}>
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
          <h1 style={{ 
            fontSize: "16px", 
            fontWeight: "600", 
            textAlign: "center", 
            margin: 0,
            lineHeight: "1.2"
          }}>
            Kılavuz Kaptan Bilgileri
          </h1>
          <div />
        </div>
      </header>

      {/* Drag Mode Indicator */}
      {dragMode && (
        <div style={{
          backgroundColor: "#fef3c7",
          padding: "8px 16px",
          textAlign: "center",
          fontSize: "14px",
          fontWeight: "500",
          color: "#92400e",
          borderBottom: "1px solid #f59e0b",
        }}>
          🔄 Taşıma Modu Aktif - Satıra dokunarak yeni konuma taşıyın
        </div>
      )}

      {/* Table Container */}
      <div style={{ padding: "8px", overflowX: "auto" }}>
        <div style={{
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          overflow: "hidden",
        }}>
          {/* Table Header */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "50px 2fr 80px 2fr 80px",
            backgroundColor: "#f3f4f6",
            padding: "12px 8px",
            fontSize: "12px",
            fontWeight: "600",
            color: "#374151",
            borderBottom: "1px solid #e5e7eb",
          }}>
            <div style={{ textAlign: "center", fontSize: "10px" }}>Vardiya Kıdem Sırası</div>
            <div style={{ textAlign: "left", paddingLeft: "8px" }}>İsim</div>
            <div style={{ textAlign: "center" }}>Sicil</div>
            <div style={{ textAlign: "center" }}>Aktif Ehliyet</div>
            <div style={{ textAlign: "center" }}>Detay</div>
          </div>

          {/* Table Rows */}
          {captains.map((captain, index) => (
            <div
              key={captain.id}
              onTouchStart={() => !dragMode && handleTouchStart(index)}
              onTouchEnd={handleTouchEnd}
              onClick={() => dragMode ? handleRowClick(index) : undefined}
              style={{
                display: "grid",
                gridTemplateColumns: "50px 2fr 80px 2fr 80px",
                padding: "12px 8px",
                fontSize: "12px",
                borderBottom: index < captains.length - 1 ? "1px solid #f3f4f6" : "none",
                backgroundColor:
                  draggedIndex === index && dragMode
                    ? "#fef3c7"
                    : index % 2 === 0
                    ? "#ffffff"
                    : "#f9fafb",
                minHeight: "60px",
                alignItems: "center",
                cursor: dragMode ? "pointer" : "default",
                boxShadow: draggedIndex === index && dragMode ? "0 4px 6px rgba(0,0,0,0.1)" : "none",
              }}
            >
              {/* No */}
              <div style={{
                textAlign: "center",
                fontWeight: "600",
                color: "#1f2937",
                fontSize: "14px",
              }}>
                {index + 1}
              </div>

              {/* İsim */}
              <div style={{
                textAlign: "left",
                paddingLeft: "8px",
                fontWeight: "600",
                color: "#1f2937",
                fontSize: "13px",
              }}>
                {captain.isim}
              </div>

              {/* Sicil */}
              <div style={{
                textAlign: "center",
                fontWeight: "500",
                color: "#374151",
                fontSize: "11px",
              }}>
                {captain.sicilNo}
              </div>

              {/* Aktif Ehliyet */}
              <div style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "2px",
                justifyContent: "center",
                alignItems: "center",
              }}>
                {captain.aktifEhliyetler.map((ehliyet, ehliyetIndex) => (
                  <span
                    key={ehliyetIndex}
                    style={{
                      backgroundColor: "#10b981",
                      color: "white",
                      padding: "2px 4px",
                      borderRadius: "3px",
                      fontSize: "0.6rem",
                      fontWeight: "500",
                      margin: "1px",
                    }}
                  >
                    {ehliyet}
                  </span>
                ))}
              </div>

              {/* Detay */}
              <div style={{ textAlign: "center" }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDetailClick(captain);
                  }}
                  style={{
                    backgroundColor: "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "4px 8px",
                    fontSize: "10px",
                    fontWeight: "500",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "2px",
                    justifyContent: "center",
                  }}
                  onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = "#2563eb"}
                  onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = "#3b82f6"}
                >
                  <span>👁</span>
                  <span>Detay</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div style={{
          marginTop: "12px",
          padding: "12px",
          backgroundColor: "#eff6ff",
          borderRadius: "8px",
          fontSize: "12px",
          color: "#1e40af",
        }}>
          <div style={{ fontWeight: "600", marginBottom: "4px" }}>💡 Kullanım:</div>
          <div>• Satıra 1.5 saniye basılı tutarak sıralama değiştirebilirsiniz</div>
          <div>• Detay butonuna tıklayarak pilot bilgilerini görüntüleyebilirsiniz</div>
        </div>
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "20px",
            margin: "20px",
            maxWidth: "300px",
            width: "100%",
          }}>
            <h3 style={{
              fontSize: "16px",
              fontWeight: "600",
              marginBottom: "12px",
              textAlign: "center",
            }}>
              Değişiklikleri Kaydet?
            </h3>
            <p style={{
              fontSize: "14px",
              color: "#6b7280",
              marginBottom: "16px",
              textAlign: "center",
            }}>
              Pilot sıralama değişikliği kaydedilsin mi?
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={handleCancel}
                style={{
                  flex: 1,
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "1px solid #d1d5db",
                  backgroundColor: "white",
                  color: "#374151",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                İptal
              </button>
              <button
                onClick={handleSave}
                style={{
                  flex: 1,
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: "#16a34a",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                }}
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedCaptain && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          zIndex: 1000,
          overflowY: "auto",
          padding: "20px 0",
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "0",
            margin: "20px",
            maxWidth: "400px",
            width: "100%",
            maxHeight: "90vh",
            overflowY: "auto",
          }}>
            {/* Modal Header */}
            <div style={{
              backgroundColor: "#7e22ce",
              color: "white",
              padding: "16px 20px",
              borderRadius: "12px 12px 0 0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <h3 style={{ fontSize: "16px", fontWeight: "600", margin: 0 }}>
                {selectedCaptain.isim} - Detay Bilgileri
              </h3>
              <button
                onClick={handleDetailModalClose}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  color: "white",
                  fontSize: "18px",
                  cursor: "pointer",
                  padding: "4px",
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: "20px" }}>
              {/* Temel Bilgiler */}
              <div style={{ marginBottom: "24px" }}>
                <h4 style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: "12px",
                  borderBottom: "2px solid #e5e7eb",
                  paddingBottom: "4px",
                }}>
                  📋 Temel Bilgiler
                </h4>
                <div style={{ display: "grid", gap: "12px" }}>
                  <div>
                    <label style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#6b7280",
                      display: "block",
                      marginBottom: "4px",
                    }}>
                      İsim Soyisim
                    </label>
                    <input
                      type="text"
                      value={selectedCaptain.isim}
                      onChange={(e) => handleCaptainFieldChange('isim', e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px",
                        fontSize: "12px",
                        border: "1px solid #d1d5db",
                        borderRadius: "4px",
                        backgroundColor: "white",
                      }}
                    />
                  </div>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                  }}>
                    <div>
                      <label style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#6b7280",
                        display: "block",
                        marginBottom: "4px",
                      }}>
                        Sicil No
                      </label>
                      <input
                        type="text"
                        value={selectedCaptain.sicilNo}
                        onChange={(e) => handleCaptainFieldChange('sicilNo', e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px",
                          fontSize: "12px",
                          border: "1px solid #d1d5db",
                          borderRadius: "4px",
                          backgroundColor: "white",
                        }}
                      />
                    </div>
                    <div>
                      <label style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#6b7280",
                        display: "block",
                        marginBottom: "4px",
                      }}>
                        AIS-MOB No
                      </label>
                      <input
                        type="text"
                        value={selectedCaptain.aisMobNo}
                        onChange={(e) => handleCaptainFieldChange('aisMobNo', e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px",
                          fontSize: "12px",
                          border: "1px solid #d1d5db",
                          borderRadius: "4px",
                          backgroundColor: "white",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Ehliyet Bilgileri */}
              <div style={{ marginBottom: "24px" }}>
                <h4 style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: "12px",
                  borderBottom: "2px solid #e5e7eb",
                  paddingBottom: "4px",
                }}>
                  🏆 Tüm Ehliyet Bilgileri
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  {Object.entries({
                    istanbul: "İstanbul",
                    canakkale: "Çanakkale", 
                    hpasa: "H.Paşa",
                    kepez: "Kepez",
                    izmir: "İzmir",
                    mersin: "Mersin",
                    zonguldak: "Zonguldak"
                  }).map(([key, label]) => (
                    <div key={key} style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "6px",
                      backgroundColor: selectedCaptain.tumEhliyetler[key as keyof typeof selectedCaptain.tumEhliyetler] ? "#f0f9ff" : "#f9fafb",
                      borderRadius: "4px",
                      border: "1px solid #e5e7eb",
                    }}>
                      <input
                        type="checkbox"
                        checked={selectedCaptain.tumEhliyetler[key as keyof typeof selectedCaptain.tumEhliyetler]}
                        onChange={(e) => handleEhliyetChange(key as keyof Captain['tumEhliyetler'], e.target.checked)}
                        style={{ cursor: "pointer" }}
                      />
                      <label style={{ fontSize: "12px", color: "#374151" }}>
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Melbusat */}
              <div style={{ marginBottom: "24px" }}>
                <h4 style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: "12px",
                  borderBottom: "2px solid #e5e7eb",
                  paddingBottom: "4px",
                }}>
                  👔 Melbusat Bilgileri
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  {Object.entries({
                    pantolon: "Pantolon",
                    gomlek: "Gömlek",
                    tshirt: "T-Shirt",
                    yelek: "Yelek",
                    polar: "Polar",
                    mont: "Mont",
                    ayakkabi: "Ayakkabı"
                  }).map(([key, label]) => (
                    <div key={key}>
                      <label style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#6b7280",
                        display: "block",
                        marginBottom: "4px",
                      }}>
                        {label}
                      </label>
                      <input
                        type="text"
                        value={selectedCaptain.melbusat[key as keyof typeof selectedCaptain.melbusat]}
                        onChange={(e) => handleMelbusatChange(key as keyof Captain['melbusat'], e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px",
                          fontSize: "12px",
                          border: "1px solid #d1d5db",
                          borderRadius: "4px",
                          backgroundColor: "white",
                          textAlign: "center",
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
                <button
                  onClick={handleDetailSave}
                  style={{
                    flex: 2,
                    padding: "12px",
                    backgroundColor: "#16a34a",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  💾 Kaydet ve Kapat
                </button>
                <button
                  onClick={handleDeleteCaptain}
                  style={{
                    flex: 1,
                    padding: "12px",
                    backgroundColor: "#dc2626",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  🗑️ Sil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default CaptainInfoTable;