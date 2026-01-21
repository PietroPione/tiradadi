import InputField from '@/components/ui/InputField';

type StatField = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  min?: number | string;
  max?: number | string;
  placeholder?: string;
};

type StatGridProps = {
  fields: Array<StatField | null | undefined>;
  columns?: 1 | 2 | 3;
  className?: string;
};

const columnsClass: Record<NonNullable<StatGridProps['columns']>, string> = {
  1: 'grid grid-cols-1 gap-4',
  2: 'grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5',
  3: 'grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5',
};

export default function StatGrid({ fields, columns = 2, className = '' }: StatGridProps) {
  const filtered = fields.filter(Boolean) as StatField[];
  return (
    <div className={`${columnsClass[columns]} ${className}`.trim()}>
      {filtered.map((field) => (
        <InputField
          key={field.id}
          id={field.id}
          label={field.label}
          value={field.value}
          type={field.type}
          min={field.min}
          max={field.max}
          placeholder={field.placeholder}
          onChange={field.onChange}
        />
      ))}
    </div>
  );
}
