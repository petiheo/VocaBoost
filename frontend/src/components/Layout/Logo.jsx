import { Link } from "react-router-dom";
import MainPageLogo from "../../assets/Logo.svg";

const Logo = () => (
  <Link to="/" className="site-title">
    <img src={MainPageLogo} alt="Vocaboost Logo" className="logo" />
  </Link>
);

export default Logo;
