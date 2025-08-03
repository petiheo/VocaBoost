import { useState } from "react";
import { useAuth } from "../../services/Auth/authContext";
import { Footer, Header, SideBar } from "../../components/index.jsx";
import LoadingCursor from "../../components/UI/LoadingCursor.jsx";
import { useUserProfile } from "../../hooks/useUserProfile";
import {
  ProfileInput,
  TeacherVerification,
  ProfileAvatar,
} from "../../components/Profile/ProfileComponents";
import {
  validateProfile,
  validateDisplayName,
  validateDailyGoal,
  validateAvatarFile,
} from "../../utils/validation";

const Profile = () => {
  const { user } = useAuth();
  const { isLoading, userProfile, formData, setFormData, updateProfile } =
    useUserProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isOpen, setIsOpen] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Real-time validation
    let fieldErrors = [];
    if (name === "displayName") {
      fieldErrors = validateDisplayName(value);
    } else if (name === "dailyGoal") {
      fieldErrors = validateDailyGoal(value);
    }

    setValidationErrors((prev) => ({
      ...prev,
      [name]: fieldErrors.length > 0 ? fieldErrors : undefined,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // Validate all fields before submitting
    const validation = validateProfile(formData);
    setValidationErrors(validation.errors);

    if (!validation.isValid) {
      return; // Don't submit if validation fails
    }

    const updateData = {
      displayName: formData.displayName,
      dailyGoal: parseInt(formData.dailyGoal) || undefined,
      ...(formData.avatarFile && { avatar: formData.avatarFile }),
    };
    const success = await updateProfile(updateData);
    if (success) {
      setIsEditing(false);
      setValidationErrors({}); // Clear validation errors on success
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate avatar file
      const avatarErrors = validateAvatarFile(file);
      setValidationErrors((prev) => ({
        ...prev,
        avatar: avatarErrors.length > 0 ? avatarErrors : undefined,
      }));

      // Only create preview if file is valid
      if (avatarErrors.length === 0) {
        const previewUrl = URL.createObjectURL(file);
        setFormData((prev) => ({
          ...prev,
          avatarFile: file,
          avatarPreview: previewUrl,
        }));
      } else {
        // Clear file if invalid
        setFormData((prev) => ({
          ...prev,
          avatarFile: null,
          avatarPreview: null,
        }));
      }
    }
  };

  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }

  return (
    <div className="profile">
      <Header />
      <div className="profile__container">
        <div className="profile__sidebar">
          <SideBar isOpen={isOpen} setIsOpen={setIsOpen} />
        </div>

        <form className="profile__content" onSubmit={handleSave}>
          <LoadingCursor loading={isLoading} />

          <h2>My Profile</h2>

          <ProfileAvatar
            avatarUrl={formData.avatarPreview || userProfile?.avatar_url}
            displayName={formData.displayName}
            email={formData.email}
            isEditing={isEditing}
            onAvatarChange={handleAvatarChange}
            errors={validationErrors.avatar}
          />

          <ProfileInput
            label="Display name"
            name="displayName"
            type="text"
            value={formData.displayName}
            onChange={handleInputChange}
            disabled={!isEditing}
            placeholder="Jane Smith"
            errors={validationErrors.displayName}
          />

          {userProfile?.phone_number && (
            <ProfileInput
              label="Phone number"
              name="phone"
              type="tel"
              value={userProfile.phone_number}
              disabled={true}
              className="readonly"
            />
          )}

          <ProfileInput
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            disabled={true}
            className="readonly"
          />

          <ProfileInput
            label="Password"
            name="password"
            type="password"
            value="Jane Smith"
            disabled={true}
            className="readonly"
          />

          <ProfileInput
            label="Daily learning goals"
            name="dailyGoal"
            type="number"
            min={1}
            max={1000}
            value={formData.dailyGoal}
            onChange={handleInputChange}
            disabled={!isEditing}
            placeholder="10"
            errors={validationErrors.dailyGoal}
          />

          <TeacherVerification
            userProfile={userProfile}
            onVerificationClick={() =>
              (window.location.href = "/teacher-verification")
            }
          />

          {userProfile?.teacherVerification?.status === "approved" &&
            userProfile?.teacherVerification?.institution && (
              <ProfileInput
                label="School"
                name="school"
                type="text"
                value={userProfile.teacherVerification.institution}
                disabled={true}
                className="readonly"
              />
            )}

          {userProfile?.teacherVerification?.status === "approved" &&
            userProfile?.school_email && (
              <ProfileInput
                label="School Email"
                name="schoolEmail"
                type="email"
                value={userProfile.school_email}
                disabled={true}
                className="readonly"
              />
            )}

          {/* Action Buttons */}
          {!isEditing ? (
            <button
              type="button"
              className="edit-btn"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          ) : (
            <div className="button-group">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => {
                  setIsEditing(false);
                  // Clean up preview URL if it exists
                  if (formData.avatarPreview) {
                    URL.revokeObjectURL(formData.avatarPreview);
                  }
                  setFormData({
                    ...formData,
                    avatarFile: null,
                    avatarPreview: null,
                  });
                  setValidationErrors({}); // Clear validation errors
                }}
              >
                Cancel
              </button>
              <button type="submit" className="save-btn" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
