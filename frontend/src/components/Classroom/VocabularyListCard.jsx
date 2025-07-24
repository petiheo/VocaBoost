export default function VocabularyListCard({
  title,
  description,
  username,
  role,
  reviewProgress,
  completionDate, 
  result
}) {
  return (
    <div className="vocab-card">
      <h4 className="vocab-title">{title}</h4>
      <p className="vocab-desc">{description}</p>
      <span className="vocab-completion-date">{completionDate !== "N/A" ? (`Completion date: ${completionDate}`):("")}</span>
      <span className="vocab-result">{result !== "0%" ? (`Result: ${result}`):("")}</span>

      <div className="vocab-footer">
        <div className="user-block">
          <div className="avatar" />
          <div className="user-info">
            <span className="username">{username}</span>
            <span className="role-tag">{role}</span>
          </div>
        </div>

        <button className="btn review-btn">Review ({reviewProgress})</button>
      </div>
    </div>
  );
}
