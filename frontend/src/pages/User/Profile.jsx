import { useState, useEffect } from "react";
import { useAuth } from "../../services/Auth/authContext";
import { useToast } from "../../components/ToastProvider";
import { Footer, Header, SideBar } from "../../components/index.jsx";
import LoadingCursor from "../../components/cursor/LoadingCursor";
import userService from "../../services/User/userService";

const Profile = () => {
  const { user } = useAuth();
  const showToast = useToast();

  // Form state
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    dailyGoal: "",
    avatarFile: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  // Load user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const data = await userService.getProfile();
        setUserProfile(data.data);

        // Populate form with existing data
        setFormData({
          displayName: data.data.display_name || "",
          email: data.data.email || "",
          dailyGoal: data.data.user_settings?.daily_goal || "",
          avatarFile: null,
        });
      } catch (error) {
        console.error("Error loading profile:", error);
        showToast("Error loading profile data", "error");
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user, showToast]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updateData = {
        displayName: formData.displayName,
        dailyGoal: parseInt(formData.dailyGoal) || undefined,
      };

      // Include avatar file if selected
      if (formData.avatarFile) {
        updateData.avatar = formData.avatarFile;
      }

      await userService.updateProfile(updateData);

      showToast("Profile updated successfully", "success");
      setIsEditing(false);

      // Refresh profile data
      const updatedData = await userService.getProfile();
      setUserProfile(updatedData.data);
    } catch (error) {
      console.error("Error updating profile:", error);
      showToast(
        error.response?.data?.message || "Error updating profile",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, avatarFile: file }));
    }
  };

  const handleTeacherVerificationClick = () => {
    // Navigate to teacher verification form
    window.location.href = "/teacher-verification";
  };

  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }

  return (
    <div className="profile">
      <Header />
      <div className="profile__container">
        <div className="profile__sidebar">
          <SideBar />
        </div>

        <form className="profile__content" onSubmit={handleSave}>
          <LoadingCursor loading={isLoading} />

          <h2>My Profile</h2>
          
          {/* Profile Avatar */}
          <div className="avatar-section">
            <div className="profile-avatar">
              {userProfile?.avatar_url ? (
                <img
                  src={userProfile.avatar_url}
                  alt="Profile Avatar"
                  className="avatar-image"
                />
              ) : (
                <div className="avatar-placeholder">
                  {formData.displayName?.charAt(0)?.toUpperCase() ||
                    formData.email?.charAt(0)?.toUpperCase() ||
                    "?"}
                </div>
              )}
            </div>
            {isEditing && (
              <div className="avatar-upload">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  id="avatar-upload"
                  style={{ display: "none" }}
                />
                <label htmlFor="avatar-upload" className="upload-button">
                  Change Avatar
                </label>
              </div>
            )}
          </div>
          {/* Display Name */}
          <div className="form-group">
            <label>Display name:</label>
            <input
              name="displayName"
              type="text"
              value={formData.displayName}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="Jane Smith"
            />
          </div>

          {/* Phone Number - Display only (not editable via API) */}
          {userProfile?.phone_number && (
            <div className="form-group">
              <label>Phone number:</label>
              <input
                type="tel"
                value={userProfile.phone_number}
                disabled={true}
                className="readonly"
              />
            </div>
          )}

          {/* Email (readonly) */}
          <div className="form-group">
            <label>Gmail:</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              disabled={true}
              className="readonly"
            />
          </div>

          {/* Password - Display only placeholder (API doesn't support password update) */}
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              value="Jane Smith"
              disabled={true}
              className="readonly"
            />
          </div>

          {/* Daily Learning Goals */}
          <div className="form-group form-group__daily-goal">
            <label>Daily learning goals:</label>
            <input
              name="dailyGoal"
              type="number"
              min="1"
              max="1000"
              value={formData.dailyGoal}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="10"
            />
            <small className="field-description">
              Maximum words you can review in a single session (1-1000)
            </small>
          </div>

          {/* Teacher Verification Status */}
          {userProfile?.teacherVerification && (
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
                  className="verification-button"
                  onClick={handleTeacherVerificationClick}
                >
                  Click here to submit or update your teacher verification form
                  <span className="arrow">›</span>
                </button>
              </div>
            </div>
          )}

          {/* School - Display only for verified teachers */}
          {userProfile?.teacherVerification?.status === "approved" &&
            userProfile?.teacherVerification?.institution && (
              <div className="form-group">
                <label>School:</label>
                <input
                  type="text"
                  value={userProfile.teacherVerification.institution}
                  disabled={true}
                  className="readonly"
                />
              </div>
            )}

          {/* School Email - Display only for verified teachers */}
          {userProfile?.teacherVerification?.status === "approved" &&
            userProfile?.school_email && (
              <div className="form-group">
                <label>School Email:</label>
                <input
                  type="email"
                  value={userProfile.school_email}
                  disabled={true}
                  className="readonly"
                />
              </div>
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
                  // Reset form to original values
                  if (userProfile) {
                    setFormData({
                      displayName: userProfile.display_name || "",
                      email: userProfile.email || "",
                      dailyGoal:
                        userProfile.user_settings?.daily_goal || "",
                      avatarFile: null,
                    });
                  }
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="save-btn"
                disabled={isLoading}
              >
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
