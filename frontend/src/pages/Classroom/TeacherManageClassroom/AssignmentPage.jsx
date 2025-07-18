import { Header, SideBar, Footer, ClassroomTitle, TeacherClassroomMenuTab } from "../../../components";
import { Link } from "react-router-dom";
const mockAssignments = Array(8).fill({
    title: "Unit 1 Vocabulary",
    words: 20,
    dueDate: "April 25, 2025",
});

export default function AssignmentPage() {
    return (
        <div className="assignment-page">
            {/* Header */}
            <Header />
            <div className="assignment-page__container">
                <div className="assignment-page__sidebar">

                    <SideBar />
                </div>
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
                        {mockAssignments.map((item, i) => (
                            <div className="assignment-card" key={i}>
                                <h4>{item.title}</h4>
                                <p className="assignment-page__item">{item.words} word</p>
                                <p className="due">Due: {item.dueDate}</p>
                            </div>
                        ))}
                    </div>

                    {/* See more */}
                    <div className="see-more">
                        <button className="btn see-more-btn">See more ▼</button>
                    </div>
                </div>
            </div>
            {/* Footer */}
            <Footer />
        </div>
    );
}
