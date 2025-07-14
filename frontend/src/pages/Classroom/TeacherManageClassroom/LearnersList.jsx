import { useState } from "react";
import { Link } from "react-router-dom";
import { ClassroomTitle, TeacherClassroomMenuTab, SearchBar, ClassroomDropdownMenu } from "../../../components/index"

const initialStudents = Array(7).fill("Jane Smith");

export default function StudentListPage() {
    const [students, setStudents] = useState(initialStudents);
    const [searchQuery, setSearchQuery] = useState("");

    const handleRemove = (index) => {
        setStudents(students.filter((_, i) => i !== index));
    };

    const filteredStudents = students.filter((name) =>
        name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="student-list-page">

            <ClassroomTitle />
            <TeacherClassroomMenuTab />
            <div className="student-list-container">
                {/* Actions */}
                <div className="student-actions">
                    <Link to="../add-students" className="btn btn--dark"> + Add Student</Link>

                    <div className="pending-request__search-block">
                        <SearchBar />
                        <div className="search-block--dropdown-menu">
                            <ClassroomDropdownMenu students={students} />
                        </div>
                    </div>
                </div>

                {/* Student list */}
                <div className="student-list">
                    {filteredStudents.map((name, index) => (
                        <div className="student-row" key={index}>
                            <span>{name}</span>
                            <button className="btn light" onClick={() => handleRemove(index)}>
                                Remove
                            </button>
                        </div>
                    ))}
                </div>

                <div className="see-more">
                    <button className="btn see-more-btn">See more ▼</button>
                </div>
            </div>
        </div>
    );
}
