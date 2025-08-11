/**
 * Navigation utilities for role-based routing
 */

/**
 * Navigate to the appropriate dashboard based on user role
 * @param {Object} user - User object containing role information
 * @param {Function} navigate - React Router navigate function
 * @param {boolean} isNewUser - Whether the user is new (for special routing)
 */
export const navigateByRole = (user, navigate, isNewUser = false) => {
  // If it's a new user, always go to user type selection first
  if (isNewUser) {
    navigate("/select-user-type");
    return;
  }

  // Navigate based on user role
  switch (user?.role) {
    case "admin":
      navigate("/admin-dashboard");
      break;
    case "teacher":
      navigate("/homepage");
      break;
    case "learner":
      navigate("/homepage");
      break;
    default:
      // Fallback to homepage for unknown roles
      navigate("/homepage");
      break;
  }
};

/**
 * Get the default route for a user role
 * @param {string} role - User role
 * @returns {string} - Default route path
 */
export const getDefaultRouteByRole = (role) => {
  switch (role) {
    case "admin":
      return "/admin-dashboard";
    case "teacher":
      return "/homepage";
    case "learner":
      return "/homepage";
    default:
      return "/homepage";
  }
};

/**
 * Check if user has access to admin routes
 * @param {Object} user - User object
 * @returns {boolean} - Whether user can access admin routes
 */
export const canAccessAdminRoutes = (user) => {
  return user?.role === "admin";
};

/**
 * Check if user has teacher privileges
 * @param {Object} user - User object  
 * @returns {boolean} - Whether user has teacher privileges
 */
export const hasTeacherPrivileges = (user) => {
  return user?.role === "teacher" || user?.role === "admin";
};
