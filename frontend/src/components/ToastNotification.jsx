import { useEffect } from "react";

export default function ToastNotification({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // tự động ẩn sau 3s

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast-notification ${type === "success" ? "toast--success" : "toast--error"}`}>
      {message}
    </div>
  );
}
