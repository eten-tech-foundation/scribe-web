// Form Input Component
interface FormInputProps {
  label: React.ReactNode;
  type?: string;
  value: string;
  helperText?: string;
  onChange: (value: string) => void;
  error?: boolean;
  errorMessage?: string;
  required?: boolean;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  helperText,
  error = false,
  errorMessage,
  required = false,
}) => {
  return (
    <div className='mb-4'>
      <label className='mb-2 block text-sm font-medium text-gray-700'>{label}</label>
      <input
        className={`w-full rounded-md border px-3 py-2 focus:ring-2 focus:outline-none ${
          error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
        }`}
        required={required}
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
      {error && errorMessage && <p className='mt-1 text-sm text-red-600'>{errorMessage}</p>}
      {helperText && <p className='mt-1 text-sm text-gray-500'>{helperText}</p>}
    </div>
  );
};
