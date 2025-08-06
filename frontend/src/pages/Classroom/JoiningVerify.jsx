import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import classroomService from "../../services/Classroom/classroomService";
import JoinClassroomStatus from "./JoinClassroomStatus";
import MyClassroom from "./MyClassroom";
export default function JoiningVerify() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [verificationStatus, setVerificationStatus] = useState({
        status: 'default', // 'verifying', 'success', 'error'
        message: '',
        classroomId: null
    });

    const hasRun = useRef(false);

    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;
        const token = searchParams.get("token");

        const handleVerification = async () => {
            if (!token) {
                setVerificationStatus({ status: 'error', message: 'Invalid or expired token' })
                return;
            }
            let res; 
            try {
                res = await classroomService.acceptInvitation(token);

                if (!res?.success) {
                    throw new Error(res?.message || "Joining request failed")
                } else {
                    setVerificationStatus({
                        status: 'success',
                        message: res?.message,
                        classroomId: res?.data?.classroomId
                    });
                }
            } catch (error) {
                console.log(error);
                setVerificationStatus({
                    status: 'error',
                    message: error.message || "Fail! Please try again.",
                });
            }
        }

        handleVerification()
    }, [searchParams]);

    if (verificationStatus.status === 'default') {
        return <div>Verifying...</div>;
    }

    if (verificationStatus.status === 'success') {
        return <JoinClassroomStatus 
                    status={"success"} 
                    code={"Click the button bellow to continue!"}
                    errorMsg={verificationStatus.message} 
                />;
    }

    if (verificationStatus.status === 'error') {
        return <JoinClassroomStatus 
                    status={"error"} 
                    code={"Click the button bellow to continue!"}
                    errorMsg={verificationStatus.message}
                />;
    }

    return <></>
}