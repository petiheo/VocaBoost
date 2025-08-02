import React from 'react';
import ErrorBoundary from './Providers/ErrorBoundary.jsx';

class SafeEditListErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('EditList Error:', error);
    console.error('Error Info:', errorInfo);
    
    // Don't reload the page automatically, just show error
    this.setState({
      error: error,
      hasError: true
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="edit-list-error">
          <div className="edit-list-error-container">
            <h2>Something went wrong in the edit list</h2>
            <p>There was an error with the AI generation or word editing. Please try:</p>
            <ul>
              <li>Refreshing the page manually</li>
              <li>Checking your internet connection</li>
              <li>Trying to generate examples for different words</li>
            </ul>
            <button 
              onClick={() => this.setState({ hasError: false, error: null })}
              className="retry-button"
            >
              Try Again
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="refresh-button"
            >
              Refresh Page
            </button>
            {import.meta.env.MODE === 'development' && (
              <details>
                <summary>Error Details (Dev Mode)</summary>
                <pre>{this.state.error?.toString()}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const SafeEditList = ({ children }) => {
  return (
    <SafeEditListErrorBoundary>
      {children}
    </SafeEditListErrorBoundary>
  );
};

export default SafeEditList;
