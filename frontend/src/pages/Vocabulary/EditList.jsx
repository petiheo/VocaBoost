import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header, SideBar, Footer, AccountPageInput } from "../../components/index.jsx";
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
    const [originalList, setOriginalList] = useState(null);
    const [originalWords, setOriginalWords] = useState([]);
    const [selectedWordIds, setSelectedWordIds] = useState(new Set());

    const handleDeleteWord = async (index) => {
        const confirmed = window.confirm("Are you sure you want to delete this word?");
        if (!confirmed) return;

        setWords(prev => prev.filter((_, i) => i !== index)); // cập nhật UI
    };


    useEffect(() => {
        async function fetchData() {
            const tags = await vocabularyService.getAllTags();
            setAvailableTags(tags);

            const list = await vocabularyService.getListById(listId);
            const words = await vocabularyService.getWordsByListId(listId);

            const mappedWords = await Promise.all(
            words.map(async (w) => {
                const examples = await vocabularyService.getExamplesByWordId(w.id);
                return {
                id: w.id,
                term: w.term,
                definition: w.definition,
                phonetics: w.phonetics || "",
                image: w.image_url || "",
                example: examples?.[0]?.example_sentence || "",
                };
            })
            );

            setTitle(list.title);
            setDescription(list.description);
            setPrivacy(list.privacy_setting);
            setSelectedTags(list.tags || []);
            setWords(mappedWords);

            setOriginalList({
                title: list.title,
                description: list.description,
                privacy: list.privacy_setting, 
                tags: list.tags || [],
            });
            setOriginalWords(mappedWords);
        }
        fetchData();
    }, [listId]);

    const handleUpdateList = async (e) => {
    e.preventDefault(); 

    try {
        if (!title.trim() || !description.trim()) {
        alert("Title and description are required.");
        return;
        }

        const hasInvalid = words.some(word => !word.term?.trim() || !word.definition?.trim());
        if (hasInvalid) {
        alert("Each word must have both term and definition.");
        return;
        }

        const updatePayload = {
        title,
        description,
        privacy_setting: privacy,
        tags: selectedTags,
        };

        await vocabularyService.updateList(listId, updatePayload);

        // Xoá những từ đã bị xoá local
        const originalWordIds = new Set(originalWords.map(w => w.id));
        const currentWordIds = new Set(words.filter(w => w.id).map(w => w.id));
        const deletedWordIds = [...originalWordIds].filter(id => !currentWordIds.has(id));

        for (const deletedId of deletedWordIds) {
        await vocabularyService.deleteWord(deletedId);
        }

        // Xử lý update + thêm mới
        for (const word of words) {
        const wordPayload = {
            term: word.term,
            definition: word.definition,
            phonetics: word.phonetics || "",
            ...(word.image ? { image_url: word.image } : {}),
        };

        if (word.id) {
        await vocabularyService.updateWord(word.id, wordPayload);

        if (word.example?.trim().length >= 10) {
            // Nếu có example mới → thêm
            await vocabularyService.addExample(word.id, word.example);
        } else if (word.exampleId) {
            // Nếu user xoá example (input trống) → xoá khỏi DB
            await vocabularyService.deleteExample(word.exampleId);
        }
        }

        }

        alert("List updated successfully!");
        navigate("/vocabulary");

    } catch (err) {
        console.error("Error updating list:", err.response?.data || err.message);
        alert("Failed to update list.");
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
                <form className="edit-list__form">
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
                    {selectedWordIds.size > 0 && (
                        <div className="edit-list__delete-wrapper">
                            <button
                                type="button"
                                className="edit-list__delete-selected"
                                onClick={() => {
                                const confirmed = window.confirm("Delete selected words?");
                                if (!confirmed) return;
                                setWords(words.filter((word) => !selectedWordIds.has(word.id)));
                                setSelectedWordIds(new Set());
                                }}  
                            >
                                Delete selected
                            </button>
                        </div>
                    )}
                    <div className="edit-list__word-list">
                          {words.map((word, index) => (
                            <div
                                key={word.id || index}
                                className={`edit-list__word-box ${selectedWordIds.has(word.id) ? 'edit-list__word-box--selected' : ''}`}
                                onClick={(e) => {
                                    // Để không click nhầm nút bên trong (như nút xoá), dùng stopPropagation khi cần
                                    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'SELECT' && !e.target.closest('label')) {
                                    const updated = new Set(selectedWordIds);
                                    if (updated.has(word.id)) {
                                        updated.delete(word.id);
                                    } else {
                                        updated.add(word.id);
                                    }
                                    setSelectedWordIds(updated);
                                    }
                                }}
                            >
                            <div className="edit-list__word-box--header">
                                <div className="edit-list__word-box--index">{index + 1}</div>
                                    <button
                                        className="edit-list__word-box--remove"
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation(); // ngăn click xoá làm toggle chọn
                                            handleDeleteWord(index);
                                        }}
                                        >
                                        ×
                                    </button>
                            </div>
                            <hr className="edit-list__word-box--divider" />

                            <div className="edit-list__word-box--row">
                                <div className="edit-list__word-box--field">
                                <AccountPageInput
                                    type="text"
                                    name={`term-${index}`}
                                    value={word.term || ""}
                                    onChange={(e) => handleWordChange(index, "term", e.target.value)}
                                />
                                <small className="input-note">Terminology</small>
                                </div>

                                <div className="edit-list__word-box--field">
                                <AccountPageInput
                                    type="text"
                                    name={`definition-${index}`}
                                    value={word.definition || ""}
                                    onChange={(e) => handleWordChange(index, "definition", e.target.value)}
                                />
                                <small className="input-note">Definition</small>
                                </div>

                                <div className="edit-list__word-box--field">
                                <AccountPageInput
                                    type="text"
                                    name={`phonetics-${index}`}
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
                                <AccountPageInput
                                    type="text"
                                    name={`example-${index}`}
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
                            onClick={() => {
                                    if (!originalList) return;
                                    const confirmed = window.confirm("Discard all changes?");
                                    if (!confirmed) return;

                                    setTitle(originalList.title);
                                    setDescription(originalList.description);
                                    setPrivacy(originalList.privacy);
                                    setSelectedTags(originalList.tags);
                                    setWords(originalWords);
                                    navigate("/vocabulary");
                                }}
                        />
                        <input
                            type="button"
                            value="Save Changes"
                            className="edit-list__form--submit"
                            onClick={handleUpdateList}
                        />
                    </div>
                </form>
            </div>
            <Footer />
        </div>
    );
}
