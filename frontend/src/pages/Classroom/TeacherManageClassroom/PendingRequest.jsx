import { useState } from "react";
import { Link } from "react-router-dom";
import {
    ClassroomTitle,
    TeacherClassroomMenuTab,
    SearchBar, ClassroomDropdownMenu
} from "../../../components/index";

const initialStudents = Array(7).fill("Jane Smith");

export default function PendingRequestPage() {
    const [students, setStudents] = useState(initialStudents);
    const [searchQuery, setSearchQuery] = useState("");

    const handleCancel = (index) => {
        setStudents(students.filter((_, i) => i !== index));
    };

    const filteredStudents = students.filter((name) =>
        name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="pending-request__page">
            <ClassroomTitle />
            <TeacherClassroomMenuTab />

            <div className="pending-request__container">
                {/* Actions */}
                <div className="pending-request__student-action">
                    <Link to="../add-students" className="btn btn--dark"> + Add Student</Link>

                    <div className="pending-request__search-block">
                        <SearchBar />
                        <div className="search-block--dropdown-menu">
                            <ClassroomDropdownMenu students={students} />
                        </div>
                    </div>
                </div>

                {/* Student list */}
                <div className="pending-request__student-list">
                    {filteredStudents.map((name, index) => (
                        <div className="pending-request__student-row" key={index}>
                            <span>{name}</span>
                            <button
                                className="btn btn--light"
                                onClick={() => handleCancel(index)}
                            >
                                Cancel
                            </button>
                        </div>
                    ))}
                </div>

                <div className="pending-request__see-more">
                    <button className="btn btn--see-more">See more ▼</button>
                </div>
            </div>
        </div>
    );
}
