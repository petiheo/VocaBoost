import { useState, useEffect, useRef } from 'react';
import { Header, SideBar, Footer } from '../../../components';

const vocabularyOptions = [
    'Unit 1 Vocabulary',
    'Unit 2 Vocabulary',
    'IELTS Academic',
    'Intro to SE - Chapter 5'
];

const AssignExercise = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedVocab, setSelectedVocab] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [method, setMethod] = useState('Fill-in-blank');
    const [showError, setShowError] = useState(false);
    const dropdownRef = useRef(null);

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
            <div className="assign-exercise__content">

                <h2>Assign Excercise</h2>
                <div className="form-group">
                    <label>Vocabulary List</label>
                    <div className="dropdown" ref={dropdownRef}>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setDropdownOpen(true);
                            }}
                            onBlur={handleBlur}
                            placeholder="Enter list you want to find"
                            className="dropdown-input"
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

                <div className="form-group__word">
                    <label>Word per review:</label>
                    <input type="number" defaultValue={20} min={1}
                        step={1}
                        max={100}
                        required
                        className='form-group__word-number' />
                </div>

                <div className="form-group">
                    <label>Start Date</label>
                    <input type="date" defaultValue="2025-07-03" required />
                </div>

                <div className="form-group">
                    <label>Due Date</label>
                    <input type="date" defaultValue="2025-07-03" required />
                </div>

                <button className="assign-btn">Assign to classroom</button>
            </div>
        </div>
        <Footer />
    </div>
);
};

export default AssignExercise;
