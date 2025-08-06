import PropTypes from 'prop-types';

const WordInput = ({ 
  label, 
  name, 
  type = "text", 
  value, 
  onChange, 
  placeholder = "", 
  required = false, 
  errors = [], 
  className = "",
  classPrefix = "create-list",
  ...props 
}) => {
  const hasErrors = errors && errors.length > 0;
  const inputClassName = `word-input ${className} ${hasErrors ? 'error' : ''}`.trim();
  
  return (
    <div className={`${classPrefix}__word-input-group`}>
      <div className="word-input-label">
        {label}
        {required && <span className="required-asterisk">*</span>}
      </div>
      
      <input
        name={name}
        type={type}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        className={inputClassName}
        {...props}
      />
      
      {hasErrors && (
        <div className="word-input-errors">
          {errors.map((error, index) => (
            <small key={index} className="error-message">
              {error}
            </small>
          ))}
        </div>
      )}
    </div>
  );
};

WordInput.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  errors: PropTypes.arrayOf(PropTypes.string),
  className: PropTypes.string,
  classPrefix: PropTypes.string
};

export default WordInput;