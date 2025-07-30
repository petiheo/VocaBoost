import { useState, useEffect } from "react";

export default function JoinClassroomStatus({ status, code, errorMsg }) {
    const [animation, setAnimation] = useState("");

    const safeStatus = status ?? "default";
    const safeCode = code ?? "No code provided";

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
                return "Join request sent!";
            case "full":
                return "Classroom is full";
            case "error":
                return "Join failed";
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
                <div className="join-classroom__code">{safeCode}</div>
                <button className="join-classroom__button">
                    {status === "default" ? "Join" : "→"}
                </button>
            </div>
        </div>
    );
}
