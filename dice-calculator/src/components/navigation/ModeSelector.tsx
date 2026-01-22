import Card from '@/components/ui/Card';

type ModeSelectorProps = {
  onSelect: (mode: 'probability' | 'throw') => void;
  onBack: () => void;
};

export default function ModeSelector({ onSelect, onBack }: ModeSelectorProps) {
  return (
    <Card className="px-4 py-5 sm:px-6 sm:py-6">
      <h2 className="text-lg font-semibold text-zinc-900">Choose mode</h2>
      <p className="mt-2 text-sm text-zinc-600">Pick how you want to use the calculator.</p>
      <div className="mt-4 space-y-3">
        <button
          type="button"
          onClick={() => onSelect('probability')}
          className="w-full border-2 border-zinc-900 bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-900 transition-colors hover:bg-zinc-900 hover:text-white"
        >
          Probability
        </button>
        <button
          type="button"
          onClick={() => onSelect('throw')}
          className="w-full border-2 border-zinc-900 bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-900 transition-colors hover:bg-zinc-900 hover:text-white"
        >
          Throw dice
        </button>
        <button
          type="button"
          onClick={onBack}
          className="w-full border-2 border-zinc-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors hover:bg-zinc-900 hover:text-white"
        >
          Back to systems
        </button>
      </div>
    </Card>
  );
}
