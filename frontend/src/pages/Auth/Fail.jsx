import { Link } from "react-router-dom";
import FailBackground from "../../assets/icons/Fail/FailBackground.svg";
import FailPattern from "../../assets/icons/Fail/FailPattern.svg";

export default function Fail() {
  return (
    <div
      className="fail-container"
      style={{
        backgroundImage: `url(${FailBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
      }}
    >
      <div className="theres-something-wrong">There’s something wrong!</div>
      <div className="the-request">
        The request could not be sent. Please try again later
      </div>
      <Link to="/homepage" className="go-to-home-page">
        {" "}
        Go to home page{" "}
      </Link>
      <img
        src={FailPattern}
        alt="fail-pattern"
        className="sign-up-element"
        width="30%"
      />
    </div>
  );
}
