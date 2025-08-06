import { useState, useEffect } from 'react';

/**
 * Development hook for testing skeleton loading states
 * Press Ctrl + Shift + S to toggle skeleton loading
 * Only works in development mode
 */
export function useSkeletonToggle(initialLoading = false) {
  const [forceLoading, setForceLoading] = useState(initialLoading);
  const [isEnabled, setIsEnabled] = useState(process.env.NODE_ENV === 'development');

  useEffect(() => {
    if (!isEnabled) return;

    let timeoutId;
    
    const handleKeyPress = (e) => {
      // Ctrl + Shift + S to toggle skeleton
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        
        if (forceLoading) {
          setForceLoading(false);
          console.log('🔧 [DEV] Skeleton loading: OFF');
        } else {
          setForceLoading(true);
          console.log('🔧 [DEV] Skeleton loading: ON');
          
          // Auto turn off after 5 seconds to prevent getting stuck
          timeoutId = setTimeout(() => {
            setForceLoading(false);
            console.log('🔧 [DEV] Skeleton loading: AUTO OFF (5s timeout)');
          }, 5000);
        }
      }

      // Ctrl + Shift + L for long skeleton test (10 seconds)
      if (e.ctrlKey && e.shiftKey && e.key === 'L') {
        e.preventDefault();
        setForceLoading(true);
        console.log('🔧 [DEV] Long skeleton test: ON (10s)');
        
        timeoutId = setTimeout(() => {
          setForceLoading(false);
          console.log('🔧 [DEV] Long skeleton test: OFF');
        }, 10000);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    
    // Show keyboard shortcuts in console
    console.log('🔧 [DEV] Skeleton testing shortcuts available:');
    console.log('  Ctrl + Shift + S: Toggle skeleton loading');
    console.log('  Ctrl + Shift + L: Long skeleton test (10s)');

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [forceLoading, isEnabled]);

  // Return combined loading state
  return {
    forceLoading,
    isEnabled,
    // Helper function to combine with actual loading state
    isLoading: (actualLoading) => actualLoading || forceLoading,
  };
}