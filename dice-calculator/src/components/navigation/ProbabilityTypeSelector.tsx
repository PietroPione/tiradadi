import Card from '@/components/ui/Card';

type ProbabilityTypeSelectorProps = {
  onSelect: (mode: 'single' | 'range') => void;
  onBack: () => void;
};

export default function ProbabilityTypeSelector({ onSelect, onBack }: ProbabilityTypeSelectorProps) {
  return (
    <Card className="px-4 py-5 sm:px-6 sm:py-6">
      <h2 className="text-lg font-semibold text-zinc-900">Choose probability type</h2>
      <p className="mt-2 text-sm text-zinc-600">Pick how you want to read the results.</p>
      <div className="mt-4 space-y-3">
        <button
          type="button"
          onClick={() => onSelect('single')}
          className="w-full border-2 border-zinc-900 bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-900 transition-colors hover:bg-zinc-900 hover:text-white"
        >
          Single value
        </button>
        <button
          type="button"
          onClick={() => onSelect('range')}
          className="w-full border-2 border-zinc-900 bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-900 transition-colors hover:bg-zinc-900 hover:text-white"
        >
          Comparation
        </button>
        <button
          type="button"
          onClick={onBack}
          className="w-full border-2 border-zinc-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors hover:bg-zinc-900 hover:text-white"
        >
          Back to mode
        </button>
      </div>
    </Card>
  );
}
