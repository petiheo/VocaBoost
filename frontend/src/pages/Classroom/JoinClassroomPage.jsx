import { useState } from "react";
import JoinClassroomStatus from "./JoinClassroomStatus";
import axios from "axios";
import { data } from "react-router-dom";

export default function JoinClassroomPage() {
    const [inputCode, setInputCode] = useState("");
    const [status, setStatus] = useState("default");
    const [submittedCode, setSubmittedCode] = useState("");

    const handleJoin = async (e) => {
        if (!inputCode) return;

        try {
            const response = await axios.post("api/classroom/join", { code: inputCode });

            const { status } = response(data);
            setSubmittedCode(inputCode);
            setStatus(status);
        }
        catch (err) {
            setStatus("error");
        }
    };

    if (status != "default") {
        return <JoinClassroomStatus status={status} code={submittedCode} />
    }

    return (
        <div className="join-classroom__default">
            <div className="join-classroom__card">
                <h2 className="join-classroom__title">Join classroom</h2>
                <p className="join-classroom__message">Enter classroom invitation code:</p>
                <input
                    type="text"
                    className="join-classroom__code-input"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                />
                <button className="join-classroom__button" onClick={handleJoin}>
                    Join
                </button>
            </div>
        </div>
    );
}