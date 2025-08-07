import { Link } from "react-router-dom";
import { useState } from "react";
import { DropdownArrow } from "../../assets/icons/index";
import DropdownMenu from "../Navigation/DropdownMenu";

const NavBar = () => {
  // Searching component
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Truy xuất dữ liệu flash card ở đây
  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (searchTerm.trim()) {
      console.log("Searching: ", searchTerm);
    }
  };

  return (
    <nav className="navbar">
      {/* <form className="navbar__search" onSubmit={handleSearchSubmit}>
                <img src={Search} style={{width: '20px', height: '20px'}}/>
                <input
                    type="text"
                    placeholder="Tìm kiếm từ vựng..."
                    className="navbar__search-input"
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
            </form> */}
      <div className="navbar__contact">
        <Link to="/homepage" className="navbar__item">
          Contact
        </Link>
        <img src={DropdownArrow} alt="drop down arrow" />
      </div>
      <div className="navbar__support">
        <Link to="/homepage" className="navbar__item">
          Support
        </Link>
        <img src={DropdownArrow} alt="drop down arrow" />
      </div>
      <div className="navbar__pricing">
        <Link to="/createlist" className="navbar__item">
          Pricing
        </Link>
        <img src={DropdownArrow} alt="drop down arrow" />
      </div>
    </nav>
  );
};

export default NavBar;
