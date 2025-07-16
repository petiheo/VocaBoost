import { useState } from "react";
import { Header, SideBar, ClassroomTitle, TeacherClassroomMenuTab } from "../../../components/index"

export default function AddStudentPage() {
  const [students, setStudents] = useState([
    "Jane Smith",
    "Jane Smith",
    "Jane Smith",
    "Jane Smith",
    "Jane Smith",
  ]);
  const [email, setEmail] = useState("");

  const handleAdd = () => {
    if (email.trim()) {
      setStudents([...students, email.trim()]);
      setEmail("");
    }
  };

  const handleRemove = (index) => {
    setStudents(students.filter((_, i) => i !== index));
  };

  return (
    <div className="add-student-page">
        <div className="add-student-page__container">
          <ClassroomTitle />
          <TeacherClassroomMenuTab />
          
          <h2 className="page-title">Add student</h2>

          {/* Add student form */}
          <div className="form-section">
            <label>Student</label>
            <div className="input-group">
              <input
                type="email"
                placeholder="Enter student's email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button onClick={handleAdd}>Add</button>
            </div>
          </div>

          {/* Student list */}
          <div className="student-list">
            <h4>Student list</h4>
            {students.map((student, index) => (
              <div className="student-row" key={index}>
                <span>{student}</span>
                <button onClick={() => handleRemove(index)}>Remove</button>
              </div>
            ))}
          </div>

          {/* See more */}
          <div className="see-more">
            <button>See more ▼</button>
          </div>
        </div>
      </div>
  );
}
