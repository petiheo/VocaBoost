import { useState } from "react";
import { ClassroomTitle, TeacherClassroomMenuTab } from "../../../components";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import classroomService from "../../../services/Classroom/classroomService";
import {format} from 'date-fns';


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
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!classroomId || isLoading) {
            return;
        }

        const fetchAssignments = async () => {
            try {
                setIsLoading(true);
                const res = await classroomService.getAssignmentsByTeacher(classroomId);
                if (res.success && Array.isArray(res.data)) {
                    setAssignments(res.data);
                    console.log("Fetch assignments thanh cong");
                }
            } catch (error) {
                console.log("Loi khong fetch duoc assignments");
                navigate("/fail");
            }finally{
                setIsLoading(false);
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
                        <Link to="/assign-exercise" className="btn dark">+ Assign Exercise</Link>
                        <div className="sort">Sort by ▼</div>
                    </div>

                    {/* Grid */}
                    <div className="assignment-grid">
                        {assignments.length > 0 ? (
                            assignments.map((assignment) => (
                                <div className="assignment-card"
                                    key={assignment?.id}
                                    onClick={() => {
                                        localStorage.setItem("selectedAssignment", JSON.stringify(assignment));
                                        navigate(`/classroom/assignment-detail`);
                                    }}
                                >
                                    <h4>{assignment?.title}</h4>
                                    <p className="assignment-page__item">{assignment?.words_per_review} word</p>
                                    <p className="due">Due: {assignment?.due_date ? format(new Date(assignment.due_date), 'd/M/yyyy') : 'N/A'}</p>
                                </div>
                            ))
                        ) : (<p>No assignment available</p>)}
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
