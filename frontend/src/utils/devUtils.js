// Development utilities for testing skeleton loading and other UI states

/**
 * Add artificial delay for testing skeleton loading states
 * Only works in development mode
 * @param {number} ms - Delay in milliseconds (default: 2000ms)
 * @returns {Promise} Promise that resolves after the delay
 */
export const addDevDelay = (ms = 2000) => {
  // Only add delay in development mode
  if (process.env.NODE_ENV === 'development') {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  return Promise.resolve();
};

/**
 * Network simulation utility for testing different loading states
 * @param {Function} apiCall - The actual API call function
 * @param {Object} options - Simulation options
 * @returns {Promise} Promise with simulated network conditions
 */
export const simulateNetwork = async (apiCall, options = {}) => {
  const {
    delay = 2000,           // Delay in ms
    failureRate = 0,        // 0-1 probability of failure
    slowNetwork = false     // Simulate slow network
  } = options;

  // Only simulate in development
  if (process.env.NODE_ENV !== 'development') {
    return await apiCall();
  }

  // Simulate network delay
  const networkDelay = slowNetwork ? delay + Math.random() * 1000 : delay;
  await new Promise(resolve => setTimeout(resolve, networkDelay));

  // Simulate network failure
  if (Math.random() < failureRate) {
    throw new Error('Simulated network error');
  }

  return await apiCall();
};

/**
 * Toggle skeleton loading for testing
 * Useful for quickly testing skeleton states
 */
export const createSkeletonToggle = () => {
  if (process.env.NODE_ENV === 'development') {
    // Add keyboard shortcut to toggle skeleton
    const toggleSkeleton = (callback) => {
      const handleKeyPress = (e) => {
        // Press Ctrl + Shift + S to toggle skeleton
        if (e.ctrlKey && e.shiftKey && e.key === 'S') {
          e.preventDefault();
          callback();
        }
      };
      
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    };
    
    return toggleSkeleton;
  }
  
  return () => () => {}; // No-op in production
};

/**
 * Console helper for development
 */
export const devLog = (...args) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[DEV]', ...args);
  }
};