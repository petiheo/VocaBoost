import { Link, useNavigate } from "react-router-dom"
import { useEffect } from "react"

import Logo from "../../components/Layout/Logo"
import { LearnerPattern, TeacherPattern1, TeacherPattern2 } from "../../assets/icons"
import authService from "../../services/Auth/authService"

export default function SelectUserType() {
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is authenticated
        const token = authService.getToken();
        if (!token) {
            // No token found, redirect to signin
            navigate("/signin");
            return;
        }

        // Validate token with server
        const validateAuth = async () => {
            try {
                const validation = await authService.validateToken();
                if (!validation || !validation.success) {
                    // Token is invalid, redirect to signin
                    navigate("/signin");
                }
            } catch (error) {
                console.error("Token validation failed:", error);
                navigate("/signin");
            }
        };

        validateAuth();
    }, [navigate]);

    return (
        <>
            <Logo className="logo" />
            <h1 className="select-user-type-text">SELECT USER TYPE</h1>
            <div className="select-user-type-container">

                <Link to="/homepage" className="select-learner-type">
                    <h3>Learner</h3>
                    <img src={LearnerPattern} alt="learner-pattern" className="learner-pattern" width="60px" />
                </Link>

                <Link to="/teacher-verification" className="select-teacher-type">
                    <h3>Teacher</h3>
                    <div className="pattern">
                        <img src={TeacherPattern1} alt="teacher-pattern1" className="teacher-pattern1" width="60px" />
                        <img src={TeacherPattern2} alt="teacher-pattern2" className="teacher-pattern2" width="60px" />
                    </div>

                </Link>
            </div>
        </>
    )
}