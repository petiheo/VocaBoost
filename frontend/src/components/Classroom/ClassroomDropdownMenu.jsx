import { useNavigate, useLocation } from "react-router-dom";

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
        <option value="/learners/pending-request">Pending Request</option>
        <option value="/learners/learners-list">Learner list</option>
        <option value="/learners/approve-join-classroom-request">Learner’s Request</option>
      </select>
    </div>
  );
};

export default ClassroomDropdownMenu;
