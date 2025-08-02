import PropTypes from 'prop-types';

const CreateListInput = ({ 
  label, 
  name, 
  type = "text", 
  value, 
  onChange, 
  placeholder, 
  required = false, 
  errors = [], 
  className = "",
  as = "input", // 'input' or 'textarea'
  ...props 
}) => {
  const hasErrors = errors && errors.length > 0;
  const inputClassName = `create-list-input ${className} ${hasErrors ? 'error' : ''}`.trim();
  
  const InputComponent = as === 'textarea' ? 'textarea' : 'input';
  
  return (
    <div className="create-list-input-group">
      <label className="create-list-input-label">
        {label}
        {required && <span className="required-asterisk">*</span>}
      </label>
      
      <InputComponent
        name={name}
        type={as === 'input' ? type : undefined}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={inputClassName}
        {...props}
      />
      
      {hasErrors && (
        <div className="create-list-input-errors">
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

CreateListInput.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  errors: PropTypes.arrayOf(PropTypes.string),
  className: PropTypes.string,
  as: PropTypes.oneOf(['input', 'textarea'])
};

export default CreateListInput;