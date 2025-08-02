import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Header, SideBar, Footer } from "../../components";
import vocabularyService from "../../services/Vocabulary/vocabularyService";
import { RightMoreIcon, TotalWordIcon, CategoryIcon, TimeIcon, LearnerIcon } from "../../assets/Vocabulary";
import { jwtDecode } from "jwt-decode"; // Thư viện để giải mã JWT
import { useToast } from "../../components/Providers/ToastProvider.jsx";


export default function OverviewList() {
  const { listId } = useParams(); // Lấy ID từ URL
  console.log("List ID from params:", listId); // Kiểm tra trong console
  const [listInfo, setListInfo] = useState(null);
  const [words, setWords] = useState([]);
  const toast = useToast(); 

  const currentUserId = localStorage.getItem("userId"); // hoặc lấy từ context
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const fetchListAndWords = async () => {
      try {
        const list = await vocabularyService.getListById(listId);
        const words = await vocabularyService.getWordsByListId(listId);

        const token = localStorage.getItem("token");
        const payload = token ? jwtDecode(token) : null;
        const userId = payload?.userId || payload?.id;
        const isMine = list.creator?.id === userId;

        setListInfo({
          ...list,
          title: list.title || "Untitled List",
          description: list.description || "No description provided.",
          creator: list.creator || { display_name: "Unknown" },
          wordCount: list.wordCount || words.length || 0,
          tags: list.tags || []
        });

        console.log("List creator:", list.creator?.id); // Kiểm tra thông tin danh sách
        console.log("Current user ID:", userId); // Kiểm tra ID người dùng hiện

        setWords(words || []);
        setIsOwner(isMine);
      } catch (error) {
        console.error("Failed to load list:", error);
      }
    };

    fetchListAndWords();
  }, [listId]);


  const handleAddToMyList = async () => {
    try {
      await vocabularyService.createList({
        title: listInfo.title,
        description: listInfo.description,
        tags: listInfo.tags,
        privacy_setting: "private",
        // có thể clone từ list gốc nếu bạn có cơ chế "copy list"
      });
      toast("Added to your lists.", "success");
    } catch (error) {
      console.error("Failed to add to list", error);
      toast("Failed to add.", "error");
    }
  };

  return (
    <div className="overview-list">
      <Header />
      <div className="overview-list__content">
        <SideBar />
        <main className="overview-list__main">
            {listInfo && (
            <>
              <div className="overview-list__header">
                <div className="overview-list__title">{listInfo.title}</div>

                {listInfo.tags && listInfo.tags.length > 0 && (
                    <div className="overview-list__tags">
                        {listInfo.tags.map((tag, index) => (
                        <span key={index} className="overview-list__tag">{tag}</span>
                        ))}
                    </div>
                    )}
                    <div className="overview-list__creator">
                    Created by: {listInfo.creator?.display_name}
                </div>
              </div>
              
              <div className="overview-list__line" />

              <section className="overview-list__description">
                <h2>Description</h2>
                <div>{listInfo.description}</div>
              </section>  

              <section className="overview-list__sample">
                  {words.length === 0 ? (
                    <div className="view-list__empty">This list currently has no words.</div>
                  ) : (
                    <>
                      <h2>Sample word</h2>
                      <div className="sample-table">
                          {words.slice(0, 5).map((word) => (
                          <div key={word.id} className="sample-row">
                              <div className="sample-cell sample-term"><strong>{word.term}</strong></div>
                              <div className="sample-cell sample-phonetics">{word.phonetics}</div>
                              <div className="sample-cell sample-definition">{word.definition}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                <button className="sample-view-button" onClick={() => window.location.href = `/vocabulary/view/${listInfo.id}`}>
                    View list to see more
                    <img src={RightMoreIcon} alt="arrow-icon" className="sapmple-view-button__icon"/>
                </button>
              </section>      

              <section className="overview-list__statistic">
                <h2>Statistic</h2>
                <div className="overview-list__stat-box">
                    <div className="overview-list__stat-item">
                    <img src={TotalWordIcon} alt="Total words" />
                    <span className="label">Total Words:</span> {listInfo.wordCount} words
                    </div>
                    <div className="overview-list__stat-item">
                    <img src={CategoryIcon} alt="Category" />
                    <span className="label">Category:</span>
                    {listInfo.tags?.map((tag, idx) => (
                        <span key={idx} className="overview-list__tag">{tag}</span>
                    ))}
                    </div>
                    <div className="overview-list__stat-item">
                    <img src={TimeIcon} alt="Estimated Time" />
                    <span className="label">Estimated Study Time:</span> 10 minutes
                    </div>
                    <div className="overview-list__stat-item">
                    <img src={LearnerIcon} alt="Learners" />
                    <span className="label">Learners Completed:</span> 128 learners
                    </div>
                </div>

                <div className="overview-list__actions">
                  {isOwner ? (
                    <button
                      className="overview-list__button outline"
                      onClick={() => window.location.href = `/vocabulary/edit/${listInfo.id}`}
                    >
                      Edit List
                    </button>
                  ) : (
                    <button
                      className="overview-list__button outline"
                      onClick={() => handleAddToMyList()}
                    >
                      Add to my list
                    </button>
                  )}
                  <button className="overview-list__button filled">Review now</button>
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
