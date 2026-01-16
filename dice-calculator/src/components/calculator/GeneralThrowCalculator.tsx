import Card from '@/components/ui/Card';
import InputField from '@/components/ui/InputField';
import ModeSwitch from '@/components/calculator/ModeSwitch';

type GeneralAverageResults = {
  averageSuccesses: number;
  successChance: number;
  averageTotal: number;
};

type GeneralThrowResults = {
  successes: number;
  rolls: number[];
  total: number;
};

type GeneralThrowCalculatorProps = {
  diceCount: string;
  objective: 'target' | 'total';
  targetValue: string;
  mode: 'probability' | 'throw';
  errorMessage: string;
  averageResults: GeneralAverageResults;
  throwResults: GeneralThrowResults;
  hasAverageResults: boolean;
  hasThrowResults: boolean;
  onBack: () => void;
  onDiceCountChange: (value: string) => void;
  onObjectiveChange: (objective: 'target' | 'total') => void;
  onTargetValueChange: (value: string) => void;
  onModeChange: (mode: 'probability' | 'throw') => void;
  onAverageCalculate: () => void;
  onThrowCalculate: () => void;
};

export default function GeneralThrowCalculator({
  diceCount,
  objective,
  targetValue,
  mode,
  errorMessage,
  averageResults,
  throwResults,
  hasAverageResults,
  hasThrowResults,
  onBack,
  onDiceCountChange,
  onObjectiveChange,
  onTargetValueChange,
  onModeChange,
  onAverageCalculate,
  onThrowCalculate,
}: GeneralThrowCalculatorProps) {
  const isProbability = mode === 'probability';

  return (
    <Card className="px-4 py-5 sm:px-6 sm:py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">General throw</h2>
          <button
            type="button"
            onClick={onBack}
            className="mt-2 border-2 border-zinc-900 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors hover:bg-zinc-900 hover:text-white"
          >
            Back to phases
          </button>
        </div>
        <ModeSwitch mode={mode} onModeChange={onModeChange} />
      </div>
      <div className="mt-4 space-y-5">
        <InputField
          id="generalDiceCount"
          label="Number of dice to throw"
          value={diceCount}
          min="1"
          onChange={onDiceCountChange}
        />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">Objective</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onObjectiveChange('target')}
              className={`border-2 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors hover:bg-zinc-900 hover:text-white ${
                objective === 'target'
                  ? 'border-zinc-900 bg-zinc-900 text-white'
                  : 'border-zinc-900 bg-white text-zinc-900'
              }`}
            >
              Target value
            </button>
            <button
              type="button"
              onClick={() => onObjectiveChange('total')}
              className={`border-2 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors hover:bg-zinc-900 hover:text-white ${
                objective === 'total'
                  ? 'border-zinc-900 bg-zinc-900 text-white'
                  : 'border-zinc-900 bg-white text-zinc-900'
              }`}
            >
              Total throw
            </button>
          </div>
        </div>
        {objective === 'target' ? (
          <InputField
            id="generalTarget"
            label="Target (X+)"
            value={targetValue}
            min="1"
            max="7"
            onChange={onTargetValueChange}
          />
        ) : null}
      </div>

      <button
        type="button"
        onClick={isProbability ? onAverageCalculate : onThrowCalculate}
        className="mt-5 w-full border-2 border-zinc-900 py-3 text-base font-semibold uppercase tracking-[0.2em] transition-colors hover:bg-zinc-900 hover:text-white"
      >
        Calculate
      </button>
      {errorMessage ? (
        <p className="mt-4 border-2 border-zinc-900 bg-zinc-100 px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-zinc-700">
          {errorMessage}
        </p>
      ) : null}

      {isProbability && hasAverageResults ? (
        <Card className="mt-5 bg-stone-50 px-4 py-4 sm:px-6 sm:py-5">
          <h3 className="text-lg font-semibold text-zinc-900">Results</h3>
          <div className="mt-4 space-y-3 text-sm">
            {objective === 'target' ? (
              <>
                <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2">
                  <span className="text-zinc-600">Average successes</span>
                  <span className="font-mono text-lg text-zinc-900">
                    {averageResults.averageSuccesses.toFixed(2)}
                  </span>
                </p>
                <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2">
                  <span className="text-zinc-600">Success chance</span>
                  <span className="font-mono text-lg text-zinc-900">
                    {(averageResults.successChance * 100).toFixed(2)}%
                  </span>
                </p>
              </>
            ) : (
              <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2">
                <span className="text-zinc-600">Average total</span>
                <span className="font-mono text-lg text-zinc-900">
                  {averageResults.averageTotal.toFixed(2)}
                </span>
              </p>
            )}
            <div className="w-full flex items-center justify-between border-2 border-zinc-900 bg-zinc-900 px-4 py-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-200">
                  {objective === 'target' ? 'Average successes' : 'Average total'}
                </span>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-300">
                  Real value: {objective === 'target'
                    ? averageResults.averageSuccesses.toFixed(2)
                    : averageResults.averageTotal.toFixed(2)}
                </p>
              </div>
              <span className="font-mono text-2xl font-bold text-white sm:text-3xl">
                {Math.round(objective === 'target'
                  ? averageResults.averageSuccesses
                  : averageResults.averageTotal)}
              </span>
            </div>
          </div>
        </Card>
      ) : null}

      {!isProbability && hasThrowResults ? (
        <Card className="mt-5 bg-stone-50 px-4 py-4 sm:px-6 sm:py-5">
          <h3 className="text-lg font-semibold text-zinc-900">Results</h3>
          <div className="mt-4 space-y-2 text-sm">
            {objective === 'target' ? (
              <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2">
                <span className="text-zinc-600">Number of successes</span>
                <span className="font-mono text-lg text-zinc-900">{throwResults.successes}</span>
              </p>
            ) : (
              <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2">
                <span className="text-zinc-600">Total throw</span>
                <span className="font-mono text-lg text-zinc-900">{throwResults.total}</span>
              </p>
            )}
            <div className="w-full flex items-center justify-between border-2 border-zinc-900 bg-zinc-900 px-4 py-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-200">
                  {objective === 'target' ? 'Successes' : 'Total'}
                </span>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-300">
                  {objective === 'target' ? `Out of ${diceCount} dice` : `From ${diceCount} dice`}
                </p>
              </div>
              <span className="font-mono text-2xl font-bold text-white sm:text-3xl">
                {objective === 'target' ? throwResults.successes : throwResults.total}
              </span>
            </div>
            <p className="text-xs text-zinc-600">
              Rolls: <span className="font-mono text-zinc-900">{throwResults.rolls.join(', ') || '-'}</span>
            </p>
          </div>
        </Card>
      ) : null}
    </Card>
  );
}
