import Card from '@/components/ui/Card';
import InputField from '@/components/ui/InputField';
import ReRollOptions, { type RerollConfig } from '@/components/calculator/ReRollOptions';
import DebugPanel from '@/components/ui/DebugPanel';

type NewUiCombatWizardProps = {
  step: number;
  mode: 'probability' | 'throw';
  diceCount: string;
  hitValue: string;
  attackersAc: string;
  defendersAc: string;
  poisonedAttack: boolean;
  hitStrength: string;
  woundValue: string;
  targetToughness: string;
  armorSave: string;
  wardSave: string;
  rerollHitConfig: RerollConfig;
  rerollWoundConfig: RerollConfig;
  onNext: () => void;
  onBack: () => void;
  onCalculate: () => void;
  onDiceCountChange: (value: string) => void;
  onHitValueChange: (value: string) => void;
  onAttackersAcChange: (value: string) => void;
  onDefendersAcChange: (value: string) => void;
  onPoisonedAttackChange: (value: boolean) => void;
  onHitStrengthChange: (value: string) => void;
  onWoundValueChange: (value: string) => void;
  onTargetToughnessChange: (value: string) => void;
  onArmorSaveChange: (value: string) => void;
  onWardSaveChange: (value: string) => void;
  onRerollHitChange: (config: RerollConfig) => void;
  onRerollWoundChange: (config: RerollConfig) => void;
};

const steps = [
  'To hit',
  'Special rules (hit)',
  'To wound',
  'Special rules (wound)',
  'Savings',
];

export default function NewUiCombatWizard({
  step,
  mode,
  diceCount,
  hitValue,
  attackersAc,
  defendersAc,
  poisonedAttack,
  hitStrength,
  woundValue,
  targetToughness,
  armorSave,
  wardSave,
  rerollHitConfig,
  rerollWoundConfig,
  onNext,
  onBack,
  onCalculate,
  onDiceCountChange,
  onHitValueChange,
  onAttackersAcChange,
  onDefendersAcChange,
  onPoisonedAttackChange,
  onHitStrengthChange,
  onWoundValueChange,
  onTargetToughnessChange,
  onArmorSaveChange,
  onWardSaveChange,
  onRerollHitChange,
  onRerollWoundChange,
}: NewUiCombatWizardProps) {
  const isLast = step === steps.length - 1;

  return (
    <Card className="px-4 py-5 sm:px-6 sm:py-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">Combat phase</h2>
        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
          Step {step + 1} / {steps.length}: {steps[step]}
        </p>
      </div>

      <div className="mt-6 space-y-5">
        {step === 0 ? (
          <>
            <InputField
              id="newCombatDiceCount"
              label="Number of dice to throw"
              value={diceCount}
              min="1"
              onChange={onDiceCountChange}
            />
            {mode === 'probability' ? (
              <InputField
                id="newCombatHitValue"
                label="To Hit (X+)"
                value={hitValue}
                min="1"
                max="7"
                onChange={onHitValueChange}
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                <InputField
                  id="newCombatAttackersAc"
                  label="Attackers AC"
                  value={attackersAc}
                  min="1"
                  onChange={onAttackersAcChange}
                />
                <InputField
                  id="newCombatDefendersAc"
                  label="Defenders AC"
                  value={defendersAc}
                  min="1"
                  onChange={onDefendersAcChange}
                />
              </div>
            )}
          </>
        ) : null}

        {step === 1 ? (
          <>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
              <input
                type="checkbox"
                checked={poisonedAttack}
                onChange={(e) => onPoisonedAttackChange(e.target.checked)}
                className="h-4 w-4 border-2 border-zinc-900"
              />
              Poisoned Attack
            </div>
            <ReRollOptions config={rerollHitConfig} onChange={onRerollHitChange} />
          </>
        ) : null}

        {step === 2 ? (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
              <InputField
                id="newCombatHitStrength"
                label="Hit Strength"
                value={hitStrength}
                min="1"
                max="10"
                onChange={onHitStrengthChange}
              />
              {mode === 'probability' ? (
                <InputField
                  id="newCombatWoundValue"
                  label="To Wound (X+)"
                  value={woundValue}
                  min="1"
                  max="7"
                  onChange={onWoundValueChange}
                />
              ) : (
                <InputField
                  id="newCombatTargetToughness"
                  label="Target Toughness"
                  value={targetToughness}
                  min="1"
                  onChange={onTargetToughnessChange}
                />
              )}
            </div>
          </>
        ) : null}

        {step === 3 ? (
          <ReRollOptions config={rerollWoundConfig} onChange={onRerollWoundChange} />
        ) : null}

        {step === 4 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            <InputField
              id="newCombatArmorSave"
              label="Armor Save (X+)"
              value={armorSave}
              min="1"
              max="7"
              onChange={onArmorSaveChange}
            />
            <InputField
              id="newCombatWardSave"
              label="Ward Save (X+)"
              value={wardSave}
              min="0"
              max="7"
              onChange={onWardSaveChange}
            />
          </div>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="border-2 border-zinc-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors hover:bg-zinc-900 hover:text-white"
        >
          Back
        </button>
        <button
          type="button"
          onClick={isLast ? onCalculate : onNext}
          className="border-2 border-zinc-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors hover:bg-zinc-900 hover:text-white"
        >
          {isLast ? 'Calculate' : 'Next'}
        </button>
      </div>

      <DebugPanel
        lines={[
          { label: 'Initial rolls', value: '-' },
          { label: 'Re-rolls', value: '-' },
        ]}
      />
    </Card>
  );
}
