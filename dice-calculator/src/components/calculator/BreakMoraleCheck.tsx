import Card from '@/components/ui/Card';
import InputField from '@/components/ui/InputField';

type BreakMoraleCheckResults = {
  rolls: number[];
  usedRolls: number[];
  total: number;
  target: number;
  outcome: 'Passed' | 'Failed';
  isDoubleOne: boolean;
};

type BreakMoraleCheckProps = {
  discipline: string;
  bonus: string;
  malus: string;
  stubborn: boolean;
  withThreeDice: boolean;
  errorMessage: string;
  results: BreakMoraleCheckResults | null;
  onDisciplineChange: (value: string) => void;
  onBonusChange: (value: string) => void;
  onMalusChange: (value: string) => void;
  onStubbornChange: (value: boolean) => void;
  onWithThreeDiceChange: (value: boolean) => void;
  onRoll: () => void;
  onBack: () => void;
};

export default function BreakMoraleCheck({
  discipline,
  bonus,
  malus,
  stubborn,
  withThreeDice,
  errorMessage,
  results,
  onDisciplineChange,
  onBonusChange,
  onMalusChange,
  onStubbornChange,
  onWithThreeDiceChange,
  onRoll,
  onBack,
}: BreakMoraleCheckProps) {
  return (
    <Card className="px-4 py-5 sm:px-6 sm:py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">Break / Morale check</h2>
          <button
            type="button"
            onClick={onBack}
            className="mt-2 border-2 border-zinc-900 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors hover:bg-zinc-900 hover:text-white"
          >
            Back to phases
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-5">
        <InputField
          id="moraleDiscipline"
          label="Discipline"
          value={discipline}
          min="1"
          max="10"
          onChange={onDisciplineChange}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
          <InputField
            id="moraleBonus"
            label="Bonus"
            value={bonus}
            min="0"
            onChange={onBonusChange}
          />
          <InputField
            id="moraleMalus"
            label="Malus"
            value={malus}
            min="0"
            onChange={onMalusChange}
          />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">Options</p>
          <div className="mt-3 space-y-3">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
              <input
                type="checkbox"
                checked={stubborn}
                onChange={(e) => onStubbornChange(e.target.checked)}
                className="h-4 w-4 border-2 border-zinc-900"
              />
              Stubborn
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
              <input
                type="checkbox"
                checked={withThreeDice}
                onChange={(e) => onWithThreeDiceChange(e.target.checked)}
                className="h-4 w-4 border-2 border-zinc-900"
              />
              With three dice
            </label>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onRoll}
        className="mt-5 w-full border-2 border-zinc-900 py-3 text-base font-semibold uppercase tracking-[0.2em] transition-colors hover:bg-zinc-900 hover:text-white"
      >
        Roll
      </button>
      {errorMessage ? (
        <p className="mt-4 border-2 border-zinc-900 bg-zinc-100 px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-zinc-700">
          {errorMessage}
        </p>
      ) : null}

      {results ? (
        <Card className="mt-5 bg-stone-50 px-4 py-4 sm:px-6 sm:py-5">
          <h3 className="text-lg font-semibold text-zinc-900">Results</h3>
          <div className="mt-4 space-y-2 text-sm">
            <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2">
              <span className="text-zinc-600">Target value</span>
              <span className="font-mono text-lg text-zinc-900">{results.target}</span>
            </p>
            <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2">
              <span className="text-zinc-600">Dice used</span>
              <span className="font-mono text-lg text-zinc-900">{results.usedRolls.join(', ')}</span>
            </p>
            <div className="w-full flex items-center justify-between border-2 border-zinc-900 bg-zinc-900 px-4 py-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-200">
                  {results.outcome}
                </span>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-300">
                  Total: {results.total}
                </p>
              </div>
              <span className="font-mono text-2xl font-bold text-white sm:text-3xl">
                {results.outcome}
              </span>
            </div>
            <p className="text-xs text-zinc-600">
              Rolls: <span className="font-mono text-zinc-900">{results.rolls.join(', ')}</span>
            </p>
            {results.isDoubleOne ? (
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
                Double 1: automatic success
              </p>
            ) : null}
          </div>
        </Card>
      ) : null}
    </Card>
  );
}
