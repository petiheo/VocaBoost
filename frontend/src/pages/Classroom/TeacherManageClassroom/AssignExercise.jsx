import { useState, useEffect, useRef } from 'react';
import { Header, SideBar, Footer } from '../../../components';
import classroomService from '../../../services/Classroom/classroomService';

const vocabularyOptions = [
    'Unit 1 Vocabulary',
    'Unit 2 Vocabulary',
    'IELTS Academic',
    'Intro to SE - Chapter 5'
];

function AssignExercise() {
    // Truy xuất dữ liệu lớp học được lưu khi users chọn classroom ở trang MyClassroom. 
    const [classroomId, setClassroomId] = useState(() => {
        const selectedClassroom = JSON.parse(localStorage.getItem("selectedClassroom"));
        return selectedClassroom?.id || null;
    });

    // Xử lý phần tìm kiếm vocabulary list 
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedVocab, setSelectedVocab] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showError, setShowError] = useState(false);
    const dropdownRef = useRef(null);

    // Xử lý phần method
    const [method, setMethod] = useState('Fill-in-blank');

    // Xử lý phần ngày tháng
    const today = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(today);
    const [dueDate, setDueDate] = useState(today);

    const filteredOptions = vocabularyOptions.filter(option =>
        option.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (option) => {
        setSelectedVocab(option);
        setSearchTerm(option);
        setDropdownOpen(false);
        setShowError(false);
    };

    const handleBlur = () => {
        if (!vocabularyOptions.some(option => option.toLowerCase() === searchTerm.toLowerCase())) {
            setShowError(true);
        } else {
            setShowError(false);
        }
    };

    const handleCreateAssignment = async (e) => {
        e.preventDefault();
        const vocabListId = e.target["vocabulary-list"].value; // chinh lai thanh id
        const title = e.target["vocabulary-list"].value;
        const wordsPerReview = e.target["words_per_review"];

        const data = {
            vocabListId,
            title,
            exerciseMethod: method,
            wordsPerReview,
            startDate,
            dueDate
        };

        try {
            const res = await classroomService.createAssignment(classroomId, data);
            console.log("Tao assignemnt thanh cong")
            navigate("/classroom/assignment-page");

        } catch (error) {
            setErrors({ server: error.response?.data?.error || "Assignment error." });
            console.error(error);
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
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setDropdownOpen(true);
                                }}
                                onBlur={handleBlur}
                                placeholder="Enter list you want to find"
                                required
                            />
                            {dropdownOpen && filteredOptions.length > 0 && (
                                <div className="dropdown-options">
                                    {filteredOptions.map((option, idx) => (
                                        <div
                                            key={idx}
                                            className="option"
                                            onMouseDown={() => handleSelect(option)}
                                        >
                                            {option}
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
                        {showError && <div className="error">Vocabulary list does not exist.</div>}
                    </div>

                    <div className="form-group method-select">
                        <label>Excercise Method</label>
                        <div className="methods">
                            {['Flashcard', 'Fill-in-blank', 'Word Association'].map(m => (
                                <button
                                    key={m}
                                    className={method === m ? 'active' : ''}
                                    onClick={() => setMethod(m)}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>
                    <input type="hidden" name="method" value={method} />

                    <div className="form-group__word">
                        <label>Word per review:</label>
                        <input
                            className='form-group__word-number'
                            name="words_per_review"
                            type="number"
                            min={1}
                            max={100}
                            step={1}
                            defaultValue={20}
                            // Xử lý dữ liệu nhập vào
                            onChange={(e) => {
                                if (parseInt(e.target.value) > 100) {
                                    e.target.value = 100;
                                }
                                else if (parseInt(e.target.value) <= 0) {
                                    e.target.value = 1;
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
                            // popperPlacement="right-start"
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
