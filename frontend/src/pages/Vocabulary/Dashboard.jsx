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
    const [filterMode, setFilterMode] = useState(null); // 'alphabet' | 'tag' | null
    const [showFilterOptions, setShowFilterOptions] = useState(false);
    const [alphabetFilter, setAlphabetFilter] = useState(null);
    const [tagFilter, setTagFilter] = useState(null);
    const [tags, setAvailableTags] = useState([]);

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
                    tags: list.tags || [],
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

    const filteredLists = lists.filter(list => {
        const matchAlphabet = filterMode === "alphabet" && alphabetFilter
            ? list.title?.toLowerCase().startsWith(alphabetFilter.toLowerCase())
            : true;

        const matchTag = filterMode === "tag" && tagFilter
            ? (list.tags || []).includes(tagFilter)
            : true;

        return matchAlphabet && matchTag;
    });

    useEffect(() => {
        async function fetchTags() {
            const tags = await vocabularyService.getAllTags();
            setAvailableTags(tags);
        }
        fetchTags();
    }, []);

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

                        <div className="dashboard__filter-dropdown">
                            <div className="dashboard__filter-bar">
                                <span className="dashboard__list-count">All lists: {lists.length}</span>

                                <div className="dashboard__filter-dropdown">
                                    <button
                                    className="dashboard__filter-button"
                                    onClick={() => setShowFilterOptions(prev => !prev)}
                                    >
                                    Filter by
                                    <img src={DropdownIcon} alt="dropdown" />
                                    </button>

                                    {showFilterOptions && (
                                    <div className="dashboard__filter-options">
                                        <div onClick={() => {
                                        setFilterMode("alphabet");
                                        setShowFilterOptions(false);
                                        }} className="filter-option">Alphabet</div>

                                        <div onClick={() => {
                                        setFilterMode("tag");
                                        setShowFilterOptions(false);
                                        }} className="filter-option">Tag</div>

                                        <hr />

                                        <div onClick={() => {
                                        setFilterMode(null);
                                        setAlphabetFilter(null);
                                        setTagFilter(null);
                                        setShowFilterOptions(false);
                                        }} className="filter-option logout">Clear</div>
                                    </div>
                                    )}
                                </div>
                            </div>

                            {filterMode === "alphabet" && (
                            <div className="dashboard__alphabet-filter">
                                {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(char => (
                                <button
                                    key={char}
                                    className={`alphabet-button ${alphabetFilter === char ? "active" : ""}`}
                                    onClick={() => setAlphabetFilter(prev => prev === char ? null : char)}
                                >
                                    {char}
                                </button>
                                ))}
                            </div>
                            )}

                            {filterMode === "tag" && (
                            <div className="dashboard__tag-filter">
                                {tags.length === 0 ? (
                                <p className="no-tags">No tags available</p>
                                ) : (
                                tags.map(tag => (
                                    <button
                                    key={tag}
                                    className={`tag-button ${tagFilter === tag ? "active" : ""}`}
                                    onClick={() => setTagFilter(prev => prev === tag ? null : tag)}
                                    >
                                    {tag}
                                    </button>
                                ))
                                )}
                            </div>
                            )}
                        </div>
                    </div>

                    <div className="dashboard__list-grid">
                        {filteredLists.slice(0, visibleCount).map((list, idx) => (
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
