import { useEffect } from "react";

export default function LoadingCursor({ loading = false }) {
  useEffect(() => {
    document.body.style.cursor = loading ? "progress" : "default";

    return () => {
      // Reset lại nếu component bị unmount
      document.body.style.cursor = "default";
    };
  }, [loading]);

  return null; // không render gì ra DOM
}
