import { useEffect } from "react";
import type { ReactNode, FC } from "react";
import { X } from "lucide-react";

export interface RightSlideProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  width?: number;
  children: ReactNode;
}

export const RightSlide: FC<RightSlideProps> = ({
  open,
  onClose,
  title,
  width = 560,
  children,
}) => {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.3)",
          zIndex: 200,
          animation: "fadeIn 0.2s ease",
        }}
      />

      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: `min(${width}px, 100vw)`,
          height: "100vh",
          background: "#fff",
          zIndex: 201,
          display: "flex",
          flexDirection: "column",
          boxShadow: "-8px 0 30px rgba(0,0,0,0.12)",
          animation: "slideIn 0.25s ease",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px",
            borderBottom: "1px solid var(--color-gray-200)",
            flexShrink: 0,
          }}
        >
          {title && (
            <h2
              style={{
                fontSize: "18px",
                fontWeight: 600,
                color: "var(--color-gray-900)",
              }}
            >
              {title}
            </h2>
          )}

          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              padding: "6px",
              borderRadius: "var(--radius-sm)",
              color: "var(--color-gray-400)",
              display: "flex",
              cursor: "pointer",
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div
          style={{
            flex: 1,
            overflow: "auto",
            padding: "24px",
          }}
        >
          {children}
        </div>
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes slideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        `}
      </style>
    </>
  );
};

