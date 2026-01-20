import type { ChangeEvent } from 'react';

type InputFieldProps = {
  id: string;
  label: string;
  value: string;
  type?: string;
  min?: number | string;
  max?: number | string;
  placeholder?: string;
  pattern?: string;
  title?: string;
  onChange: (value: string) => void;
};

export default function InputField({
  id,
  label,
  value,
  type = 'number',
  min,
  max,
  placeholder,
  pattern,
  title,
  onChange,
}: InputFieldProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <div>
      <label htmlFor={id} className="block font-semibold text-zinc-800">{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        min={min}
        max={max}
        placeholder={placeholder}
        pattern={pattern}
        title={title}
        onChange={handleChange}
        className="mt-2 w-full border-2 border-zinc-900 bg-white px-3 py-2 font-mono text-base text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/30"
      />
    </div>
  );
}
