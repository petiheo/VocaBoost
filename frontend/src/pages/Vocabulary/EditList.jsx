import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header, SideBar, Footer } from "../../components/index.jsx";
import { UploadImage } from "../../assets/Vocabulary";
// import CreatableSelect from "react-select/creatable";
import Select from "react-select";
import vocabularyService from "../../services/Vocabulary/vocabularyService";

export default function EditList() {
    const { listId } = useParams();
    const navigate = useNavigate();

    const [privacy, setPrivacy] = useState("private");
    const [availableTags, setAvailableTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [words, setWords] = useState([]);

    const handleDeleteWord = async (wordId) => {
        const confirmed = window.confirm("Are you sure you want to delete this word?");
        if (!confirmed) return;

        try {
            await vocabularyService.deleteWord(wordId); // gọi backend
            setWords(prev => prev.filter(w => w.id !== wordId)); // cập nhật UI
        } catch (err) {
            console.error("Failed to delete word:", err);
            alert("Failed to delete word.");
        }
    };


    useEffect(() => {
        async function fetchData() {
            const tags = await vocabularyService.getAllTags();
            setAvailableTags(tags);

            const listRes = await vocabularyService.getListById(listId);
            const wordRes = await vocabularyService.getWordsByListId(listId);
            const list = listRes.data;
            const fetchedWords = wordRes.data;

            setTitle(list.title);
            setDescription(list.description);
            setPrivacy(list.privacy_setting);
            setSelectedTags(list.tags || []);
            setWords(fetchedWords.map(w => ({
                id: w.id,
                term: w.term,
                definition: w.definition,
                phonetics: w.phonetics || "",
                image: w.image_url || "",
                example: "", // cần lấy từ API nếu có example riêng
            })));
        }
        fetchData();
    }, [listId]);


    // useEffect(() => {
    // // Fake data for testing
    // setTitle("Dummy List for Test");
    // setDescription("This is a sample list for testing Edit view");
    // setPrivacy("private");
    // setSelectedTags(["ielts", "core-vocab"]);
    // setAvailableTags(["ielts", "core-vocab", "academic", "reading"]);

    // setWords([
    //     {
    //     id: "word-1",
    //     term: "Analyze",
    //     definition: "Examine in detail",
    //     phonetics: "/ˈænəlaɪz/",
    //     image: "", // hoặc link ảnh online
    //     example: "Please analyze the results.",
    //     },
    //     {
    //     id: "word-2",
    //     term: "Context",
    //     definition: "Surrounding situation",
    //     phonetics: "/ˈkɒntɛkst/",
    //     image: "",
    //     example: "Understand the context of this quote.",
    //     }
    // ]);
    // }, []);

    const handleUpdateList = async (e) => {
    e.preventDefault();
    try {
        const updatePayload = {
        title,
        description,
        privacy_setting: privacy,
        tags: selectedTags,
        };
        await vocabularyService.updateList(listId, updatePayload);

        for (const word of words) {
        // nếu từ đã tồn tại
        if (word.id) {
            const wordPayload = {
            term: word.term,
            definition: word.definition,
            phonetics: word.phonetics || "",
            image_url: word.image || "",
            };
            await vocabularyService.updateWord(word.id, wordPayload);

            // nếu có ví dụ, gọi thêm
            if (word.example && word.example.trim().length > 0) {
            await vocabularyService.addExample(word.id, word.example);
            }

        } else if (word.term && word.definition) {
            // nếu là từ mới
            const newWordPayload = {
            listId,
            term: word.term,
            definition: word.definition,
            phonetics: word.phonetics || "",
            image_url: word.image || "",
            };
            const newWord = await vocabularyService.addWord(newWordPayload);

            if (word.example && word.example.trim().length > 0) {
            await vocabularyService.addExample(newWord.id, word.example);
            }
        }
        }

        navigate("/dashboard");

    } catch (err) {
        console.error("Error updating list:", err);
    }
    };

    const handleWordChange = (index, field, value) => {
        const updated = [...words];
        updated[index][field] = value;
        setWords(updated);
    };

    const handleAddWord = () => {
        setWords([...words, { term: "", definition: "", phonetics: "", example: "", image: null }]);
    };

    const handleImageUpload = async (file, index) => {
        try {
            const formData = new FormData();
            formData.append("image", file);
            const res = await vocabularyService.uploadImage(formData);
            const updated = [...words];
            updated[index].image = res.url;
            setWords(updated);
        } catch (err) {
            console.error("Image upload failed", err);
        }
    };

    return (
        <div className="edit-list">
            <Header />
            <div className="edit-list__content">
                <SideBar />
                <form className="edit-list__form" onSubmit={handleUpdateList}>
                    <h1 className="edit-list__header">Edit List</h1>

                    <textarea
                        className="edit-list__form--title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />

                    <textarea
                        className="edit-list__form--description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />

                    <div className="edit-list__privacy-section">
                        <label className="edit-list__sub-header">Privacy:</label>
                        <div className="edit-list__privacy-section--buttons">
                            {['private', 'public'].map(option => (
                                <button
                                    key={option}
                                    type="button"
                                    className={`edit-list__privacy-button ${privacy === option ? 'active' : ''}`}
                                    onClick={() => setPrivacy(option)}
                                >
                                    {option.charAt(0).toUpperCase() + option.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Select
                        options={availableTags.map(tag => ({ value: tag, label: tag }))}
                        isMulti
                        placeholder="Choose tags"
                        value={selectedTags.map(tag => ({ value: tag, label: tag }))}
                        onChange={(selectedOptions) =>
                            setSelectedTags(selectedOptions.map(opt => opt.value))
                        }
                    />

                    <h2 className="edit-list__header">Words</h2>
                    <div className="edit-list__word-list">
                        {words.map((word, index) => (
                            <div key={word.id || index} className="edit-list__word-box">
                                <div className="edit-list__word-box--header">
                                    <div className="edit-list__word-box--index">{index + 1}</div>
                                    <button
                                    className="edit-list__word-box--remove"
                                    onClick={() => handleDeleteWord(word.id)}
                                    >
                                    ×
                                    </button>
                                </div>
                            <hr className="edit-list__word-box--divider" />

                            <div className="edit-list__word-box--row">
                                <div className="edit-list__word-box--field">
                                <input
                                    type="text"
                                    value={word.term || ""}
                                    onChange={(e) => handleWordChange(index, "term", e.target.value)}
                                />
                                <small className="input-note">Terminology</small>
                                </div>

                                <div className="edit-list__word-box--field">
                                <input
                                    type="text"
                                    value={word.definition || ""}
                                    onChange={(e) => handleWordChange(index, "definition", e.target.value)}
                                />
                                <small className="input-note">Definition</small>
                                </div>

                                <div className="edit-list__word-box--field">
                                <input
                                    type="text"
                                    value={word.phonetics || ""}
                                    onChange={(e) => handleWordChange(index, "phonetics", e.target.value)}
                                />
                                <small className="input-note">Phonetics</small>
                                </div>

                                <label className="edit-list__upload-btn">
                                <img
                                    src={word.image || UploadImage}
                                    alt="Uploaded"
                                    style={{ width: 30, height: 30, borderRadius: "8px" }}
                                />
                                <input
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    onChange={(e) => handleImageUpload(e.target.files[0], index)}
                                />
                                </label>
                            </div>

                            <div className="edit-list__word-box--row">
                                <div className="edit-list__word-box--field">
                                <input
                                    type="text"
                                    value={word.example}
                                    onChange={(e) => handleWordChange(index, "example", e.target.value)}
                                />
                                <small className="input-note">An example in context</small>
                                </div>
                                <button type="button" className="edit-list__ai-btn">AI</button>
                            </div>
                        </div>
                        ))}
                    </div>

                    <div className="edit-list__add-button-wrapper">
                        <button type="button" className="edit-list__add-button" onClick={handleAddWord}>
                            Add word
                        </button>
                    </div>

                    <div className="edit-list__actions">
                        <input
                            type="button"
                            value="Cancel"
                            className="edit-list__form--cancel"
                            onClick={() => navigate("/vocabulary")}
                        />
                        <input
                            type="submit"
                            value="Save Changes"
                            className="edit-list__form--submit"
                        />
                    </div>
                </form>
            </div>
            <Footer />
        </div>
    );
}
