import { useNavigate } from 'react-router-dom';

export default function VocabularyListCard({
  listId,
  title,
  description,
  username,
  avatarUrl,
  role,
  nextReview,
  buttonContent,
  completionDate,
  result
}) {

  return (
    <div className="vocab-card">
      <h4 className="vocab-title">{title}</h4>
      <p className="vocab-desc">{description}</p>
      {completionDate ? (
        <>
          <span className="vocab-completion-date">{completionDate !== "N/A" ? (`Completion date: ${completionDate}`) : ("")}</span>
          <span className="vocab-result">{result !== "0%" ? (`Result: ${result}`) : ("")}</span>
        </>
      ): (<></>)}
      { nextReview ? (
        <>
        <span className="vocab-next-review">{completionDate !== "N/A" ? (`Next review in ${nextReview} days`):("")}</span>
        </>
      ): (<></>)}
      <div className="vocab-footer">
        <div className="user-block">
          <div className="avatar">
            {avatarUrl ?
              (<img src={avatarUrl} alt="Avatar" className="avatar img" /> // Dung hinh anh 
              ) : (
                <span className="avatar placeholder">
                  {username?.charAt(0).toUpperCase() || "?"}
                </span> // dung chu cai dau cua email 
              )}
          </div>
          <div className="user-info">
            <span className="username">{username}</span>
            <span className="role-tag">{role}</span>
          </div>
        </div>

        <button className="btn review-btn" >{buttonContent}</button>
      </div>
    </div>
  );
}
