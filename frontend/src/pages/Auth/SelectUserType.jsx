import { Link } from "react-router-dom"

import Logo from "../../components/Logo"
import { LearnerPattern, TeacherPattern1, TeacherPattern2 } from "../../assets/icons"

export default function SelectUserType() {
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