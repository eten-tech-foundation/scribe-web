interface FormSelectProps {
  label: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  error?: boolean;
  errorMessage?: string;
  placeholder?: string;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  value,
  onChange,
  options,
  error = false,
  errorMessage,
  placeholder,
}) => {
  return (
    <div className='mb-4'>
      <label className='mb-2 block text-sm font-medium text-gray-700'>{label}</label>
      <select
        className={`w-full rounded-md border px-3 py-2 focus:ring-2 focus:outline-none ${
          error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
        }`}
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        {placeholder && <option value=''>{placeholder}</option>}
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && errorMessage && <p className='mt-1 text-sm text-red-600'>{errorMessage}</p>}
    </div>
  );
};
