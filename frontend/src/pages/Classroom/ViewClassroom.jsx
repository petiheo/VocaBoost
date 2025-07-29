import { useEffect, useState } from "react";
import { Header, Footer, SideBar, VocabularyListCard, ClassroomTitle } from "../../components";
import { useNavigate } from "react-router-dom";
import classroomService from "../../services/Classroom/classroomService";

const tabs = [
    { name: "To-review" },
    { name: "Reviewed" },
    { name: "Overdue assignment" }
];

const dummyLists = Array(8).fill({
    title: "IELTS Academy",
    description: "A helpful list of commonly used English words to boost your reading and speaking skills",
    username: "nguyenhoangphihung@gmail.com",
    role: "Teacher",
    reviewProgress: "2/5",
    completionDate: "Aug, 28th, 2025",
    result: "80%"
});


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
    // const [isLoading, setIsLoading] = useState(false);
    // const [assignments, setAssignments] = useState([]);

    // useEffect(() => {
    //     if (!classroomId || isLoading) {
    //         return;
    //     }

    //     const fetchAssignments = async () => {
    //         setIsLoading(true);
    //         try {
    //             let res;
    //             switch (activeTab) {
    //                 case "To-review":
    //                     res = await classroomService.getToReviewAssignments(classroomId);
    //                     break;
    //                 case "Reviewed":
    //                     res = await classroomService.getReviewedAssignments(classroomId);
    //                     break;
    //                 default:
    //                     res = await classroomService.getOverdueAssignments(classroomId);
    //             }

    //             if (res.success && Array.isArray(res.data)) {
    //                 setAssignments(res.data);
    //                 console.log("Fetch assignments thành công");
    //             }
    //         } catch (error) {
    //             console.error("Lỗi khi fetch assignments:", error);
    //             navigate("/fail");
    //         } finally {
    //             setIsLoading(false);
    //         }
    //     };
    //     fetchAssignments();

    // }, [activeTab, classroomId]);

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
                        <span>All lists: 12</span>
                        <div className="filter">Filter by ▼</div>
                    </div>


                    {/* List Grid */}
                    {activeTab === "To-review" ? (
                        <div className="list-grid">
                            {dummyLists.map((list, index) => (
                                <VocabularyListCard
                                    key={index}
                                    {...list}
                                />
                            ))}
                        </div>
                    ) : activeTab === "Reviewed" ? (
                        <div className="list-grid">
                            {dummyLists.map((list, index) => (
                                <VocabularyListCard
                                    key={index}
                                    {...list}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="list-grid">
                            {dummyLists.map((list, index) => (
                                <VocabularyListCard
                                    key={index}
                                    {...list}
                                />
                            ))}
                        </div>
                    )}



                    {/* See more */}
                    <div className="see-more">
                        <button className="btn see-more-btn">See more ▼</button>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
