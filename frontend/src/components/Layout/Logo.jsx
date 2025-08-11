import { Link } from "react-router-dom";
import MainPageLogo from "../../assets/Logo.svg";
import { useAuth } from "../../services/Auth/authContext";
import { getLogoRoute } from "../../utils/navigationUtils";

const Logo = () => {
  const { user } = useAuth();
  const logoRoute = getLogoRoute(user);

  return (
    <Link to={logoRoute} className="site-title">
      <img src={MainPageLogo} alt="Vocaboost Logo" className="logo" />
    </Link>
  );
};

export default Logo;
