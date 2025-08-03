import { useNavigate } from 'react-router-dom';

export default function VocabularyListCard({
  listId,
  title,
  description,
  username,
  avatarUrl,
  role,
  buttonContent,
  completionDate,
  result
}) {
  const navigate = useNavigate();

  const handleReviewClick = () => {
    if (listId) {
      buttonContent === 'Overview' ? navigate(`/`) : navigate(`/signin`);
    } else {
      console.error("Cannot navigate: list.id is missing.");
    }
  };

  return (
    <div className="vocab-card">
      <h4 className="vocab-title">{title}</h4>
      <p className="vocab-desc">{description}</p>
      {completionDate ? (
        <>
          <span className="vocab-completion-date">{completionDate !== "N/A" ? (`Completion date: ${completionDate}`) : ("")}</span>
          <span className="vocab-result">{result !== "0%" ? (`Result: ${result}`) : ("")}</span>
        </>
      ) : (<></>)}
      <div className="vocab-footer">
        <div className="user-block">
          <div className="avatar">
            {avatarUrl ?
              (<img src={avatarUrl} alt="Avatar" className="avatar img" /> // Dung hinh anh 
              ) : (
                <span className="avatar placeholder">
                  {username.charAt(0).toUpperCase() || "?"}
                </span> // dung chu cai dau cua email 
              )}
          </div>
          <div className="user-info">
            <span className="username">{username}</span>
            <span className="role-tag">{role}</span>
          </div>
        </div>

        <button className="btn review-btn" onClick={handleReviewClick} >{buttonContent}</button>
      </div>
    </div>
  );
}
