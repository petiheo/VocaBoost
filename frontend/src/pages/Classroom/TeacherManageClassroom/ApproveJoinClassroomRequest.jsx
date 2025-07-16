import { useState } from "react";
import { Link } from "react-router-dom";

import { ClassroomTitle, TeacherClassroomMenuTab, ClassroomDropdownMenu } from "../../../components";

const studentRequests = Array(12).fill({ name: "Jane Smith" });

export default function ApproveJoinClassroomRequest() {
    const [students, setStudents] = useState(studentRequests);
    const [requests, setRequests] = useState(studentRequests);


    return (
        <div className="approve-join-classroom-request__page">
            <div className="approve-join-classroom-request__class-card">
                <ClassroomTitle />

                <TeacherClassroomMenuTab />

                <div className="pending-request__student-action">
                    <Link to="../add-students" className="btn btn--dark"> + Add Student</Link>

                    <div className="pending-request__search-block">
                        <div className="search-block--btn">
                            <button className="btn green">Approve all</button>
                            <button className="btn light">Auto-Approval Settings</button>
                        </div>
                        <div className="search-block--dropdown-menu">
                            <ClassroomDropdownMenu students={students} />
                        </div>
                    </div>
                </div>

                <div className="student-list">
                    {requests.map((student, index) => (
                        <div className="student-row" key={index}>
                            <span>{student.name}</span>
                            <div className="buttons">
                                <button className="btn approve">Approve</button>
                                <button className="btn decline">Decline</button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="see-more">
                    <button className="btn light">See more ▼</button>
                </div>
            </div>
        </div>
    );
}
