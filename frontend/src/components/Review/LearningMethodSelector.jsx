import React from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const LearningMethodSelector = ({ listId, listInfo, showTitle = true }) => {
  const navigate = useNavigate();

  const methods = [
    {
      id: 'flashcard',
      name: 'Flashcard',
      description: 'Classic flashcard review with term and definition',
      icon: '🎴',
      route: `/review/${listId}/flashcard`
    },
    {
      id: 'fill-blank',
      name: 'Fill in the Blank',
      description: 'Complete sentences with missing vocabulary words',
      icon: '✏️',
      route: `/review/${listId}/fill-in-blank`
    },
    {
      id: 'review-sr',
      name: 'Spaced Repetition',
      description: 'Smart review based on your learning progress',
      icon: '🧠',
      route: `/review/${listId}`
    }
  ];

  const handleMethodSelect = (method) => {
    navigate(method.route, { 
      state: { 
        method: method.name, 
        listInfo 
      } 
    });
  };

  return (
    <div className="learning-method-selector">
      {showTitle && (
        <h3 className="learning-method-selector__title">Choose Learning Method</h3>
      )}
      <div className="learning-method-selector__grid">
        {methods.map(method => (
          <button
            key={method.id}
            className="learning-method-selector__card"
            onClick={() => handleMethodSelect(method)}
            aria-label={`Select ${method.name} method`}
          >
            <span className="learning-method-selector__icon" aria-hidden="true">
              {method.icon}
            </span>
            <h4 className="learning-method-selector__name">{method.name}</h4>
            <p className="learning-method-selector__description">
              {method.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

LearningMethodSelector.propTypes = {
  listId: PropTypes.string.isRequired,
  listInfo: PropTypes.object,
  showTitle: PropTypes.bool
};

LearningMethodSelector.defaultProps = {
  listInfo: null,
  showTitle: true
};

export default LearningMethodSelector;