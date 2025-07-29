import { SearchBarPattern } from "../assets/icons/index"

const SearchBar = ({value, onChange, placeHolder}) => {
  return (
    <div className="searchbar-container">
      <img src={SearchBarPattern} alt="searchbar-pattern" width="16px"/>
      <input
        type="text"
        className="searchbar-input"
        placeholder={placeHolder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;
