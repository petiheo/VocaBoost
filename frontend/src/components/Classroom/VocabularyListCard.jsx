import { useNavigate } from 'react-router-dom';

export default function VocabularyListCard({
  listId,
  title,
  description,
  username,
  role,
  avatar_url,
  nextReview,
  buttonContent,
  completionDate, 
  result
}) {

  const avatarStyle = {
    // Nếu có avatar_url, dùng nó làm ảnh nền. Nếu không, dùng ảnh mặc định.
    backgroundImage: `url(${avatar_url})`,

    // Các thuộc tính này đảm bảo ảnh luôn đẹp, không bị méo
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  return (
    <div className="vocab-card">
      <h4 className="vocab-title">{title}</h4>
      <p className="vocab-desc">{description}</p>
      { completionDate ? (
        <>
        <span className="vocab-completion-date">{completionDate !== "N/A" ? (`Completion date: ${completionDate}`):("")}</span>
        <span className="vocab-result">{result !== "0%" ? (`Result: ${result}`):("")}</span>
        </>
      ): (<></>)}
      { nextReview ? (
        <>
        <span className="vocab-next-review">{completionDate !== "N/A" ? (`Next review in ${nextReview} days`):("")}</span>
        </>
      ): (<></>)}
      <div className="vocab-footer">
        <div className="user-block">
          <div className="avatar" style={avatarStyle} />
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
