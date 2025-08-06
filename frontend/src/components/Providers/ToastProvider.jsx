import { createContext, useContext } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const showToast = (message, type = "success") => {
    const config = {
      position: "top-right",
      autoClose: type === "error" ? 8000 : 6000, // 8s for errors, 6s for others
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
    };

    if (type === "success") {
      toast.success(message, config);
    } else if (type === "error") {
      toast.error(message, config);
    } else if (type === "warning") {
      toast.warning(message, config);
    } else if (type === "info") {
      toast.info(message, config);
    } else {
      // Default to info for any other type
      toast.info(message, config);
    }
  };

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={6000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        toastStyle={{
          fontFamily: "'Inria Sans', sans-serif",
          fontWeight: "bold",
          fontSize: "1rem",
        }}
      />
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);