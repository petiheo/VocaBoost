import { Link } from "react-router-dom";

import { SignUpElement, SuccessfullyBackground } from "../../assets/icons/index"
export default function Successfully() {
    return (
        <div className="successfully-container"
            style={{
                backgroundImage: `url(${SuccessfullyBackground})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                minHeight: "100vh",
            }}>
            <div className="successfully">Successfully</div>
            <div className="your-verification">Your verification request has been submitted. We will respond within 1–2 business days</div>
            <Link to="/homepage" className="go-to-home-page"> Go to home page </Link>
            <img src={SignUpElement} alt="sign-up-element" className="sign-up-element" width="55%"  />
        </div>
    )
}