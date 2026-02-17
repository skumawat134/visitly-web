import React, { forwardRef, useImperativeHandle, useState, useRef, useEffect } from "react";

export const DateTimeCellEditor = forwardRef((props: any, ref) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Start with existing value, normalized to datetime-local format
  const initial = props.value
    ? String(props.value).replace(/:\d{2}$/, "").substring(0, 16)
    : "";

  const [value, setValue] = useState(initial);

  useImperativeHandle(ref, () => ({
    getValue: () => {
      if (!value?.trim()) return null;
      // Return string with seconds for consistency (backend-friendly)
      return value.length === 16 ? `${value}:00` : value;
    },

    afterGuiAttached: () => {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    },
  }));

  return (
    <input
      ref={inputRef}
      type="datetime-local"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          props.stopEditing();
        }
        if (e.key === "Escape") {
          e.preventDefault();
          props.stopEditing(true);
        }
      }}
      style={{ width: "100%", height: "100%", border: "none", padding: "0 8px" }}
    />
  );
});