import { useLocation, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

const ClassroomDropdownMenu = ({ students }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="pending-request__filter-dropdown">
      <span>All lists: {students.length}</span>
      <select
        value={location.pathname}
        onChange={(e) => navigate(e.target.value)}
      >
        <option value="/classroom/learners-list">Learner list</option>
        <option value="/classroom/approve-join-classroom-request">
          Learner’s Request
        </option>
      </select>
    </div>
  );
};

ClassroomDropdownMenu.propTypes = {
  students: PropTypes.array.isRequired,
};

export default ClassroomDropdownMenu;
