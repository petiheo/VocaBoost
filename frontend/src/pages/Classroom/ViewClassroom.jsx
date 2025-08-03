import { useEffect, useState } from "react";
import { Header, Footer, SideBar, VocabularyListCard, ClassroomTitle } from "../../components";
import { useNavigate } from "react-router-dom";
import classroomService from "../../services/Classroom/classroomService";

const tabs = [
    { name: "To-review" },
    { name: "Reviewed" },
    { name: "Overdue assignment" }
];

export default function ManageClassroomLearner() {

    const [activeTab, setActiveTab] = useState("To-review");

    // Xử lý việc navigate
    const navigate = useNavigate();

    // Get id về để fetch data 
    const [classroomId, setClassroomId] = useState(() => {
        const selectedClassroom = JSON.parse(localStorage.getItem("selectedClassroom"));
        return selectedClassroom?.id || null;
    })

    // Xử lý việc fetch dữ liệu lớp học cho learner
    const [isLoading, setIsLoading] = useState(false);
    const [assignments, setAssignments] = useState([]);

    useEffect(() => {
        if (!classroomId) {
            return;
        }

        const fetchAssignments = async () => {
            setIsLoading(true);
            try {
                let res;
                switch (activeTab) {
                    case "To-review":
                        res = await classroomService.getToReviewAssignments(classroomId);
                        break;
                    case "Reviewed":
                        res = await classroomService.getReviewedAssignments(classroomId);
                        break;
                    default:
                        res = await classroomService.getOverdueAssignments(classroomId);
                        console.log(res);
                }

                if (res.success && Array.isArray(res.data)) {
                    setAssignments(res.data);
                    console.log("Fetch assignments thành công");
                }
            } catch (error) {
                console.error("Lỗi khi fetch assignments:", error);
                navigate("/fail");
            } finally {
                setIsLoading(false);
            }
        };
        fetchAssignments();

    }, [activeTab, classroomId, navigate]);

    return (
        <div className="manage-classroom-learner">
            <Header />
            <div className="manage-classroom-learner__container">
                <div className="manage-classroom__sidebar">
                    <SideBar />
                </div>
                <div className="manage-classroom-learner__content">
                    {/* Title */}
                    <ClassroomTitle />

                    {/* Menu tab */}
                    <div className="sub-menu-tabs">
                        <div className="tab-list">
                            {tabs.map((tab, idx) => (
                                <div
                                    key={idx}
                                    className={`tab ${(activeTab === tab.name) ? "active" : ""}`}
                                    onClick={() => setActiveTab(tab.name)}
                                >
                                    {tab.name}
                                </div>
                            ))}
                        </div>
                    </div>


                    {/* Top Bar */}
                    <div className="list-topbar">
                        <span>All lists: {assignments.length}</span>
                        <div className="filter">Filter by ▼</div>
                    </div>


                    {/* List Grid */}
                    {isLoading ? (
                        <div className="loading-container">
                            <p>Loading assignments...</p>
                        </div>
                    ) : assignments.length > 0 ? (
                        <div className="list-grid">
                            {assignments.map((assignment, index) => (
                                <VocabularyListCard
                                    key={assignment.assignment_id || index}
                                    title={assignment.title}
                                    description={`Exercise method: ${assignment.exercise_method}`}
                                    username={assignment.creator.email}
                                    avatarUrl={assignment.creator?.avatar_url}
                                    role="Teacher"
                                    reviewProgress={`${assignment.completed_sublist_index || 0}/${assignment.sublist_count || 0}`}
                                    completionDate={new Date(assignment.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    result={assignment.learner_status || 'Pending'}
                                    buttonContent="Overview"
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="empty-list">
                            <p>No assignments found for {activeTab.toLowerCase()}.</p>
                        </div>
                    )}



                    {/* See more */}
                    {assignments.length > 0 && (
                        <div className="see-more">
                            <button className="btn see-more-btn">See more ▼</button>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}
