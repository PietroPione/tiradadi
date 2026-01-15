import Card from '@/components/ui/Card';
import InputField from '@/components/ui/InputField';
import ThrowDebugPanel, { type ThrowDebug } from '@/components/calculator/ThrowDebugPanel';
import ThrowResultsCard, { type ThrowResults } from '@/components/calculator/ThrowResultsCard';

type ThrowDiceCalculatorProps = {
  diceCount: string;
  attackersAc: string;
  defendersAc: string;
  throwHitStrength: string;
  targetToughness: string;
  throwArmorSave: string;
  throwWardSave: string;
  poisonedAttack: boolean;
  errorMessage: string;
  hasThrowResults: boolean;
  throwResults: ThrowResults;
  throwDebug: ThrowDebug;
  onDiceCountChange: (value: string) => void;
  onAttackersAcChange: (value: string) => void;
  onDefendersAcChange: (value: string) => void;
  onThrowHitStrengthChange: (value: string) => void;
  onTargetToughnessChange: (value: string) => void;
  onThrowArmorSaveChange: (value: string) => void;
  onThrowWardSaveChange: (value: string) => void;
  onPoisonedAttackChange: (value: boolean) => void;
  onCalculate: () => void;
};

export default function ThrowDiceCalculator({
  diceCount,
  attackersAc,
  defendersAc,
  throwHitStrength,
  targetToughness,
  throwArmorSave,
  throwWardSave,
  poisonedAttack,
  errorMessage,
  hasThrowResults,
  throwResults,
  throwDebug,
  onDiceCountChange,
  onAttackersAcChange,
  onDefendersAcChange,
  onThrowHitStrengthChange,
  onTargetToughnessChange,
  onThrowArmorSaveChange,
  onThrowWardSaveChange,
  onPoisonedAttackChange,
  onCalculate,
}: ThrowDiceCalculatorProps) {
  return (
    <Card className="px-4 py-5 sm:px-6 sm:py-6">
      <h2 className="text-lg font-semibold text-zinc-900">Throw dices</h2>
      <div className="mt-4 space-y-5">
        <InputField
          id="diceCountThrow"
          label="Dice Count"
          value={diceCount}
          min="1"
          onChange={onDiceCountChange}
        />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">To hit</p>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            <InputField
              id="attackersAc"
              label="Attackers AC"
              value={attackersAc}
              min="1"
              onChange={onAttackersAcChange}
            />
            <InputField
              id="defendersAc"
              label="Defenders AC"
              value={defendersAc}
              min="1"
              onChange={onDefendersAcChange}
            />
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
            <input
              type="checkbox"
              id="poisonedAttackThrow"
              checked={poisonedAttack}
              onChange={(e) => onPoisonedAttackChange(e.target.checked)}
              className="h-4 w-4 border-2 border-zinc-900"
            />
            <label htmlFor="poisonedAttackThrow">Poisoned Attack</label>
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">To wound</p>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            <InputField
              id="throwHitStrength"
              label="Hit Strength"
              value={throwHitStrength}
              min="1"
              onChange={onThrowHitStrengthChange}
            />
            <InputField
              id="targetToughness"
              label="Target Toughness"
              value={targetToughness}
              min="1"
              onChange={onTargetToughnessChange}
            />
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">Savings</p>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            <InputField
              id="throwArmorSave"
              label="Armor Save (X+)"
              value={throwArmorSave}
              min="1"
              max="7"
              onChange={onThrowArmorSaveChange}
            />
            <InputField
              id="throwWardSave"
              label="Ward Save (X+)"
              value={throwWardSave}
              min="0"
              max="7"
              onChange={onThrowWardSaveChange}
            />
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={onCalculate}
        className="mt-5 w-full border-2 border-zinc-900 py-3 text-base font-semibold uppercase tracking-[0.2em]"
      >
        Calculate
      </button>
      {errorMessage ? (
        <p className="mt-4 border-2 border-zinc-900 bg-zinc-100 px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-zinc-700">
          {errorMessage}
        </p>
      ) : null}
      {hasThrowResults ? <ThrowResultsCard results={throwResults} /> : null}
      <ThrowDebugPanel debug={throwDebug} wardSave={throwWardSave} />
    </Card>
  );
}
