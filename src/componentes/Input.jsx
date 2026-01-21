const  InputField = ({ 
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  icon,
  required = false,
  disabled = false,
  readOnly = false,
  error = '',
  size = 'medium',
  className = ''
}) => {
  const baseStyles = 'w-full rounded-lg border placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200';
  
  const sizes = {
    small: 'py-1.5 text-sm',
    medium: 'py-2.5 text-base',
    large: 'py-3 text-lg'
  };
  
  const states = {
    default: 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500',
    disabled: 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-800'
  };
  
  const getStateStyle = () => {
    if (disabled) return states.disabled;
    if (error) return 'border-red-500 focus:ring-red-500';
    return states.default;
  };

  const paddingLeft = icon ? 'pl-10' : 'pl-3';

  return (
    <div className="w-full relative pb-5">
      {label && (
        <label 
          htmlFor={name} 
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label} <span className="text-red-500">*</span>
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
            {icon}
          </div>
        )}

        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          className={`
            ${baseStyles} 
            ${sizes[size]} 
            ${paddingLeft} 
            ${className}
            ${getStateStyle()}
          `.trim().replace(/\s+/g, ' ')}
        />
      </div>

      {error && (
        <p className="text-red-500 dark:text-red-400 text-xs absolute -bottom-1 left-0">
          {error}
        </p>
      )}
    </div>
  );
};
export default InputField
