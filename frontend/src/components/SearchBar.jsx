import { SearchBarPattern } from "../assets/icons/index"

const SearchBar = () => {
  return (
    <div className="searchbar-container">
      <img src={SearchBarPattern} alt="searchbar-pattern" width="16px"/>
      <input
        type="text"
        className="searchbar-input"
        placeholder="Search"
      />
    </div>
  );
};

export default SearchBar;
