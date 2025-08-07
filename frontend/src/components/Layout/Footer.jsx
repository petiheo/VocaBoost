import { Link } from "react-router-dom";
import Logo from "../../assets/Logo.svg";

const Footer = () => {
  return (
    <div className="footer">
      <div className="footer-left">
        <Link to="/homepage">
          <img src={Logo} alt="logo" className="logo" />
        </Link>
        <div className="support-button-list">
          <Link to="/signin" className="about">
            About
          </Link>
          <Link to="/signin" className="carees">
            Careers
          </Link>
          <Link to="/signin" className="pres">
            Press
          </Link>
          <Link to="/signin" className="custom-care">
            Custom Care
          </Link>
          <Link to="/signin" className="service">
            Service
          </Link>
        </div>
      </div>
      <div className="footer-right"></div>
    </div>
  );
};

export default Footer;
