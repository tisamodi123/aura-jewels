"use client";

import { useEffect } from "react";

/**
 * Global component to prevent mouse scroll wheel from changing
 * value on focused <input type="number"> elements across the app.
 */
export default function DisableNumberWheel() {
  useEffect(() => {
    const handleWheel = (e) => {
      if (
        document.activeElement &&
        document.activeElement.tagName === "INPUT" &&
        document.activeElement.type === "number"
      ) {
        document.activeElement.blur();
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return null;
}
