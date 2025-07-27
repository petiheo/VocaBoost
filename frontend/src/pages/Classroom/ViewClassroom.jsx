import { useState } from "react";
import { Header, Footer, SideBar, VocabularyListCard, ClassroomTitle } from "../../components";

const tabs = [
    { name: "To-review", active: false },
    { name: "Reviewed", active: true },
];

const dummyLists = Array(6).fill({
    title: "IELTS Academ...",
    description: "A helpful list of commonly used English words to boost your reading and speaking skills",
    username: "Teacher",
});

export default function ManageClassroomLearner() {
    const [activeTab, setActiveTab] = useState("to-review");

    return (
        <div className="manage-classroom-learner">
            <Header />
            <div className="manage-classroom-learner__container">
                <div className="manage-classroom__sidebar">
                    <SideBar />
                </div>
                <div className="manage-classroom-learner__content">

                    <ClassroomTitle />

                    <div className="sub-menu-tabs">
                        <div className="tab-list">
                            {tabs.map((tab, idx) => (
                                <div
                                    key={idx}
                                    className={`tab ${tab.active ? "active" : ""}`}
                                >
                                    {tab.name}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tabs */}
                    {/* <div className="tabs">
                        <button
                            className={`tab ${activeTab === "to-review" ? "active" : ""}`}
                            onClick={() => setActiveTab("to-review")}
                        >
                            To-review lists
                        </button>
                        <button
                            className={`tab ${activeTab === "reviewed" ? "active" : ""}`}
                            onClick={() => setActiveTab("reviewed")}
                        >
                            Reviewed Lists
                        </button>
                    </div> */}
                    {/* Top Bar */}
                    <div className="list-topbar">
                        <span>All lists: 12</span>
                        <div className="filter">Filter by ▼</div>
                    </div>


                    {/* List Grid */}
                    <div className="list-grid">
                        {dummyLists.map((list, index) => (
                            <VocabularyListCard />
                        ))}
                        {/* <VocabularyListCard /> */}
                    </div>


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
