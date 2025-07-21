import { useEffect, useState } from "react";
import { Header, SideBar, Footer } from "../../components";
import vocabularyService from "../../services/Vocabulary/vocabularyService";
import { RightMoreIcon, TotalWordIcon, CategoryIcon, TimeIcon, LearnerIcon } from "../../assets/Vocabulary";


export default function OverviewList() {
  const [listInfo, setListInfo] = useState(null);
  const [words, setWords] = useState([]);
  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

    // DUMMY DATA for testing
  useEffect(() => {
    const dummyList = {
      id: "erg-mgn-qwe",
      title: "IELTS Academic Vocabulary - Set 1",
      description: "This list focuses on key academic words often found in scientific articles and exam reading passages. Great for learners preparing for IELTS or TOEFL.",
      creator: {
        display_name: "Mr. John Nguyen",
      },
      created_at: "2025-07-03T12:00:00.000Z",
      privacy_setting: "classroom",
      wordCount: 6,
      tags: ["IELTS", "Academic", "Vocabulary"],
    };

    const dummyWords = [
      {
        id: "1",
        term: "Analyze",
        definition: "To examine something in detail for purposes of explanation.",
        phonetics: "/ˈænəlaɪz/",
      },
      {
        id: "2",
        term: "Hypothesis",
        definition: "A proposed explanation based on limited evidence.",
        phonetics: "/haɪˈpɒθəsɪs/",
      },
      {
        id: "3",
        term: "Variable",
        definition: "An element that can be changed and may affect the outcome.",
        phonetics: "/ˈvɛəriəbl/",
      },
      {
        id: "4",
        term: "Methodology",
        definition: "A system of methods used in a particular area of study.",
        phonetics: "/ˌmɛθəˈdɒlədʒi/",
      },
      {
        id: "5",
        term: "Data",
        definition: "Facts and statistics collected for reference or analysis.",
        phonetics: "/ˈdeɪtə/",
      },
      {
        id: "6",
        term: "Synthesize",
        definition: "To combine different ideas to form a coherent whole.",
        phonetics: "/ˈsɪnθəsaɪz/",
      }
    ];

    setListInfo(dummyList);
    setWords(dummyWords);
    
  }, []);

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
                    <button className="overview-list__button outline">Add to my list</button>
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
