import { useState, useEffect, useRef } from 'react';
import { Header, SideBar, Footer } from '../../../components';
import classroomService from '../../../services/Classroom/classroomService';
import { useNavigate } from 'react-router-dom';
import vocabularyService from '../../../services/Vocabulary/vocabularyService'

function AssignExercise() {
    // Truy xuất dữ liệu lớp học được lưu khi users chọn classroom ở trang MyClassroom. 
    const [classroomId, setClassroomId] = useState(() => {
        const selectedClassroom = JSON.parse(localStorage.getItem("selectedClassroom"));
        return selectedClassroom?.id || null;
    });

    // Xử lý phần method
    const [method, setMethod] = useState('Fill-in-blank');

    // Xử lý phần ngày tháng
    const today = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(today);
    const [dueDate, setDueDate] = useState(today);

    // Xử lý phần tìm kiếm vocabulary list 
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedVocabId, setSelectedVocabId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showError, setShowError] = useState(false);
    const dropdownRef = useRef(null);
    
    // Xử lý việc lấy data vocab của giáo viên 
    const [vocabList, setVocabList] = useState([]);

    useEffect(() => {
        const fetchVocabularyList = async () => {
            try {
                const res = await vocabularyService.getMyLists();
                if (res?.success && Array.isArray(res.data.lists)) {
                    setVocabList(res.data.lists)
                }
            } catch (error) {
                console.error("Lỗi khi lấy danh sách lớp học:", error);
            }
        }
        fetchVocabularyList();
    }, [])
    
    // Xử lý thanh chọn list từ vựng
    const filteredOptions = vocabList.filter(lists =>
        lists.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (option) => {
        // setSelectedVocab(option);
        setSelectedVocabId(option.id)
        setSearchTerm(option.title);
        setDropdownOpen(false);
        setShowError(false);
    };


    const handleBlur = () => {
        if (!vocabList.some(lists => lists.toLowerCase() === searchTerm.toLowerCase())) {
            setShowError(true);
            setSelectedVocabId(null);
        } else {
            setShowError(false);
        }
    };

    // Xử lý method truyền cho back end
    const methodMapping = {
        "Flashcard": "flashcard",
        "Fill-in-blank": "fill_blank",
        "Word Association": "word_association"
    };

    const navigate = useNavigate();
    const [errors, setErrors] = useState({});

    const handleCreateAssignment = async (e) => {
        e.preventDefault();
        const vocabListId = selectedVocabId // chinh lai thanh id
        const title = searchTerm;
        const wordsPerReview = parseInt(e.target["words_per_review"].value);
        const formatDate = (dateStr) => new Date(`${dateStr}T10:00:00Z`).toISOString();


        const newErrors = {};

        if (startDate >= dueDate) {
            newErrors.date = "The start date must be different from the due date.";
        }

        if (title.length === 0) {
            newErrors.title = "The title cannot be empty.";
        }

        if (Object.keys(newErrors).length > 0) {
            console.log("Oke");
            setErrors(newErrors);
            return;
        }

        const data = {
            vocabListId,
            title,
            exerciseMethod: methodMapping[method],
            wordsPerReview,
            startDate: formatDate(startDate),
            dueDate: formatDate(dueDate)
        };

        console.log(
            data.vocabListId, data.title, data.exerciseMethod, data.wordsPerReview, data.startDate, data.dueDate
        );

        try {
            const res = await classroomService.createAssignment(classroomId, data);
            console.log("Tao assignemnt thanh cong")
            navigate("/classroom/assignment-page");

        } catch (error) {
            console.error(error.message);
        }

    }


    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);




    return (
        <div className="assign-exercise">
            <Header />
            <div className="assign-exercise__container">
                <div className="assign-exercise__sidebar">
                    <SideBar />
                </div>

                <form className="assign-exercise__content" onSubmit={handleCreateAssignment}>

                    <h2>Assign Excercise</h2>
                    <div className="form-group">
                        <label>Vocabulary List</label>
                        <div className="dropdown" ref={dropdownRef}>
                            <input
                                className="dropdown-input"
                                name="vocabulary-list"
                                type="text"
                                value={searchTerm}
                                placeholder="Enter list you want to find"
                                // required
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setDropdownOpen(true);
                                }}
                                autoComplete="off"
                                onFocus={() => setDropdownOpen(true)} 
                                onBlur={handleBlur}
                            />
                            {dropdownOpen && filteredOptions.length > 0 && (
                                <div className="dropdown-options">
                                    {filteredOptions.map((option) => (
                                        <div
                                            key={option.id}
                                            className="option"
                                            onMouseDown={() => handleSelect(option)}
                                        >
                                            {option.title}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {dropdownOpen && filteredOptions.length === 0 && (
                                <div className="dropdown-options">
                                    <div className="option">No matching vocabulary list found</div>
                                </div>
                            )}
                        </div>
                        {(errors.title || showError) && <div className="input-error">{errors.title}</div>}
                    </div>

                    <div className="form-group method-select">
                        <label>Excercise Method</label>
                        <div className="methods">
                            {['Flashcard', 'Fill-in-blank', 'Word Association'].map(m => (
                                <button
                                    key={m}
                                    className={method === m ? 'active' : ''}
                                    onClick={() => setMethod(m)}
                                    type="button"
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-group__word">
                        <label>Word per review (from 5 to 30):</label>
                        <input
                            className='form-group__word-number'
                            name="words_per_review"
                            type="number"
                            min={5}
                            max={30}
                            step={1}
                            defaultValue={20}
                            // Xử lý dữ liệu nhập vào
                            onChange={(e) => {
                                if (parseInt(e.target.value) > 30) {
                                    e.target.value = 30;
                                }
                                else if (parseInt(e.target.value) < 5) {
                                    e.target.value = 5;
                                }
                            }}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            min={today}
                            onChange={(e) => setStartDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Due Date</label>
                        <input
                            type="date"
                            value={dueDate}
                            min={today}
                            onChange={(e) => setDueDate(e.target.value)}
                            required
                        />
                        {errors.date && <div className="input-error">{errors.date}</div>}
                    </div>

                    <input className="assign-btn"
                        type="submit"
                        value="Assign to classroom"
                    />
                </form>
            </div>
            <Footer />
        </div>
    );
};

export default AssignExercise;
