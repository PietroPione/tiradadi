import type { ReactNode } from 'react';
import Card from '@/components/ui/Card';
import InputField from '@/components/ui/InputField';
import DebugPanel from '@/components/ui/DebugPanel';

type TrechGenericProbabilityResults = {
  expectedTotal: number;
  successChance: number;
  selectionMode: 'highest' | 'lowest' | 'normal';
  baseDice: number;
  totalDice: number;
  netDice: number;
};

type TrechGenericProbabilityCalculatorProps = {
  plusDice: string;
  minusDice: string;
  positiveModifier: string;
  negativeModifier: string;
  errorMessage: string;
  results: TrechGenericProbabilityResults | null;
  debug: {
    baseDice: number;
    totalDice: number;
    netDice: number;
    expectedTotal: number;
    successChance: number;
  };
  onPlusDiceChange: (value: string) => void;
  onMinusDiceChange: (value: string) => void;
  onPositiveModifierChange: (value: string) => void;
  onNegativeModifierChange: (value: string) => void;
  onCalculate: () => void;
  onBack: () => void;
  rightSlot?: ReactNode;
};

const formatSelectionLabel = (mode: TrechGenericProbabilityResults['selectionMode']) => {
  if (mode === 'highest') {
    return 'Highest two';
  }
  if (mode === 'lowest') {
    return 'Lowest two';
  }
  return 'Two dice';
};

export default function TrechGenericProbabilityCalculator({
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
  onCalculate,
  onBack,
  rightSlot,
}: TrechGenericProbabilityCalculatorProps) {
  return (
    <Card className="px-4 py-5 sm:px-6 sm:py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">Generic roll</h2>
          <p className="mt-1 text-sm text-zinc-600">Success on 7+.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="border-2 border-zinc-900 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors hover:bg-zinc-900 hover:text-white"
          >
            Back to phases
          </button>
          {rightSlot ? rightSlot : null}
        </div>
      </div>

      <div className="mt-4 space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
          <InputField
            id="trechProbPlusDice"
            label="+Dice"
            value={plusDice}
            min="0"
            onChange={onPlusDiceChange}
          />
          <InputField
            id="trechProbMinusDice"
            label="-Dice"
            value={minusDice}
            min="0"
            onChange={onMinusDiceChange}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
          <InputField
            id="trechProbPositiveMod"
            label="Positive modifier"
            value={positiveModifier}
            min="0"
            onChange={onPositiveModifierChange}
          />
          <InputField
            id="trechProbNegativeMod"
            label="Negative modifier"
            value={negativeModifier}
            min="0"
            onChange={onNegativeModifierChange}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={onCalculate}
        className="mt-5 w-full border-2 border-zinc-900 py-3 text-base font-semibold uppercase tracking-[0.2em] transition-colors hover:bg-zinc-900 hover:text-white"
      >
        Calculate
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
              <span className="font-mono text-lg text-zinc-900">
                {results.baseDice} dice
              </span>
            </p>
            <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2">
              <span className="text-zinc-600">Expected total</span>
              <span className="font-mono text-lg text-zinc-900">{results.expectedTotal.toFixed(2)}</span>
            </p>
            <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2">
              <span className="text-zinc-600">Success chance</span>
              <span className="font-mono text-lg text-zinc-900">{(results.successChance * 100).toFixed(2)}%</span>
            </p>
          </div>
        </Card>
      ) : null}

      <DebugPanel
        lines={[
          { label: '+Dice', value: plusDice || '-' },
          { label: '-Dice', value: minusDice || '-' },
          { label: 'Positive modifier', value: positiveModifier || '-' },
          { label: 'Negative modifier', value: negativeModifier || '-' },
          { label: 'Net dice', value: String(debug.netDice) },
          { label: 'Base dice', value: String(debug.baseDice) },
          { label: 'Total dice', value: String(debug.totalDice) },
          { label: 'Expected total', value: debug.expectedTotal.toFixed(2) },
          { label: 'Success chance', value: `${(debug.successChance * 100).toFixed(2)}%` },
        ]}
      />
    </Card>
  );
}
