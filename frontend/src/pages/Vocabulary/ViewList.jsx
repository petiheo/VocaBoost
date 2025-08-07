import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { SearchBarPattern } from "../../assets/icons/index";
import {
  DropdownIcon,
  MoreIcon,
  ShareIcon,
} from "../../assets/Vocabulary";
import { Footer, Header, SideBar, ViewListSkeleton } from "../../components";
import { useConfirm } from "../../components/Providers/ConfirmProvider.jsx";
import { useToast } from "../../components/Providers/ToastProvider.jsx";
import useClickOutside from "../../hooks/useClickOutside";
import vocabularyService from "../../services/Vocabulary/vocabularyService";

export default function ViewList() {
  const [listInfo, setListInfo] = useState(null);
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const [showShareBox, setShowShareBox] = useState(false);
  const [showMoreBox, setShowMoreBox] = useState(false);
  const { listId } = useParams();

  // Refs for click outside functionality
  const morePopupRef = useRef(null);
  const sharePopupRef = useRef(null);

  const confirm = useConfirm();
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);

  // Click outside handlers
  useClickOutside(morePopupRef, () => setShowMoreBox(false), showMoreBox);
  useClickOutside(sharePopupRef, () => setShowShareBox(false), showShareBox);

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
        setLoading(true);
        const info = await vocabularyService.getListById(listId);
        setListInfo(info);

        const wordData = await vocabularyService.getWordsByListId(listId);

        // Map example data and add dummy statistics
        const wordsWithStatistic = wordData.map((word) => ({
          ...word,
          // Map the example sentence from the vocabulary_examples table
          example: word.vocabulary_examples?.example_sentence || "",
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
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [listId]);

  return (
    <div className="view-list">
      <Header />
      <div className="view-list__content">
        <SideBar isOpen={isOpen} setIsOpen={setIsOpen} />
        <main className="view-list__main">
          {loading ? (
            <ViewListSkeleton />
          ) : (
            listInfo && (
              <>
                <div className="view-list__header">
                  <div className="view-list__title-row">
                    <div className="view-list__title">{listInfo.title}</div>

                    <div className="view-list__title-actions">
                      <div className="options-wrapper" ref={morePopupRef}>
                        <button
                          className="icon-button"
                          onClick={() => setShowMoreBox(!showMoreBox)}
                        >
                          <img src={MoreIcon} alt="more" />
                        </button>

                        {showMoreBox && listInfo && (
                          <div className="view-list__more-popup">
                            <div
                              className="more-option edit"
                              onClick={() =>
                                (window.location.href = `/vocabulary/edit/${listInfo.id}`)
                              }
                            >
                              Edit List
                            </div>
                            <div
                              className={`more-option delete ${isDeleting ? "deleting" : ""}`}
                              onClick={async () => {
                                if (isDeleting) return;
                                const confirmed = await confirm(
                                  "Are you sure you want to delete this list?"
                                );
                                if (!confirmed) return;

                                setIsDeleting(true);
                                try {
                                  await vocabularyService.deleteList(
                                    listInfo.id
                                  );
                                  toast("List deleted successfully", "success");
                                  window.location.href = "/vocabulary";
                                } catch (err) {
                                  console.error("Failed to delete:", err);
                                  toast("Failed to delete list.", "error");
                                  setIsDeleting(false);
                                }
                              }}
                            >
                              {isDeleting ? "Deleting..." : "Delete List"}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="options-wrapper" ref={sharePopupRef}>
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
                              onClick={() =>
                                handleCopy(
                                  `https://localhost:5173/vocabulary/view/${listInfo.id}`
                                )
                              }
                            >
                              https://localhost:5173/vocabulary/view/
                              {listInfo.id}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {listInfo.tags && listInfo.tags.length > 0 && (
                    <div className="view-list__tags">
                      {listInfo.tags.map((tag, index) => (
                        <span key={index} className="overview-list__tag">
                          {tag}
                        </span>
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
                    onClick={() => (window.location.href = `/review/${listId}`)}
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
                    <img
                      src={SearchBarPattern}
                      alt="Search"
                      className="view-list__search-icon"
                    />
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
                      <div className="view-list__empty">
                        This list currently has no words.
                      </div>
                    ) : (
                      words.map((word, index) => (
                        <div key={word.id} className="view-list__word-box">
                          <div className="view-list__word-box--index">
                            {index + 1}
                          </div>
                          <hr className="view-list__word-box--divider" />

                          <div className="view-list__word-box--row">
                            <div className="view-list__word-box--field">
                              <input type="text" value={word.term} readOnly />
                              <small className="input-note">Terminology</small>
                            </div>

                            <div className="view-list__word-box--field">
                              <input
                                type="text"
                                value={word.definition}
                                readOnly
                              />
                              <small className="input-note">Definition</small>
                            </div>

                            <div className="view-list__word-box--field">
                              <input
                                type="text"
                                value={word.phonetics || ""}
                                readOnly
                              />
                              <small className="input-note">Phonetics</small>
                            </div>
                          </div>

                          <div className="view-list__word-box--row">
                            <div className="view-list__word-box--field">
                              <input
                                type="text"
                                value={word.example || ""}
                                readOnly
                              />
                              <small className="input-note">
                                Example
                                {word.vocabulary_examples?.ai_generated && (
                                  <span
                                    className="ai-badge"
                                    title="Generated by AI"
                                  >
                                    {" "}
                                    generated by AI ✨
                                  </span>
                                )}
                              </small>
                            </div>
                          </div>

                          {word.statistic && (
                            <div className="view-list__word-box--stat">
                              <div className="stat-label">Statistic:</div>
                              <div className="stat-detail">
                                <div className="column">
                                  <div>
                                    <strong>Reviewed:</strong>{" "}
                                    {word.statistic.reviewed} times
                                  </div>
                                  <div>
                                    <strong>Accuracy:</strong>{" "}
                                    {word.statistic.accuracy}%
                                  </div>
                                </div>
                                <div className="column">
                                  <div>
                                    <strong>Last reviewed:</strong>{" "}
                                    {word.statistic.lastReviewed}
                                  </div>
                                  <div>
                                    <strong>Next review:</strong>{" "}
                                    {word.statistic.nextReview}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </>
            )
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}
