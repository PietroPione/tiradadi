import Card from '@/components/ui/Card';
import InputField from '@/components/ui/InputField';
import DebugPanel from '@/components/ui/DebugPanel';

type TrechInjuryResults = {
  rolls: number[];
  selectedRolls: number[];
  baseTotal: number;
  finalTotal: number;
  outcome: 'No effect' | 'Minor hit' | 'Down' | 'Out of action';
  selectionMode: 'highest' | 'lowest' | 'normal';
};

type TrechInjuryRollCalculatorProps = {
  plusDice: string;
  minusDice: string;
  positiveModifier: string;
  negativeModifier: string;
  errorMessage: string;
  results: TrechInjuryResults | null;
  debug: {
    rolls: number[];
    selectedRolls: number[];
  };
  onPlusDiceChange: (value: string) => void;
  onMinusDiceChange: (value: string) => void;
  onPositiveModifierChange: (value: string) => void;
  onNegativeModifierChange: (value: string) => void;
  onRoll: () => void;
  onBack: () => void;
};

const formatSelectionLabel = (mode: TrechInjuryResults['selectionMode']) => {
  if (mode === 'highest') {
    return 'Highest two';
  }
  if (mode === 'lowest') {
    return 'Lowest two';
  }
  return 'Two dice';
};

export default function TrechInjuryRollCalculator({
  plusDice,
  minusDice,
  positiveModifier,
  negativeModifier,
  errorMessage,
  results,
  debug,
  onPlusDiceChange,
  onMinusDiceChange,
  onPositiveModifierChange,
  onNegativeModifierChange,
  onRoll,
  onBack,
}: TrechInjuryRollCalculatorProps) {
  return (
    <Card className="px-4 py-5 sm:px-6 sm:py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">Injury roll</h2>
          <p className="mt-1 text-sm text-zinc-600">Resolve the injury table.</p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="border-2 border-zinc-900 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors hover:bg-zinc-900 hover:text-white"
        >
          Back to phases
        </button>
      </div>

      <div className="mt-4 space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
          <InputField
            id="trechInjuryPlusDice"
            label="+Dice"
            value={plusDice}
            min="0"
            onChange={onPlusDiceChange}
          />
          <InputField
            id="trechInjuryMinusDice"
            label="-Dice"
            value={minusDice}
            min="0"
            onChange={onMinusDiceChange}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
          <InputField
            id="trechInjuryPositiveMod"
            label="Positive modifier"
            value={positiveModifier}
            min="0"
            onChange={onPositiveModifierChange}
          />
          <InputField
            id="trechInjuryNegativeMod"
            label="Negative modifier"
            value={negativeModifier}
            min="0"
            onChange={onNegativeModifierChange}
          />
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
              <span className="text-zinc-600">{formatSelectionLabel(results.selectionMode)}</span>
              <span className="font-mono text-lg text-zinc-900">{results.selectedRolls.join(' + ')}</span>
            </p>
            <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2">
              <span className="text-zinc-600">Base total</span>
              <span className="font-mono text-lg text-zinc-900">{results.baseTotal}</span>
            </p>
            <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2">
              <span className="text-zinc-600">Final total</span>
              <span className="font-mono text-lg text-zinc-900">{results.finalTotal}</span>
            </p>
            <div className="w-full flex items-center justify-between border-2 border-zinc-900 bg-zinc-900 px-4 py-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-200">
                  Outcome
                </span>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-300">
                  Injury table
                </p>
              </div>
              <span className="font-mono text-2xl font-bold text-white sm:text-3xl">
                {results.outcome}
              </span>
            </div>
            <p className="text-xs text-zinc-600">
              Rolls: <span className="font-mono text-zinc-900">{results.rolls.join(', ') || '-'}</span>
            </p>
          </div>
        </Card>
      ) : null}

      <DebugPanel
        lines={[
          { label: 'Initial rolls', value: debug.rolls.join(', ') || '-' },
          { label: 'Selected rolls', value: debug.selectedRolls.join(', ') || '-' },
        ]}
      />
    </Card>
  );
}
