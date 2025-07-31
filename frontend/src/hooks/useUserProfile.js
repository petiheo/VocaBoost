import { useState, useEffect } from "react";
import { useAuth } from "../services/Auth/authContext";
import { useToast } from "../components/ToastProvider";
import userService from "../services/User/userService";

export function useUserProfile() {
  const { user, setUser } = useAuth();
  const showToast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    dailyGoal: "",
    avatarFile: null,
    avatarPreview: null,
  });

  // Load user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const data = await userService.getProfile();
        setUserProfile(data.data);
        setFormData({
          displayName: data.data.display_name || "",
          email: data.data.email || "",
          dailyGoal: data.data.user_settings?.daily_goal || "",
          avatarFile: null,
          avatarPreview: null,
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

  const updateProfile = async (updateData) => {
    setIsLoading(true);
    try {
      await userService.updateProfile(updateData);
      showToast("Profile updated successfully", "success");
      const updatedData = await userService.getProfile();
      setUserProfile(updatedData.data);

      // Clean up preview URL after successful save
      if (formData.avatarPreview) {
        URL.revokeObjectURL(formData.avatarPreview);
      }

      // Reset form data with updated values
      setFormData(prev => ({
        ...prev,
        avatarFile: null,
        avatarPreview: null,
      }));

      // Update the auth context with the new avatar URL
      const updatedUser = {
        ...user,
        avatarUrl: updatedData.data.avatar_url,
      };
      setUser(updatedUser);
      
      // Also update localStorage so header updates immediately
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return true;
    } catch (error) {
      console.error("Error updating profile:", error);
      showToast(
        error.response?.data?.message || "Error updating profile",
        "error"
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    userProfile,
    formData,
    setFormData,
    updateProfile,
  };
}
