import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function JoinClassroomStatus({ status, code, errorMsg }) {
  // Xử lý background của tường trạng thái
  const [animation, setAnimation] = useState("");

  // Xử lý trạng thái
  const safeStatus = status ?? "default";

  // Xử lý code của classroom
  const safeCode = code ?? "No code provided";

  // Xử lý điều hướng trang
  const navigate = useNavigate();

  useEffect(() => {
    if (status === "success") setAnimation("confetti");
    else if (status === "pending") setAnimation("confetti");
    else if (status === "full" || status === "error") setAnimation("error-bg");
    else setAnimation("default");
  }, [status]);

  const getTitle = (status) => {
    switch (status) {
      case "success":
        return "Join classroom successfully!";
      case "pending":
        return "Your request has sent successfully!";
      case "full":
        return "Error - The classroom is full";
      case "error":
        return "Error - Join failed";
      default:
        return "Join classroom";
    }
  };

  const getMessage = (status) => {
    switch (status) {
      case "success":
        return "You've joined the classroom:";
      case "pending":
        return "Waiting for teacher approval to join:";
      case "full":
        return "Cannot join, class has reached capacity:";
      case "error":
        return errorMsg || "Could not join classroom.";
      default:
        return "Enter classroom invitation code below:";
    }
  };

  return (
    <div className={`join-classroom ${animation}`}>
      <div className="join-classroom__card">
        <h2 className="join-classroom__header">{getTitle(safeStatus)}</h2>
        <p className="join-classroom__message">{getMessage(safeStatus)}</p>
        {safeCode && <div className="join-classroom__code">{safeCode}</div>}

        <button
          className="join-classroom__button"
          onClick={() => navigate("/my-classroom")}
        >
          {status === "default" ? "Join" : "→"}
        </button>
      </div>
    </div>
  );
}
