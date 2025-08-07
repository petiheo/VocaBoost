import { useEffect, useState } from "react";

// Hook này nhận vào một giá trị (value) và một khoảng thời gian chờ (delay)
export function useDebounce(value, delay) {
  // State để lưu trữ giá trị đã được debounce
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Thiết lập một timeout để cập nhật debouncedValue sau khoảng thời gian delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Dọn dẹp timeout nếu value hoặc delay thay đổi.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Chỉ chạy lại effect nếu value hoặc delay thay đổi

  return debouncedValue;
}
