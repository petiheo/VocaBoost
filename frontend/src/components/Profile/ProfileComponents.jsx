import PropTypes from "prop-types";

export function ProfileInput({
  label,
  name,
  type,
  value,
  onChange,
  disabled,
  className,
  placeholder,
  min,
  max,
  errors,
}) {
  const hasErrors = errors && errors.length > 0;
  const inputClassName =
    `${className || ""} ${hasErrors ? "error" : ""}`.trim();

  return (
    <div className="form-group">
      <label>{label}:</label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={inputClassName}
        placeholder={placeholder}
        min={min}
        max={max}
      />
      {hasErrors && (
        <div className="field-errors">
          {errors.map((error, index) => (
            <small key={index} className="error-message">
              {error}
            </small>
          ))}
        </div>
      )}
      {type === "number" && !hasErrors && (
        <small className="field-description">
          Maximum words you can review in a single session (1-1000)
        </small>
      )}
    </div>
  );
}

ProfileInput.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  placeholder: PropTypes.string,
  min: PropTypes.number,
  max: PropTypes.number,
  errors: PropTypes.arrayOf(PropTypes.string),
};

export function TeacherVerification({ userProfile, onVerificationClick }) {
  if (!userProfile?.teacherVerification) return null;

  const isVerified = userProfile.teacherVerification.status === "approved";

  return (
    <div className="form-group teacher-verification">
      <label>Teacher verification:</label>
      <div className="verification-status">
        <div className="status-row">
          <span
            className={`status-badge ${userProfile.teacherVerification.status}`}
          >
            {userProfile.teacherVerification.status === "approved"
              ? "Verified"
              : userProfile.teacherVerification.status === "pending"
                ? "Pending"
                : "Not Verified"}
          </span>
        </div>
        <button
          type="button"
          className={`verification-button ${isVerified ? "disabled" : ""}`}
          onClick={isVerified ? undefined : onVerificationClick}
          disabled={isVerified}
        >
          {isVerified
            ? "Your teacher account has been verified"
            : "Click here to submit or update your teacher verification form"}
          {!isVerified && <span className="arrow">›</span>}
        </button>
      </div>
    </div>
  );
}

TeacherVerification.propTypes = {
  userProfile: PropTypes.object.isRequired,
  onVerificationClick: PropTypes.func.isRequired,
};

export function ProfileAvatar({
  avatarUrl,
  displayName,
  email,
  isEditing,
  onAvatarChange,
  errors,
}) {
  const hasErrors = errors && errors.length > 0;

  return (
    <div className="avatar-section">
      <div className="profile-avatar">
        {avatarUrl ? (
          <img src={avatarUrl} alt="Profile Avatar" className="avatar-image" />
        ) : (
          <div className="avatar-placeholder">
            {displayName?.charAt(0)?.toUpperCase() ||
              email?.charAt(0)?.toUpperCase() ||
              "?"}
          </div>
        )}
      </div>
      {isEditing && (
        <div className="avatar-upload">
          <input
            type="file"
            accept="image/*"
            onChange={onAvatarChange}
            id="avatar-upload"
            style={{ display: "none" }}
          />
          <label
            htmlFor="avatar-upload"
            className={`upload-button ${hasErrors ? "error" : ""}`}
          >
            Change Avatar
          </label>
          {hasErrors && (
            <div className="field-errors">
              {errors.map((error, index) => (
                <small key={index} className="error-message">
                  {error}
                </small>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

ProfileAvatar.propTypes = {
  avatarUrl: PropTypes.string,
  displayName: PropTypes.string,
  email: PropTypes.string,
  isEditing: PropTypes.bool,
  onAvatarChange: PropTypes.func,
  errors: PropTypes.arrayOf(PropTypes.string),
};
