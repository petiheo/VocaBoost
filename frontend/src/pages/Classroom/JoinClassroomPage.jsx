import { useState } from "react";
import classroomService from "../../services/Classroom/classroomService";
import JoinClassroomStatus from "./JoinClassroomStatus";

export default function JoinClassroomPage() {
  const [inputCode, setInputCode] = useState("");
  const [status, setStatus] = useState("default");
  const [errors, setErrors] = useState({});
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = async () => {
    if (!inputCode || isJoining) return;

    setIsJoining(true);

    try {
      const res = await classroomService.joinRequest(inputCode);
      if (res.success) {
        if (res.message.includes("joined")) {
          setStatus("success");
        } else if (res.message.includes("submitted")) {
          setStatus("pending");
        } else {
          setStatus("success");
        }
      } else if (res.message.includes("capacity")) {
        setStatus("full");
      } else {
        setStatus("error");
        setErrors({ server: res.message });
      }
    } catch (error) {
      setStatus("error");
      setErrors({
        server:
          error.response?.data?.message ||
          "Unexpected error occurred. Please try again.",
      });
    } finally {
      setIsJoining(false);
    }
  };

  if (status != "default") {
    return (
      <JoinClassroomStatus
        status={status}
        code={inputCode}
        errorMsg={errors.server}
      />
    );
  }

  return (
    <div className="join-classroom__default">
      <div className="join-classroom__card">
        <h2 className="join-classroom__title">Join classroom</h2>
        <p className="join-classroom__message">
          Enter classroom invitation code:
        </p>
        <input
          type="text"
          className="join-classroom__code-input"
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value)}
        />
        <button
          className={`join-classroom__button ${isJoining ? "join-classroom__button--loading" : ""}`}
          onClick={handleJoin}
          disabled={isJoining}
        >
          {isJoining ? "Joining..." : "Join"}
        </button>
      </div>
    </div>
  );
}
