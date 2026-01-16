import Card from '@/components/ui/Card';
import InputField from '@/components/ui/InputField';
import ProbabilityResultsCard, { type ProbabilityResults } from '@/components/calculator/ProbabilityResultsCard';
import ReRollOptions, { type RerollConfig } from '@/components/calculator/ReRollOptions';
import DebugPanel from '@/components/ui/DebugPanel';

type ProbabilityCalculatorProps = {
  diceCount: string;
  hitValue: string;
  poisonedAttack: boolean;
  hitStrength: string;
  woundValue: string;
  armorSave: string;
  wardSave: string;
  errorMessage: string;
  results: ProbabilityResults;
  rerollHitConfig: RerollConfig;
  rerollWoundConfig: RerollConfig;
  onDiceCountChange: (value: string) => void;
  onHitValueChange: (value: string) => void;
  onPoisonedAttackChange: (value: boolean) => void;
  onHitStrengthChange: (value: string) => void;
  onWoundValueChange: (value: string) => void;
  onArmorSaveChange: (value: string) => void;
  onWardSaveChange: (value: string) => void;
  onCalculate: () => void;
  onRerollHitChange: (config: RerollConfig) => void;
  onRerollWoundChange: (config: RerollConfig) => void;
};

export default function ProbabilityCalculator({
  diceCount,
  hitValue,
  poisonedAttack,
  hitStrength,
  woundValue,
  armorSave,
  wardSave,
  errorMessage,
  results,
  rerollHitConfig,
  rerollWoundConfig,
  onDiceCountChange,
  onHitValueChange,
  onPoisonedAttackChange,
  onHitStrengthChange,
  onWoundValueChange,
  onArmorSaveChange,
  onWardSaveChange,
  onCalculate,
  onRerollHitChange,
  onRerollWoundChange,
}: ProbabilityCalculatorProps) {
  return (
    <>
      <Card className="px-4 py-5 sm:px-6 sm:py-6">
      <h2 className="text-lg font-semibold text-zinc-900">Probability calculator</h2>
      <div className="mt-4 space-y-5">
        <InputField
          id="diceCount"
          label="Dice Count"
          value={diceCount}
          min="1"
          onChange={onDiceCountChange}
        />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">To hit</p>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:gap-5">
            <div>
              <InputField
                id="hitValue"
                label="To Hit (X+)"
                value={hitValue}
                min="1"
                max="7"
                onChange={onHitValueChange}
              />
              <div className="mt-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
                <input
                  type="checkbox"
                  id="poisonedAttack"
                  checked={poisonedAttack}
                  onChange={(e) => onPoisonedAttackChange(e.target.checked)}
                  className="h-4 w-4 border-2 border-zinc-900"
                />
                <label htmlFor="poisonedAttack">Poisoned Attack</label>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <ReRollOptions config={rerollHitConfig} onChange={onRerollHitChange} />
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">To wound</p>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            <InputField
              id="hitStrength"
              label="Hit Strength"
              value={hitStrength}
              min="1"
              max="10"
              onChange={onHitStrengthChange}
            />
            <InputField
              id="woundValue"
              label="To Wound (X+)"
              value={woundValue}
              min="1"
              max="7"
              onChange={onWoundValueChange}
            />
          </div>
          <div className="mt-4">
            <ReRollOptions config={rerollWoundConfig} onChange={onRerollWoundChange} />
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">Savings</p>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            <InputField
              id="armorSave"
              label="Armor Save (X+)"
              value={armorSave}
              min="1"
              max="7"
              onChange={onArmorSaveChange}
            />
            <InputField
              id="wardSave"
              label="Ward Save (X+)"
              value={wardSave}
              min="0"
              max="7"
              onChange={onWardSaveChange}
            />
          </div>
        </div>
      </div>

      <button
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

        <ProbabilityResultsCard results={results} poisonedAttack={poisonedAttack} />
      </Card>
      <DebugPanel
        lines={[
          { label: 'Initial rolls', value: '-' },
          { label: 'Re-rolls', value: '-' },
        ]}
      />
    </>
  );
}
