import React, { useEffect } from "react";

export interface ToastProps {
  message: string;
  type: "success" | "error" | "info";
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, duration = 3000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getToastStyles = () => {
    const baseStyles = {
      position: "fixed" as const,
      top: "20px",
      right: "20px",
      padding: "12px 16px",
      borderRadius: "8px",
      color: "white",
      fontSize: "14px",
      fontWeight: "500",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      gap: "8px",
      minWidth: "250px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      animation: "slideInRight 0.3s ease-out",
    };

    const typeStyles = {
      success: { backgroundColor: "#16a34a" },
      error: { backgroundColor: "#dc2626" },
      info: { backgroundColor: "#2563eb" },
    };

    return { ...baseStyles, ...typeStyles[type] };
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "info":
        return "ℹ️";
      default:
        return "";
    }
  };

  return (
    <>
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
      <div style={getToastStyles()}>
        <span>{getIcon()}</span>
        <span>{message}</span>
        <button
          onClick={onClose}
          style={{
            marginLeft: "auto",
            background: "none",
            border: "none",
            color: "white",
            fontSize: "16px",
            cursor: "pointer",
            opacity: 0.7,
          }}
          onMouseOver={(e) => (e.target as HTMLElement).style.opacity = "1"}
          onMouseOut={(e) => (e.target as HTMLElement).style.opacity = "0.7"}
        >
          ×
        </button>
      </div>
    </>
  );
};

export default Toast;