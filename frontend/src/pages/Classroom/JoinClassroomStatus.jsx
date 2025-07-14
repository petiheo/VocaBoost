import { useState, useEffect } from "react";

export default function JoinClassroomStatus({ status, code }) {
    const [animation, setAnimation] = useState("");

    const safeStatus = status ?? "default";
    const safeCode = code ?? "Nguyen Hoang Phi Hung";

    useEffect(() => {
        // Gán class animation theo trạng thái
        if (status === "success") setAnimation("confetti");
        else if (status === "pending") setAnimation("cofetti");
        else if (status === "full") setAnimation("error-bg");
        else setAnimation("default");
    }, [status]);

    const getTitle = (status) => {
        switch (status) {
            case "success":
                return "Join classroom successfully!";
            case "pending":
                return "Your request sent successfully!";
            case "full":
                return "Error - The classroom is full";
            case "default":
                return "Join classroom";
        }
    }

    const getMessage = (status) => {
        switch (status) {
            case "success":
                return "Continue with the classroom:";
            case "pending":
                return "Wait for the approval to join the classroom:";
            case "full":
                return "Can't join the classroom:";
            default:
                return "Enter classroom invitation code:";
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