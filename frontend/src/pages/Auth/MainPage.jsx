import Header from "../../components/Layout/Header";
import Footer from "../../components/Layout/Footer";
import "../../assets/icons/index";
import { Link, Outlet } from "react-router-dom";
import {
  Pattern1,
  Pattern2,
  Pattern3,
  Pattern4,
  Pattern5,
  Pattern6,
  Pattern7,
  Pattern8,
} from "../../assets/icons/index";
import {
  PatternCard1,
  PatternCard2,
  PatternCard3,
} from "../../assets/icons/index";
import {
  Group41,
  Group52,
  Group53,
  Group56,
  Group78,
} from "../../assets/icons/index";
import { Union, Vector, Group8 } from "../../assets/icons/index";
import { useEffect } from "react";
import { useToast } from "../../components/Providers/ToastProvider";

const patterns = {
  1: Pattern1,
  2: Pattern2,
  3: Pattern3,
  4: Pattern4,
  5: Pattern5,
  6: Pattern6,
  7: Pattern7,
  8: Pattern8,
};

const patternsCard = {
  1: PatternCard1,
  2: PatternCard2,
  3: PatternCard3,
};

const Group = {
  1: Group41,
  2: Group52,
  3: Group53,
  4: Group56,
  5: Group78,
};

export default function MainPage() {
  const showToast = useToast();

  // Check for logout notifications on component mount (fallback for users landing on mainpage)
  useEffect(() => {
    const logoutReason = sessionStorage.getItem("logoutReason");
    if (logoutReason) {
      let message = "";
      switch (logoutReason) {
        case "manual":
          message = "You have been successfully logged out.";
          showToast(message, "success");
          break;
        case "expired":
          message = "Your session has expired. Please log in again.";
          showToast(message, "error");
          break;
        case "unauthorized":
          message = "Your session is invalid. Please log in again.";
          showToast(message, "error");
          break;
        case "unverified":
          message = "Please verify your email address before logging in.";
          showToast(message, "error");
          break;
        case "verification_error":
          message = "Unable to verify account status. Please try again.";
          showToast(message, "error");
          break;
        default:
          break;
      }
      // Clear the logout reason after showing notification
      sessionStorage.removeItem("logoutReason");
    }
  }, [showToast]);

  return (
    <div className="main-page">
      <Header />
      <Outlet />
      {/* trang thu nhat */}
      <div className="top-pattern">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
          <img
            src={patterns[num]}
            alt={`pattern${num}`}
            className={`pattern${num}`}
          />
        ))}
      </div>

      <div className="main-info">
        <div className="content">
          <h1>HELLO!</h1>
          <h2>Welcome to our website</h2>
          <p>
            Boost your English vocabulary with VocaBoost — a smart learning
            platform that uses Spaced Repetition, flashcards, fill-in-the-blank
            exercises, and word associations to help you remember words faster
            and longer.
          </p>
          <Link to="/signup" className="get-started">
            Get started
          </Link>
        </div>

        <div className="pattern-card-container">
          <div className="pattern-card">
            {[3, 2, 1].map((num) => (
              <img
                src={patternsCard[num]}
                alt={`pattern${num}`}
                className={`pattern-card${num}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="slogan">
        <img src={Group[1]} alt={`group1`} className={`group1`} />
      </div>

      {/* struggling with English vocabulary */}
      <div className="struggling">" Struggling with English vocabulary "</div>
      <div className="---">---</div>
      <div className="dont-worry">Don't worry</div>

      <div className="slogans-grid">
        {[2, 3, 4].map((num) => (
          <img src={Group[num]} alt={`group${num}`} className={`group${num}`} />
        ))}
      </div>

      {/* there is new way to learn  */}
      <div className="there-is">There is</div>
      <div className="a-new-way-to-learn">
        <div className="a">A</div>
        <div className="new">new</div>
        <div className="way">way</div>
        <div className="to">to</div>
        <div className="learn">learn</div>
      </div>

      <img src={Group[5]} alt="group5" className="group5" />
      <div className="boxes">
        <div className="boxes-fill-in-blank">
          <h1>Fill in blank</h1>
          <img src={Union} alt="Union" />
          <div className="content">
            Learn new words by actively using them in context.
            <br />
            Train your brain to recognize how and where a word is used.
          </div>
        </div>

        <div className="boxes-flashcard">
          <h1>Flashcard</h1>
          <img src={Vector} alt="Vector" />
          <div className="content">
            Fast-paced review with visuals and examples. <br /> Flip, remember,
            and repeat — the classic made smarter.
          </div>
        </div>

        <div className="boxes-word-association">
          <h1>Word Association</h1>
          <img src={Group8} alt="Group8" className="group8" />
          <div className="content">
            Boost your vocabulary by learning new words. <br /> Link them with
            related ideas, images, or concepts.
          </div>
        </div>
      </div>

      <div className="ready-to-start">
        <div className="so-you-ready-to-start">So you ready to start?</div>
        <Link to="/signup" className="get-started">
          Get started
        </Link>
      </div>
      <Footer />
    </div>
  );
}
