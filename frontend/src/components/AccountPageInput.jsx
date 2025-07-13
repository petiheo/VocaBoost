import { useRef, useEffect } from "react";

const Input = (props) => {
    const inputRef = useRef(null); // tranh render lai khi thay doi props type 

    useEffect(() => {
        if (props.type === 'submit' && inputRef.current) {
            inputRef.current.classList.add('cursor-pointer');
        }
    }, [props.type]);

    return (
        <div className="input">
            {props.label && <label htmlFor={props.id || props.name}>{props.label}</label>}
            <div className="input__container">
                <input
                    ref={inputRef}
                    type={props.type}
                    name={props.name}
                    placeholder={props.placeholder}
                    value={props.value}
                    onChange={props.onChange}
                    pattern={props.pattern}
                    required
                    className={`input__${props.type || ''}`}
                />
            </div>
            {props.error && (
                <div className="input-error">
                    {props.error}
                </div>
            )}
        </div>
    );
};

export default Input;