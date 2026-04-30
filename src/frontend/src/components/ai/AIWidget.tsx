import React, { useState } from "react";
import { Brain, X } from "lucide-react";
import { AIPanel } from "./AIPanel";

// ── Drop this component inside ANY dashboard layout ──────────
// It renders a floating button bottom-right + opens AIPanel.
// Works for Admin, Teacher, Student, Parent dashboards.

export function AIWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        title="AI Risk Assistant"
        className={`
          fixed bottom-5 right-5 z-50 z-[9999]
          w-14 h-14 rounded-full shadow-lg
          flex items-center justify-center
          transition-all duration-200
          ${
            open
              ? "bg-gray-700 hover:bg-gray-800"
              : "bg-red-600 hover:bg-red-700"
          }
        `}
      >
        {open ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Brain className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Notification dot (shown when closed) */}
      {!open && (
        <span
          className="
          fixed bottom-[62px] right-[14px] z-50
          w-3 h-3 rounded-full bg-yellow-400
          border-2 border-white
        "
        />
      )}

      {/* AI Panel */}
      {open && <AIPanel onClose={() => setOpen(false)} />}
    </>
  );
}
