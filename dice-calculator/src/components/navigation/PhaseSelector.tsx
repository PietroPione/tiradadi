import Card from '@/components/ui/Card';

type Phase = 'general' | 'shooting' | 'combat' | 'morale' | 'challenge' | 'tc-generic' | 'tc-injury';
type GameSystem = 'wfb8' | 'trech' | 'hh2';

type PhaseSelectorProps = {
  systemLabel: string;
  systemKey: GameSystem;
  onSelect: (phase: Phase) => void;
  onBack: () => void;
};

export default function PhaseSelector({
  systemLabel,
  systemKey,
  onSelect,
  onBack,
}: PhaseSelectorProps) {
  return (
    <Card className="px-4 py-5 sm:px-6 sm:py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">Choose phase</h2>
          <p className="mt-1 text-sm text-zinc-600">System: {systemLabel}</p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="border-2 border-zinc-900 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors hover:bg-zinc-900 hover:text-white"
        >
          Change mode
        </button>
      </div>
      <div className="mt-4 grid gap-3">
        {systemKey === 'trech' ? (
          <>
            <button
              type="button"
              onClick={() => onSelect('tc-generic')}
              className="w-full border-2 border-zinc-900 bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-900 transition-colors hover:bg-zinc-900 hover:text-white"
            >
              Generic roll
            </button>
            <button
              type="button"
              onClick={() => onSelect('tc-injury')}
              className="w-full border-2 border-zinc-900 bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-900 transition-colors hover:bg-zinc-900 hover:text-white"
            >
              Injury roll
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onSelect('general')}
              className="w-full border-2 border-zinc-900 bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-900 transition-colors hover:bg-zinc-900 hover:text-white"
            >
              General throw
            </button>
            <button
              type="button"
              onClick={() => onSelect('shooting')}
              className="w-full border-2 border-zinc-900 bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-900 transition-colors hover:bg-zinc-900 hover:text-white"
            >
              Shooting phase
            </button>
            <button
              type="button"
              onClick={() => onSelect('combat')}
              className="w-full border-2 border-zinc-900 bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-900 transition-colors hover:bg-zinc-900 hover:text-white"
            >
              Combat phase
            </button>
            <button
              type="button"
              onClick={() => onSelect('morale')}
              className="w-full border-2 border-zinc-900 bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-900 transition-colors hover:bg-zinc-900 hover:text-white"
            >
              Break / Morale check
            </button>
            <button
              type="button"
              onClick={() => onSelect('challenge')}
              className="w-full border-2 border-zinc-900 bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-900 transition-colors hover:bg-zinc-900 hover:text-white"
            >
              Challenge simulator
            </button>
          </>
        )}
      </div>
    </Card>
  );
}
