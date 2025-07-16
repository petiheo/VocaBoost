import { Link } from "react-router-dom";

import { SignUpElement } from "../../assets/icons/index"
import SignUpBackground from "../../assets/icons/SignUp/SignUpBackground.svg";
export default function CheckYourMail() {
    return (
        <div className="check-your-mail-container"
            style={{
                backgroundImage: `url(${SignUpBackground})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                minHeight: "100vh",
            }}>
            <div className="sign-up-successfully">Sign up successfully</div>
            <div className="check-your-mail">Check your mail!</div>
            <Link to="/signin" className="go-to-sign-in"> Go to sign in </Link>
            <img src={SignUpElement} alt="sign-up-element" className="sign-up-element" width="55%"  />
        </div>
    )
}