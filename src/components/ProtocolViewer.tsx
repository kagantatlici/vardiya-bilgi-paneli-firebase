import React, { useState, useEffect, useMemo } from "react";

interface ProtocolItem {
  maddeNo: string;
  content: string;
}

interface ProtocolViewerProps {
  onBack?: () => void;
}

const ProtocolViewer: React.FC<ProtocolViewerProps> = ({ onBack }) => {
  const [protocols, setProtocols] = useState<ProtocolItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Load protocol data
  useEffect(() => {
    const loadProtocols = async () => {
      try {
        const response = await fetch("/data/Vardiya_Protokol_Maddeleri.txt");
        if (!response.ok) {
          throw new Error("Protocol file could not be loaded");
        }
        
        const text = await response.text();
        const parsedProtocols = parseProtocolText(text);
        setProtocols(parsedProtocols);
        setLoading(false);
      } catch {
        setError("Protokol dosyası yüklenemedi");
        setLoading(false);
      }
    };

    loadProtocols();
  }, []);

  // Parse protocol text into structured data
  const parseProtocolText = (text: string): ProtocolItem[] => {
    const lines = text.split("\n");
    const protocols: ProtocolItem[] = [];
    let currentMadde = "";
    let currentContent = "";

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Check if line starts with "Madde XX:"
      const maddeMatch = trimmedLine.match(/^Madde (\d{2}):/);
      
      if (maddeMatch) {
        // Save previous madde if exists
        if (currentMadde && currentContent) {
          protocols.push({
            maddeNo: currentMadde,
            content: currentContent.trim(),
          });
        }
        
        // Start new madde
        currentMadde = maddeMatch[1];
        currentContent = trimmedLine.substring(maddeMatch[0].length).trim();
      } else if (trimmedLine && currentMadde) {
        // Continue current madde content
        currentContent += " " + trimmedLine;
      }
    }

    // Add last madde
    if (currentMadde && currentContent) {
      protocols.push({
        maddeNo: currentMadde,
        content: currentContent.trim(),
      });
    }

    return protocols;
  };

  // Debounced search - filter protocols
  const filteredProtocols = useMemo(() => {
    if (!searchTerm.trim()) return protocols;
    
    const searchLower = searchTerm.toLowerCase().replace(/[iı]/g, "i").replace(/[İI]/g, "i");
    
    return protocols.filter(protocol => {
      const contentLower = protocol.content.toLowerCase().replace(/[iı]/g, "i").replace(/[İI]/g, "i");
      const maddeNoLower = protocol.maddeNo.toLowerCase();
      
      return (
        contentLower.includes(searchLower) ||
        maddeNoLower.includes(searchLower) ||
        `madde ${protocol.maddeNo}`.includes(searchLower)
      );
    });
  }, [protocols, searchTerm]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
        <header style={{ backgroundColor: "#dc2626", color: "white", padding: "16px" }}>
          <h1 style={{ fontSize: "18px", fontWeight: "600", textAlign: "center" }}>
            Vardiya Protokolü
          </h1>
        </header>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "200px",
            fontSize: "16px",
            color: "#6b7280",
          }}
        >
          Protokol yükleniyor...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
        <header style={{ backgroundColor: "#dc2626", color: "white", padding: "16px" }}>
          <h1 style={{ fontSize: "18px", fontWeight: "600", textAlign: "center" }}>
            Vardiya Protokolü
          </h1>
        </header>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "200px",
            fontSize: "16px",
            color: "#dc2626",
          }}
        >
          ❌ {error}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      {/* Header */}
      <header style={{ backgroundColor: "#dc2626", color: "white", padding: "16px" }}>
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
              Vardiya Protokolü
            </h1>
            <p style={{ 
              fontSize: "11px", 
              marginTop: "2px", 
              opacity: 0.9, 
              margin: "2px 0 0 0",
              lineHeight: "1.2"
            }}>
              {protocols.length} madde • Son güncelleme: 30 Ağustos 2025
            </p>
          </div>
          <div />
        </div>
      </header>

      {/* Search Box */}
      <div style={{ padding: "16px", backgroundColor: "white", borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Madde ara... (ör: 'gemi', 'vardiya', 'kılavuz')"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 16px",
              paddingLeft: "40px",
              fontSize: "14px",
              border: "2px solid #e5e7eb",
              borderRadius: "8px",
              outline: "none",
              backgroundColor: "#f9fafb",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#dc2626";
              e.target.style.backgroundColor = "white";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e5e7eb";
              e.target.style.backgroundColor = "#f9fafb";
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "16px",
              color: "#9ca3af",
            }}
          >
            🔍
          </div>
        </div>
        
        {searchTerm && (
          <div style={{ marginTop: "8px", fontSize: "12px", color: "#6b7280" }}>
            {filteredProtocols.length} madde bulundu
          </div>
        )}
      </div>

      {/* Protocol Cards */}
      <div style={{ padding: "16px" }}>
        {filteredProtocols.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              fontSize: "16px",
              color: "#6b7280",
            }}
          >
            {searchTerm ? (
              <>
                🔍 <br />
                "<strong>{searchTerm}</strong>" için sonuç bulunamadı
              </>
            ) : (
              "Protokol maddesi bulunamadı"
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {filteredProtocols.map((protocol) => (
              <div
                key={protocol.maddeNo}
                style={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  padding: "16px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  border: "1px solid #f3f4f6",
                }}
              >
                {/* Madde Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "12px",
                    paddingBottom: "8px",
                    borderBottom: "1px solid #f3f4f6",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#dc2626",
                      color: "white",
                      fontSize: "12px",
                      fontWeight: "600",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      minWidth: "60px",
                      textAlign: "center",
                    }}
                  >
                    Madde {protocol.maddeNo}
                  </div>
                </div>

                {/* Madde Content */}
                <div
                  style={{
                    fontSize: "13px",
                    lineHeight: "1.6",
                    color: "#374151",
                    textAlign: "justify",
                  }}
                >
                  {protocol.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div
        style={{
          padding: "20px 16px",
          textAlign: "center",
          fontSize: "12px",
          color: "#9ca3af",
          borderTop: "1px solid #f3f4f6",
          backgroundColor: "white",
          marginTop: "20px",
        }}
      >
        📄 İstanbul Boğazı 3. Vardiya Protokolü <br />
        Toplam {protocols.length} madde yüklendi
      </div>
    </div>
  );
};

export default ProtocolViewer;
