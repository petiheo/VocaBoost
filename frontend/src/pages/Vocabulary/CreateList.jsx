import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header, SideBar, Footer} from "../../components/index.jsx";
import { UploadImage } from "../../assets/Vocabulary";
import vocabularyService from "../../services/Vocabulary/vocabularyService";
import Select from "react-select";

export default function CreateList() {
    const [privacy, setPrivacy] = useState("private");
    const navigate = useNavigate();

    const [words, setWords] = useState([
        { term: "", definition: "", example: "", image: null, tag: "" },
        { term: "", definition: "", example: "", image: null, tag: "" },
        { term: "", definition: "", example: "", image: null, tag: "" },
    ]);

    const { listId } = useParams();


    const [availableTags, setAvailableTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]); // array of strings  // selected tags
    const [selectedWordIds, setSelectedWordIds] = useState(new Set());

    useEffect(() => {
    async function fetchTags() {
        const tags = await vocabularyService.getAllTags();
        setAvailableTags(tags);
    }
    fetchTags();
    }, []);

    
    const handleDeleteWord = async (index) => {
        const confirmed = window.confirm("Are you sure you want to delete this word?");
        if (!confirmed) return;

        setWords(prev => prev.filter((_, i) => i !== index)); // cập nhật UI
    };


    const handleCreateList = async (e) => {
        e.preventDefault();
        const title = e.target["list-title"].value;
        const description = e.target["description"].value;

        const data = {
        title,
        description,
        privacy_setting: privacy,
        tags: selectedTags,
        };

        try {
        console.log("Sending to backend:", data);

        let actualListId = listId;
        let createdList;

        if (!actualListId) {
            const res = await vocabularyService.createList(data);
            createdList = res?.data?.list;
            if (!createdList?.id) {
                throw new Error("Failed to create new list");
            }
            actualListId = createdList.id;
        } else {
            await vocabularyService.updateList(actualListId, data);
            createdList = { id: actualListId };
        }

        const validWords = words.filter(w => w.term && w.definition);

        if (validWords.length > 0) {
            // Bước 1: Thêm từ hàng loạt
            const wordPayload = {
            listId: listId,
            words: validWords.map(w => ({
                term: w.term,
                definition: w.definition,
                phonetics: w.phonetics || "",
                image_url: w.image || "",
            })),
            };

            await vocabularyService.addWordsBulk(wordPayload);

            // Bước 2: Lấy lại danh sách từ từ backend để có ID
            const insertedWords = await vocabularyService.getWordsByListId(createdList.id);

            // Bước 3: Thêm ví dụ nếu có
            const exampleRequests = validWords.map((wordInput) => {
            const match = insertedWords.find(
                w => w.term === wordInput.term && w.definition === wordInput.definition
            );
            if (match && wordInput.example && wordInput.example.trim().length >= 10) {
                return vocabularyService.addExample(match.id, wordInput.example);
            }
            return null;
            });

            await Promise.all(exampleRequests.filter(Boolean));
        }

        // Điều hướng hoặc thông báo sau khi tạo thành công
        alert("List created successfully!");
        
        navigate("/vocabulary");

        } catch (err) {
        console.error("Error creating list:", err);
        alert("Failed to create list.");
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

        if (res?.url) {
        const updated = [...words];
        updated[index].image = res.url;
        setWords(updated);

        alert("✅ Image uploaded successfully!");
        } else {
        alert("❌ Upload failed: No URL returned.");
        }
    } catch (err) {
        console.error("Image upload failed", err);
        alert("❌ Image upload failed.");
    }
    };


    return (
        <div className="create-list">
            <Header />
            <div className="create-list__content">
                <SideBar />
                <form className="create-list__form" onSubmit={handleCreateList}>
                    <h1 className="create-list__header">Create new list</h1>

                    <textarea
                        className="create-list__form--title"
                        name="list-title"
                        placeholder="Enter a title – For example ‘Intro to SE - chapter 5’"
                        required
                    />

                    <textarea
                        className="create-list__form--description"
                        name="description"
                        placeholder="Description:..."
                        required
                    />

                    <div className="create-list__privacy-section">
                        <label className="create-list__sub-header">Privacy:</label>
                        <div className="create-list__privacy-section--buttons">
                            {['private', 'public'].map((option) => (
                                <button
                                    key={option}
                                    type="button"
                                    className={`create-list__privacy-button ${privacy === option ? 'active' : ''}`}
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

                    <h1 className="create-list__header">Add words</h1>
                    {selectedWordIds.size > 0 && (
                        <div className="create-list__delete-wrapper">
                            <button
                                type="button"
                                className="create-list__delete-selected"
                                onClick={() => {
                                const confirmed = window.confirm("Delete selected words?");
                                if (!confirmed) return;
                                setWords(words.filter((_, i) => !selectedWordIds.has(i)));
                                setSelectedWordIds(new Set());
                                }}  
                            >
                                Delete selected
                            </button>
                        </div>
                    )}
                    <div className="create-list__word-list">
                            {words.map((word, index) => (
                                <div
                                    key={word.id || index}
                                    className={`create-list__word-box ${selectedWordIds.has(index) ? 'create-list__word-box--selected' : ''}`}
                                    onClick={(e) => {
                                        // Để không click nhầm nút bên trong (như nút xoá), dùng stopPropagation khi cần
                                        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'SELECT' && !e.target.closest('label')) {
                                        const updated = new Set(selectedWordIds);
                                        if (updated.has(index)) {
                                            updated.delete(index);
                                        } else {
                                            updated.add(index);
                                        }
                                        setSelectedWordIds(updated);
                                        }
                                    }}
                                >
                                <div className="create-list__word-box--header">
                                    <div className="create-list__word-box--index">{index + 1}</div>
                                        <button
                                            className="create-list__word-box--remove"
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation(); // ngăn click xoá làm toggle chọn
                                                handleDeleteWord(index);
                                            }}
                                            >
                                            ×
                                        </button>
                                </div>

                                <hr className="create-list__word-box--divider" />
                                <div className="create-list__word-box--row">
                                    <div className="create-list__word-box--field">
                                        <input
                                            type="text"
                                            placeholder=""
                                            value={word.term || ""}
                                            onChange={(e) => handleWordChange(index, "term", e.target.value)}
                                        />
                                        <small className="input-note">Terminology</small>
                                    </div>

                                    <div className="create-list__word-box--field">
                                        <input
                                            type="text"
                                            placeholder=""
                                            value={word.definition || ""}
                                            onChange={(e) => handleWordChange(index, "definition", e.target.value)}
                                        />
                                        <small className="input-note">Definition</small>
                                    </div>

                                    <div className="create-list__word-box--field">
                                        <input
                                            type="text"
                                            placeholder=""
                                            value={word.phonetics || ""}
                                            onChange={(e) => handleWordChange(index, "phonetics", e.target.value)}
                                        />
                                        <small className="input-note">Phonetics</small>
                                    </div>

                                <label className="create-list__upload-btn">
                                {word.image ? (
                                <img src={UploadedImage} alt="uploaded icon" className="preview-img" />
                                ) : (
                                <img src={UploadImage} alt="upload icon" />
                                )}

                                <input
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    onChange={(e) => handleImageUpload(e.target.files[0], index)}
                                />
                                </label>
                                </div>
                                <div className="create-list__word-box--row">
                                    <div className="create-list__word-box--field">
                                        <input
                                            type="text"
                                            placeholder=""
                                            value={word.example}
                                            onChange={(e) => handleWordChange(index, "example", e.target.value)}
                                        />
                                        <small className="input-note">An example in context</small>
                                    </div>
                                    <button type="button" className="create-list__ai-btn">AI</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="create-list__add-button-wrapper">
                        <button type="button" className="create-list__add-button" onClick={handleAddWord}>
                            Add word
                        </button>
                    </div>

                    <div className="create-list__actions">
                    <input
                        className="create-list__form--submit"
                        type="submit"
                        value="Create List"
                    />
                    </div>

                </form>
            </div>

            <Footer />
        </div>
    );
}
