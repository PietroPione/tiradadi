import type { ReactNode } from 'react';
import Card from '@/components/ui/Card';
import InputField from '@/components/ui/InputField';
import DebugPanel from '@/components/ui/DebugPanel';

type TrechInjuryProbabilityResults = {
  expectedTotal: number;
  outcomeChances: {
    noEffect: number;
    minorHit: number;
    down: number;
    outOfAction: number;
  };
  selectionMode: 'highest' | 'lowest' | 'normal';
  baseDice: number;
  totalDice: number;
  netDice: number;
  armorApplied: number;
};

type TrechInjuryProbabilityCalculatorProps = {
  plusDice: string;
  minusDice: string;
  positiveModifier: string;
  negativeModifier: string;
  withThreeDice: boolean;
  targetArmor: string;
  noArmorSave: boolean;
  armorPositiveModifier: string;
  armorNegativeModifier: string;
  errorMessage: string;
  results: TrechInjuryProbabilityResults | null;
  debug: {
    baseDice: number;
    totalDice: number;
    netDice: number;
    armorApplied: number;
    expectedTotal: number;
    outcomeChances: TrechInjuryProbabilityResults['outcomeChances'];
  };
  onPlusDiceChange: (value: string) => void;
  onMinusDiceChange: (value: string) => void;
  onPositiveModifierChange: (value: string) => void;
  onNegativeModifierChange: (value: string) => void;
  onWithThreeDiceChange: (value: boolean) => void;
  onTargetArmorChange: (value: string) => void;
  onNoArmorSaveChange: (value: boolean) => void;
  onArmorPositiveModifierChange: (value: string) => void;
  onArmorNegativeModifierChange: (value: string) => void;
  onCalculate: () => void;
  onBack: () => void;
  rightSlot?: ReactNode;
};

const formatSelectionLabel = (mode: TrechInjuryProbabilityResults['selectionMode'], count: number) => {
  if (mode === 'highest') {
    return count === 3 ? 'Highest three' : 'Highest two';
  }
  if (mode === 'lowest') {
    return count === 3 ? 'Lowest three' : 'Lowest two';
  }
  return count === 3 ? 'Three dice' : 'Two dice';
};

export default function TrechInjuryProbabilityCalculator({
  plusDice,
  minusDice,
  positiveModifier,
  negativeModifier,
  withThreeDice,
  targetArmor,
  noArmorSave,
  armorPositiveModifier,
  armorNegativeModifier,
  errorMessage,
  results,
  debug,
  onPlusDiceChange,
  onMinusDiceChange,
  onPositiveModifierChange,
  onNegativeModifierChange,
  onWithThreeDiceChange,
  onTargetArmorChange,
  onNoArmorSaveChange,
  onArmorPositiveModifierChange,
  onArmorNegativeModifierChange,
  onCalculate,
  onBack,
  rightSlot,
}: TrechInjuryProbabilityCalculatorProps) {
  return (
    <Card className="px-4 py-5 sm:px-6 sm:py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">Injury roll</h2>
          <p className="mt-1 text-sm text-zinc-600">Resolve the injury table.</p>
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
        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
          <input
            type="checkbox"
            checked={withThreeDice}
            onChange={(e) => onWithThreeDiceChange(e.target.checked)}
            className="h-4 w-4 border-2 border-zinc-900"
          />
          Sum three dice
        </label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
          <InputField
            id="trechInjuryProbPlusDice"
            label="+Dice"
            value={plusDice}
            min="0"
            onChange={onPlusDiceChange}
          />
          <InputField
            id="trechInjuryProbMinusDice"
            label="-Dice"
            value={minusDice}
            min="0"
            onChange={onMinusDiceChange}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
          <InputField
            id="trechInjuryProbPositiveMod"
            label="Positive modifier"
            value={positiveModifier}
            min="0"
            onChange={onPositiveModifierChange}
          />
          <InputField
            id="trechInjuryProbNegativeMod"
            label="Negative modifier"
            value={negativeModifier}
            min="0"
            onChange={onNegativeModifierChange}
          />
        </div>
        <InputField
          id="trechInjuryProbTargetArmor"
          label="Target armor"
          value={targetArmor}
          min="0"
          disabled={noArmorSave}
          onChange={onTargetArmorChange}
        />
        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
          <input
            type="checkbox"
            checked={noArmorSave}
            onChange={(e) => onNoArmorSaveChange(e.target.checked)}
            className="h-4 w-4 border-2 border-zinc-900"
          />
          No armor save
        </label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
          <InputField
            id="trechInjuryProbArmorPositive"
            label="Armor positive modifier"
            value={armorPositiveModifier}
            min="0"
            disabled={noArmorSave}
            onChange={onArmorPositiveModifierChange}
          />
          <InputField
            id="trechInjuryProbArmorNegative"
            label="Armor negative modifier"
            value={armorNegativeModifier}
            min="0"
            disabled={noArmorSave}
            onChange={onArmorNegativeModifierChange}
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
              <span className="text-zinc-600">
                {formatSelectionLabel(results.selectionMode, results.baseDice)}
              </span>
              <span className="font-mono text-lg text-zinc-900">{results.baseDice} dice</span>
            </p>
            <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2">
              <span className="text-zinc-600">Expected total</span>
              <span className="font-mono text-lg text-zinc-900">{results.expectedTotal.toFixed(2)}</span>
            </p>
            <div className="border-2 border-zinc-900 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">Outcome chances</p>
              <div className="mt-3 space-y-2 text-sm text-zinc-700">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-1">
                  <span>No effect</span>
                  <span className="font-mono">{(results.outcomeChances.noEffect * 100).toFixed(2)}%</span>
                </div>
                <div className="flex items-center justify-between border-b border-zinc-200 pb-1">
                  <span>Minor hit</span>
                  <span className="font-mono">{(results.outcomeChances.minorHit * 100).toFixed(2)}%</span>
                </div>
                <div className="flex items-center justify-between border-b border-zinc-200 pb-1">
                  <span>Down</span>
                  <span className="font-mono">{(results.outcomeChances.down * 100).toFixed(2)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Out of action</span>
                  <span className="font-mono">{(results.outcomeChances.outOfAction * 100).toFixed(2)}%</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ) : null}

      <DebugPanel
        lines={[
          { label: 'Sum three dice', value: withThreeDice ? 'Yes' : 'No' },
          { label: '+Dice', value: plusDice || '-' },
          { label: '-Dice', value: minusDice || '-' },
          { label: 'Positive modifier', value: positiveModifier || '-' },
          { label: 'Negative modifier', value: negativeModifier || '-' },
          { label: 'Target armor', value: targetArmor || '-' },
          { label: 'No armor save', value: noArmorSave ? 'Yes' : 'No' },
          { label: 'Armor +', value: armorPositiveModifier || '-' },
          { label: 'Armor -', value: armorNegativeModifier || '-' },
          { label: 'Net dice', value: String(debug.netDice) },
          { label: 'Base dice', value: String(debug.baseDice) },
          { label: 'Total dice', value: String(debug.totalDice) },
          { label: 'Armor applied', value: String(debug.armorApplied) },
          { label: 'Expected total', value: debug.expectedTotal.toFixed(2) },
          { label: 'No effect', value: `${(debug.outcomeChances.noEffect * 100).toFixed(2)}%` },
          { label: 'Minor hit', value: `${(debug.outcomeChances.minorHit * 100).toFixed(2)}%` },
          { label: 'Down', value: `${(debug.outcomeChances.down * 100).toFixed(2)}%` },
          { label: 'Out of action', value: `${(debug.outcomeChances.outOfAction * 100).toFixed(2)}%` },
        ]}
      />
    </Card>
  );
}
