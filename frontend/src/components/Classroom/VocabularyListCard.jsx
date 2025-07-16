export default function VocabularyListCard({
  title = "IELTS Academ...",
  description = "A helpful list of commonly used English words to boost your reading and speaking skills",
  username = "Username",
  role = "Teacher",
  reviewProgress = "2/5",
}) {
  return (
    <div className="vocab-card">
      <h4 className="vocab-title">{title}</h4>
      <p className="vocab-desc">{description}</p>

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
