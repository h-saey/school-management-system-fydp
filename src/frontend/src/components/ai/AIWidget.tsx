import React, { useState } from "react";
import { Brain, User, X } from "lucide-react";
import { AIPanel } from "./AIPanel";
import { UserRole } from "../../App";

export function AIWidget({ userRole }: { userRole: UserRole }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ✅ inline style used as backup — guarantees position even if Tailwind purges */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        title="AI Risk Assistant"
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 9999, // ✅ very high — above sidebar, modals, overlays
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          backgroundColor: open ? "#374151" : "#dc2626",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
          transition: "background-color 0.2s",
        }}
      >
        {open ? (
          <X style={{ color: "white", width: 24, height: 24 }} />
        ) : (
          <Brain style={{ color: "white", width: 24, height: 24 }} />
        )}
      </button>

      {/* Notification dot */}
      {!open && (
        <span
          style={{
            position: "fixed",
            bottom: "62px",
            right: "18px",
            zIndex: 9999,
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            backgroundColor: "#facc15",
            border: "2px solid white",
          }}
        />
      )}

      {/* AI Panel */}
      {open && (
        <AIPanel onClose={() => setOpen(false)} /*userRole={userRole}*/ />
      )}
    </>
  );
}
