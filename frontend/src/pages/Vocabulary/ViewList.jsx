import { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import { Header, SideBar, Footer } from "../../components";
import vocabularyService from "../../services/Vocabulary/vocabularyService";
import { UploadImage, MoreIcon, ShareIcon, DropdownIcon } from "../../assets/Vocabulary";
import { SearchBarPattern } from "../../assets/icons/index"
import { useConfirm } from "../../components/ConfirmProvider.jsx";
import { useToast } from "../../components/ToastProvider.jsx";


export default function ViewList() {
  const [listInfo, setListInfo] = useState(null);
  const [words, setWords] = useState([]);
  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const [showShareBox, setShowShareBox] = useState(false);
  const [showMoreBox, setShowMoreBox] = useState(false);
  const { listId } = useParams();

  const confirm = useConfirm();
  const toast = useToast();


  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast("Copied to clipboard", "success");
    } catch (err) {
      console.error("Copy failed", err);
    }
  };


  useEffect(() => {
    async function fetchData() {
      try {
        const info = await vocabularyService.getListById(listId);
        setListInfo(info);

        const wordData = await vocabularyService.getWordsByListId(listId);

        // DUMMY thống kê
        const wordsWithStatistic = wordData.map((word) => ({
          ...word,
          statistic: {
            reviewed: Math.floor(Math.random() * 10) + 1,
            accuracy: Math.floor(Math.random() * 100),
            lastReviewed: "2025-07-15",
            nextReview: "2025-07-25",
          },
        }));
        
        setWords(wordsWithStatistic);

      } catch (err) {
        console.error("Error fetching list info or words:", err);
      }
    }
    fetchData();
  }, [listId]);

  return (
    <div className="view-list">
      <Header />
      <div className="view-list__content">
        <SideBar />
        <main className="view-list__main">
          {listInfo && (
            <>
              <div className="view-list__header">
                <div className="view-list__title-row">
                    <div className="view-list__title">{listInfo.title}</div>

                    <div className="view-list__title-actions">
                        <div className="options-wrapper">
                          <button className="icon-button" onClick={() => setShowMoreBox(!showMoreBox)}>
                            <img src={MoreIcon} alt="more" />
                          </button>

                          {showMoreBox && listInfo && (
                            <div className="view-list__more-popup">
                              <div
                                className="more-option edit"
                                onClick={() => window.location.href = `/vocabulary/edit/${listInfo.id}`}
                              >
                                Edit List
                              </div>
                              <div
                                className="more-option delete"
                                onClick={async () => {
                                  confirm("Are you sure you want to delete this list?").then(confirmed => {
                                    if (!confirmed) return;
                                    try {
                                      vocabularyService.deleteList(listInfo.id);
                                      window.location.href = "/dashboard";
                                    } catch (err) {
                                      console.error("Failed to delete:", err);
                                      toast("Failed to delete list.", "error");
                                    }
                                  });
                                
                                }}
                              >
                                Delete List
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="options-wrapper">  
                            <button
                            className="icon-button"
                            onClick={() => setShowShareBox(!showShareBox)}
                            >
                            <img src={ShareIcon} alt="share" />
                            </button>

                            {showShareBox && listInfo && (
                            <div className="view-list__share-popup">
                                <div
                                className="share-option"
                                onClick={() => handleCopy(`https://localhost:5173/vocabulary/view/${listInfo.id}`)}
                                >
                                https://localhost:5173/vocabulary/view/{listInfo.id}
                                </div>
                            </div>
                            )}
                        </div>
                    </div>

                </div>

                {listInfo.tags && listInfo.tags.length > 0 && (
                    <div className="view-list__tags">
                        {listInfo.tags.map((tag, index) => (
                        <span key={index} className="overview-list__tag">{tag}</span>
                        ))}
                    </div>
                    )}
                    <div className="view-list__creator">
                    Created by: {listInfo.creator?.display_name}
                </div>

                <div className="view-list__date">
                  Date: {new Date(listInfo.created_at).toLocaleDateString()}
                </div>
              </div>

              <div className="view-list__privacy-row">
              <div className="view-list__privacy">
                  <span className="view-list__privacy-label">Privacy:</span>
                  <span className="view-list__privacy-badge">
                  {listInfo.privacy_setting === "classroom"
                      ? "Classroom - only"
                      : capitalize(listInfo.privacy_setting)}
                  </span>
              </div>
              <button
                  className="view-list__review-button"
                  onClick={() => window.location.href = "/review/list-id"}
              >
                  Review now
              </button>
              </div>
              
              <div className="view-list__line" />

              <section className="view-list__description">
                <h2>Description</h2>
                <div>{listInfo.description}</div>
              </section>

              <section className="view-list__controls">
              <div className="view-list__search">
                  <img src={SearchBarPattern} alt="Search" className="view-list__search-icon" />
                  <input
                  type="text"
                  placeholder="Enter word you want to find"
                  className="view-list__search-input"
                  />
              </div>
              <div className="view-list__sort">
                  <span>Sort by</span>
                  <img src={DropdownIcon} alt="Sort dropdown" />
              </div>
              </section>

              <section className="view-list__words">    
                <h2>Word List ({listInfo.wordCount} words)</h2>
                <div className="view-list__word-list">
                  {words.length === 0 ? (
                    <div className="view-list__empty">This list currently has no words.</div>
                  ) : (
                  words.map((word, index) => (
                    <div key={word.id} className="view-list__word-box">
                      <div className="view-list__word-box--index">{index + 1}</div>
                      <hr className="view-list__word-box--divider" />

                      <div className="view-list__word-box--row">
                        <div className="view-list__word-box--field">
                          <input type="text" value={word.term} readOnly />
                          <small className="input-note">Terminology</small>
                        </div>

                        <div className="view-list__word-box--field">
                          <input type="text" value={word.definition} readOnly />
                          <small className="input-note">Definition</small>
                        </div>

                        <div className="view-list__word-box--field">
                          <input type="text" value={word.phonetics || ""} readOnly />
                          <small className="input-note">Phonetics</small>
                        </div>
                      </div>
                      
                      <div className="view-list__word-box--row">
                        <div className="view-list__word-box--field">
                            <input type="text" value={word.example || ""} readOnly />
                            <small className="input-note">Example</small>
                        </div>
                      </div>

                      {word.statistic && (
                        <div className="view-list__word-box--stat">
                          <div className="stat-label">Statistic:</div>
                          <div className="stat-detail">
                            <div className="column">
                              <div><strong>Reviewed:</strong> {word.statistic.reviewed} times</div>
                              <div><strong>Accuracy:</strong> {word.statistic.accuracy}%</div>
                            </div>
                            <div className="column">
                              <div><strong>Last reviewed:</strong> {word.statistic.lastReviewed}</div>
                              <div><strong>Next review:</strong> {word.statistic.nextReview}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )))}
                </div>
              </section>
            </>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}
