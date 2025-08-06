import { useState } from "react";
import { ClassroomTitle, TeacherClassroomMenuTab, AssignmentPageSkeleton } from "../../../components";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import classroomService from "../../../services/Classroom/classroomService";
import { format } from 'date-fns';
import SeeMoreSection from "../../../components/Classroom/SeeMoreSection";

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
            } finally {
                setIsLoading(false);
            }
        }
        fetchAssignments();
    }, [classroomId]);

    if (isLoading) {
        return <AssignmentPageSkeleton />;
    }

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

                    {/* See more */}
                    {assignments.length === 0 ? (
                        <>
                            <div className="empty-list">"No assignment available"</div>
                        </>
                    ) : (
                        <>
                            <div className="assignment-grid">
                                <SeeMoreSection
                                    items={assignments}
                                    renderItem={(item) => (
                                        <div className="assignment-card" key={item.id}
                                            onClick={() => {
                                                localStorage.setItem("selectedAssignment", JSON.stringify(item));
                                                navigate(`/classroom/assignment-detail`);
                                            }}
                                            style={{ cursor: "pointer" }}
                                        >
                                            <h4>{item?.title}</h4>
                                            <p className="assignment-page__item">{item?.words_per_review} word</p>
                                            <p className="due">Due: {item?.due_date ? format(new Date(item.due_date), 'd/M/yyyy') : 'N/A'}</p>
                                        </div>
                                    )}
                                    initialCount={4}
                                    step={4}
                                    wrapperClassName="assignment-grid"
                                    itemWrapperTag="div"
                                />
                            </div>
                        </>
                    )}

                </div>
            </div>
        </div>
    );
}
