import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header, SideBar, Footer } from "../../components/index.jsx";
import CreateListInput from "../../components/CreateListInput.jsx";
import WordInput from "../../components/WordInput.jsx";
// import { UploadImage } from "../../assets/Vocabulary";
import vocabularyService from "../../services/Vocabulary/vocabularyService";
import Select from "react-select";
import { useConfirm } from "../../components/ConfirmProvider.jsx"; 
import { useToast } from "../../components/ToastProvider.jsx";
import { validateCreateListForm } from "../../utils/createListValidation.js";

export default function CreateList() {
    const [privacy, setPrivacy] = useState("private");
    const navigate = useNavigate();
    const confirm = useConfirm();
    const toast = useToast();

    // Form data state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [words, setWords] = useState([
        { term: "", definition: "", exampleSentence: "", image: null, tag: "", phonetics: "", synonyms: "", translation: "" },
        { term: "", definition: "", exampleSentence: "", image: null, tag: "", phonetics: "", synonyms: "", translation: "" },
        { term: "", definition: "", exampleSentence: "", image: null, tag: "", phonetics: "", synonyms: "", translation: "" },
    ]);

    // Validation state
    const [validationErrors, setValidationErrors] = useState({});

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

    function normalizeSynonyms(input) {
        if (!input) return [];

        if (typeof input === "string") {
            return input
                .split(",")
                .map((s) => s.trim())
                .filter((s) => s !== "");
        }

        return [];
    }

    
    const handleDeleteWord = async (index) => {
        confirm("Are you sure you want to delete this word?").then((confirmed) => {
            if (!confirmed) return;

        setWords(prev => prev.filter((_, i) => i !== index)); // cập nhật UI
        setSelectedWordIds(prev => {
            const newSelected = new Set(prev);
            newSelected.delete(words[index].id);
            return newSelected;
        });
    });
    };


    const handleCreateList = async (e) => {
        e.preventDefault();

        // Validate the entire form
        const validation = validateCreateListForm(title, description, words);
        setValidationErrors(validation.errors);

        if (!validation.isValid) {
            toast("Please fix the validation errors before submitting.", "error");
            return;
        }

        const data = {
            title,
            description,
            privacy_setting: privacy,
            tags: selectedTags,
        };
        
        try {
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
            listId: actualListId,
            words: validWords.map(w => ({
                term: w.term,
                definition: w.definition,
                phonetics: w.phonetics || "",
                // image_url: w.image || "",
                synonyms: normalizeSynonyms(w.synonyms),
                translation: w.translation || "",
                exampleSentence: w.exampleSentence || "",
            })),
            };

            await vocabularyService.createWordsBulk(wordPayload);

            // Bước 2: Lấy lại danh sách từ từ backend để có ID
            const insertedWords = await vocabularyService.getWordsByListId(createdList.id);

            // Cập nhật lại từ với ID mới
            const updatedWords = validWords.map((w, i) => ({
                ...w,
                id: insertedWords[i]?.id || null, // nếu không có ID thì để null
            }));

            setWords(updatedWords);

        }

        toast( "List created successfully!", "success");

        setTimeout(() => {
            navigate("/vocabulary");
        }, 2000); // Điều hướng sau 2 giây

        } catch (err) {
        console.error("Error creating list:", err);
        toast("Failed to create list. Please try again.", "error");
        }
    };


    const handleWordChange = (index, field, value) => {
        const updated = [...words];
        updated[index][field] = value;
        setWords(updated);

        // Clear validation errors for this specific field when user starts typing
        if (validationErrors.words?.[index]?.[field]) {
            setValidationErrors(prev => ({
                ...prev,
                words: {
                    ...prev.words,
                    [index]: {
                        ...prev.words[index],
                        [field]: undefined
                    }
                }
            }));
        }
    };

    const handleTitleChange = (e) => {
        setTitle(e.target.value);
        // Clear title validation errors when user starts typing
        if (validationErrors.title) {
            setValidationErrors(prev => ({
                ...prev,
                title: undefined
            }));
        }
    };

    const handleDescriptionChange = (e) => {
        setDescription(e.target.value);
        // Clear description validation errors when user starts typing
        if (validationErrors.description) {
            setValidationErrors(prev => ({
                ...prev,
                description: undefined
            }));
        }
    };

    const handleAddWord = () => {
        setWords([...words, { term: "", definition: "", phonetics: "", exampleSentence: "", image: null, synonyms: "", translation: "" }]);
    };

    // const handleImageUpload = async (file, index) => {
    // try {
    //     const formData = new FormData();
    //     formData.append("image", file);

    //     const res = await vocabularyService.uploadImage(formData);

    //     if (res?.url) {
    //     const updated = [...words];
    //     updated[index].image = res.url;
    //     setWords(updated);

    //     alert(" Image uploaded successfully!");
    //     } else {
    //     alert(" Upload failed: No URL returned.");
    //     }
    // } catch (err) {
    //     console.error("Image upload failed", err);
    //     alert(" Image upload failed.");
    // }
    // };


    return (
        <div className="create-list">
            <Header />
            <div className="create-list__content">
                <SideBar />
                <form className="create-list__form" onSubmit={handleCreateList}>
                    <h1 className="create-list__header">Create new list</h1>

                    <CreateListInput
                        label="Title"
                        name="list-title"
                        as="textarea"
                        value={title}
                        onChange={handleTitleChange}
                        placeholder="Enter a title – For example 'Intro to SE - chapter 5'"
                        required={true}
                        errors={validationErrors.title}
                        className="create-list__form--title"
                    />

                    <CreateListInput
                        label="Description"
                        name="description"
                        as="textarea"
                        value={description}
                        onChange={handleDescriptionChange}
                        placeholder="Description:..."
                        required={true}
                        errors={validationErrors.description}
                        className="create-list__form--description"
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
                                    confirm("Delete selected words?").then((confirmed) => {
                                        if (!confirmed) return;

                                        setWords(words.filter((_, i) => !selectedWordIds.has(i)));
                                        setSelectedWordIds(new Set());
                                    });
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
                                        <WordInput
                                            label="Term"
                                            name={`term-${index}`}
                                            type="text"
                                            placeholder="Enter the term"
                                            value={word.term || ""}
                                            onChange={(e) => handleWordChange(index, "term", e.target.value)}
                                            required={true}
                                            errors={validationErrors.words?.[index]?.term}
                                        />
                                    </div>

                                    <div className="create-list__word-box--field">
                                        <WordInput
                                            label="Definition"
                                            name={`definition-${index}`}
                                            type="text"
                                            placeholder="Enter the definition"
                                            value={word.definition || ""}
                                            onChange={(e) => handleWordChange(index, "definition", e.target.value)}
                                            required={true}
                                            errors={validationErrors.words?.[index]?.definition}
                                        />
                                    </div>

                                    <div className="create-list__word-box--field">
                                        <WordInput
                                            label="Phonetics"
                                            name={`phonetics-${index}`}
                                            type="text"
                                            placeholder="Enter phonetics (optional)"
                                            value={word.phonetics || ""}
                                            onChange={(e) => handleWordChange(index, "phonetics", e.target.value)}
                                            required={false}
                                            errors={validationErrors.words?.[index]?.phonetics}
                                        />
                                    </div>

                                {/* <label className="create-list__upload-btn">
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
                                </label> */}
                                </div>
                                <div className="create-list__word-box--row">
                                    <div className="create-list__word-box--field">
                                        <WordInput
                                            label="Synonyms"
                                            name={`synonyms-${index}`}
                                            type="text"
                                            placeholder="Enter synonyms separated by commas (optional)"
                                            value={word.synonyms || ""}
                                            onChange={(e) => handleWordChange(index, "synonyms", e.target.value)}
                                            required={false}
                                            errors={validationErrors.words?.[index]?.synonyms}
                                        />
                                    </div>

                                    <div className="create-list__word-box--field">
                                        <WordInput
                                            label="Translation"
                                            name={`translation-${index}`}
                                            type="text"
                                            placeholder="Enter translation (optional)"
                                            value={word.translation || ""}
                                            onChange={(e) => handleWordChange(index, "translation", e.target.value)}
                                            required={false}
                                            errors={validationErrors.words?.[index]?.translation}
                                        />
                                    </div>
                                </div>

                                <div className="create-list__word-box--row">
                                    <div className="create-list__word-box--field">
                                        <WordInput
                                            label="Example sentence"
                                            name={`exampleSentence-${index}`}
                                            type="text"
                                            placeholder="Enter an example sentence (optional)"
                                            value={word.exampleSentence || ""}
                                            onChange={(e) => handleWordChange(index, "exampleSentence", e.target.value)}
                                            required={false}
                                            errors={validationErrors.words?.[index]?.exampleSentence}
                                        />
                                    </div>
                                    <button type="button" className="create-list__ai-btn">AI</button>
                                </div>

                            </div>
                        ))}
                    </div>

                    <div className="create-list__add-button-wrapper">
                        <button type="button" className="create-list__add-button"  onClick={() => 
                            {
                                console.log("Word added successfully!");
                                handleAddWord();
                            }}>
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
