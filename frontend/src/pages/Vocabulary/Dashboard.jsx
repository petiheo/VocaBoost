import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Footer, Header, SideBar, LearnerSubMenu } from "../../components/index.jsx";
import { DropdownIcon, MoreIcon, PlusIcon } from "../../assets/Vocabulary/index.jsx";
import vocabularyService from "../../services/Vocabulary/vocabularyService";

export default function Dashboard() {
    const [lists, setLists] = useState([]);
    const [visibleRows, setVisibleRows] = useState(2);
    const [columns, setColumns] = useState(3);
    const [activeListId, setActiveListId] = useState(null);


    const navigate = useNavigate();

    const handleCreateNewList = async () => {
        try {
            const payload = {
                title: "Untitled List",
                description: "",
                privacy_setting: "private",
                tags: [],
            };

            const res = await vocabularyService.createList(payload);
            const listId = res?.data?.list?.id;

            if (listId) {
                navigate(`/vocabulary/create/${listId}`); //  Navigate với ID
            } else {
                alert("Failed to create new list.");
                console.log("Response:", res);
            }
        } catch (error) {
            console.error("Error creating list:", error);
            alert("Something went wrong. Please try again.");
        }
    };

    // Dummy data
    // useEffect(() => {
    //     const dummyData = Array.from({ length: 20 }).map((_, i) => ({
    //         title: "IELTS Academic Vocabulary",
    //         description:
    //             "A helpful list of commonly used English words to boost your reading and speaking skills",
    //         owner: "Mia Nguyen Le",
    //         role: "Teacher",
    //     }));
    //     setLists(dummyData);
    // }, []);

    useEffect(() => {
        async function fetchLists() {
            try {
                const res = await vocabularyService.getMyLists();
                setLists(res.map(list => ({
                    id: list.id,
                    title: list.title,
                    description: list.description,
                    owner: list.creator?.display_name || "Unknown",
                    role: list.creator?.role || "unknown",  
                })));
            } catch (err) {
                console.error("Failed to fetch lists:", err);
            }
        }

        fetchLists();
    }, []);

    useEffect(() => {
        const updateColumns = () => {
            const grid = document.querySelector(".dashboard__list-grid");
            const card = document.querySelector(".dashboard__list-card");
            if (grid && card) {
                const gridWidth = grid.offsetWidth;
                const cardWidth = card.offsetWidth;
                const col = Math.floor(gridWidth / cardWidth);
                if (col > 0) setColumns(col);
            }
        };

        updateColumns();
        window.addEventListener("resize", updateColumns);
        return () => window.removeEventListener("resize", updateColumns);
    }, []);

    const visibleCount = columns * visibleRows;

    const handleSeeMore = () => {
        setVisibleRows((prev) => prev + 2);
    };

    return (
        <div className="dashboard">
            <Header />
            <LearnerSubMenu />
            <div className="dashboard__content">
                <SideBar />

                <div className="dashboard__main">
                    <div className="dashboard__topbar">
                        <button className="dashboard__create-button" onClick={handleCreateNewList}>
                            <img src={PlusIcon} alt="plus" />
                            Create New List
                        </button>

                        <div className="dashboard__filter-bar">
                            <span className="dashboard__list-count">All lists: {lists.length}</span>
                            <button className="dashboard__filter-button">
                                Filter by
                                <img src={DropdownIcon} alt="dropdown" />
                            </button>
                        </div>
                    </div>

                    <div className="dashboard__list-grid">
                        {lists.slice(0, visibleCount).map((list, idx) => (
                            <div className="dashboard__list-card" key={list.id || idx}>
                                <div className="dashboard__list-header">
                                    <button className="dashboard__list-title" onClick={() => navigate(`/vocabulary/overview/${list.id}`)}>
                                        {list.title.length > 20
                                            ? list.title.slice(0, 20) + "..."
                                            : list.title}
                                    </button>
                                    <div className="dashboard__more-button-wrapper">
                                        <button
                                            className="dashboard__more-button"
                                            onClick={() => setActiveListId((prevId) => (prevId === list.id ? null : list.id))}
                                        >
                                            <img src={MoreIcon} alt="more" className="more-icon" />
                                        </button>

                                        {activeListId === list.id && (
                                            <div className="dashboard__more-popup">
                                            <div
                                                className="more-option delete"
                                                onClick={async () => {
                                                const confirmed = window.confirm("Are you sure you want to delete this list?");
                                                if (!confirmed) return;

                                                try {
                                                    await vocabularyService.deleteList(list.id);
                                                    // Cập nhật lại list trong Dashboard
                                                    setLists(prev => prev.filter(item => item.id !== list.id));
                                                    setActiveListId(null);
                                                } catch (err) {
                                                    console.error("Delete failed:", err);
                                                    alert("Failed to delete list.");
                                                }
                                                }}
                                            >
                                                Delete List
                                            </div>
                                            </div>
                                        )}
                                    </div>

                                </div>
                                <p className="dashboard__list-description">
                                    {list.description }
                                </p>
                                <div className="dashboard__list-footer">
                                    <div className="dashboard__user">
                                        <div className="avatar" />
                                        <div>
                                            <div className="username">{list.owner}</div>
                                            {list.role && (
                                            <div className={`role ${list.role.toLowerCase()}`}>
                                                {list.role.charAt(0).toUpperCase() + list.role.slice(1)}
                                            </div>
                                            )}
                                        </div>
                                    </div>
                                    <button className="dashboard__overview-btn" onClick={() => navigate(`/vocabulary/overview/${list.id}`)}>Overview list</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {visibleCount < lists.length && (
                        <div className="dashboard__see-more">
                            <button onClick={handleSeeMore}>
                                See more <img src={DropdownIcon} alt="more" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}
