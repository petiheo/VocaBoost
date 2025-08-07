import { useRef, useEffect } from "react";

const AccountPageInput = (props) => {
  const inputRef = useRef(null); // tranh render lai khi thay doi props type

  useEffect(() => {
    if (props.type === "submit" && inputRef.current) {
      inputRef.current.classList.add("cursor-pointer");
    }
  }, [props.type]);

  return (
    <div className="input">
      {props.label && (
        <label htmlFor={props.id || props.name}>
          {props.label}
          {props.labelIcon && (
            <img
              src={props.labelIcon}
              alt="required"
              style={{ marginLeft: "2px", verticalAlign: "middle" }}
            />
          )}
        </label>
      )}
      <div className="input__container">
        <input
          ref={inputRef}
          type={props.type}
          name={props.name}
          placeholder={props.placeholder}
          value={props.value}
          onChange={props.onChange}
          pattern={props.pattern}
          required={props.required}
          disabled={props.disabled}
          className={`input__${props.type || ""}`}
        />
      </div>
      {props.error && <div className="input-error">{props.error}</div>}
    </div>
  );
};

export default AccountPageInput;
