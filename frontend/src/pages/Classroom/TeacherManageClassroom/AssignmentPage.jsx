import { useState } from "react";
import { ClassroomTitle, TeacherClassroomMenuTab } from "../../../components";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import classroomService from "../../../services/Classroom/classroomService";
const mockAssignments = Array(8).fill({
    title: "Unit 1 Vocabulary",
    words: 20,
    dueDate: "April 25, 2025",
});

export default function AssignmentPage() {
    // Xử lý việc navigate
    const navigate = useNavigate();

    // Get id về để fetch data 
    const [classroomId, setClassroomId] = useState(() => {
        const selectedClassroom = JSON.parse(localStorage.getItem("selectedClassroom"));
        return selectedClassroom?.id || null;
    })

    // Xử lý việc fetch data về page
    const [assignments, setAssignments] = useState([]);

    useEffect(() => {
        const fetchAssignments = async () => {
            try{
                const res = await classroomService.getAssignmentsByTeacher(classroomId);
                if(res.success && Array.isArray(res.data)){
                    setAssignments(res.data);
                    console.log("Fetch assignments thanh cong");
                }
            }catch(error){
                console.log("Loi khong fetch duoc assignments");
                navigate("/fail");
            }
        }
        fetchAssignments();
    }, [classroomId]);

    return (
        <div className="assignment-page">
            <div className="assignment-page__container">
                <div className="assignment-page__content">
                    {/* Classroom title  */}
                    <ClassroomTitle />

                    {/* Tabs */}
                    <TeacherClassroomMenuTab />

                    {/* Controls */}
                    <div className="controls">
                        <Link to = "/assign-exercise" className="btn dark">+ Assign Exercise</Link>
                        <div className="sort">Sort by ▼</div>
                    </div>

                    {/* Grid */}
                    <div className="assignment-grid">
                        {assignments.length > 0? (
                            assignments.map((assignment) => (
                            <div className="assignment-card" key={assignment?.id}>
                                <h4>{assignment?.title}</h4>
                                <p className="assignment-page__item">{assignment?.words_per_review} word</p>
                                <p className="due">Due: {assignment?.due_date}</p>
                            </div>
                            ))
                        ):(<p>No assignment available</p>)}
                        {/* {mockAssignments.map((item, i) => (
                            <div className="assignment-card" key={i}>
                                <h4>{item.title}</h4>
                                <p className="assignment-page__item">{item.words} word</p>
                                <p className="due">Due: {item.dueDate}</p>
                            </div>
                        ))} */}
                    </div>

                    {/* See more */}
                    <div className="see-more">
                        <button className="btn see-more-btn">See more ▼</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
