import Card from '@/components/ui/Card';

type NewUiModeSelectorProps = {
  onSelect: (mode: 'probability' | 'throw') => void;
  onBack: () => void;
};

export default function NewUiModeSelector({ onSelect, onBack }: NewUiModeSelectorProps) {
  return (
    <Card className="px-4 py-5 sm:px-6 sm:py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-zinc-900">Choose mode</h2>
        <button
          type="button"
          onClick={onBack}
          className="border-2 border-zinc-900 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors hover:bg-zinc-900 hover:text-white"
        >
          Back
        </button>
      </div>
      <div className="mt-4 grid gap-3">
        <button
          type="button"
          onClick={() => onSelect('probability')}
          className="w-full border-2 border-zinc-900 bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-900 transition-colors hover:bg-zinc-900 hover:text-white"
        >
          Probability calculator
        </button>
        <button
          type="button"
          onClick={() => onSelect('throw')}
          className="w-full border-2 border-zinc-900 bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-900 transition-colors hover:bg-zinc-900 hover:text-white"
        >
          Throw dices
        </button>
      </div>
    </Card>
  );
}
