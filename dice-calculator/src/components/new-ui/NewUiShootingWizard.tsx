import Card from '@/components/ui/Card';
import InputField from '@/components/ui/InputField';
import ReRollOptions, { type RerollConfig } from '@/components/calculator/ReRollOptions';
import DebugPanel from '@/components/ui/DebugPanel';

type ShootingModifiers = {
  longRange: boolean;
  movement: boolean;
  skirmisherTarget: boolean;
  lightCover: boolean;
  hardCover: boolean;
};

type NewUiShootingWizardProps = {
  step: number;
  mode: 'probability' | 'throw';
  diceCount: string;
  ballisticSkill: string;
  resultNeeded: number;
  modifiers: ShootingModifiers;
  poisonedAttack: boolean;
  autoHit: boolean;
  hitStrength: string;
  woundValue: string;
  targetToughness: string;
  armorSave: string;
  wardSave: string;
  rerollHitConfig: RerollConfig;
  rerollWoundConfig: RerollConfig;
  rerollArmorConfig: RerollConfig;
  rerollWardConfig: RerollConfig;
  onNext: () => void;
  onBack: () => void;
  onCalculate: () => void;
  onDiceCountChange: (value: string) => void;
  onBallisticSkillChange: (value: string) => void;
  onModifierChange: (key: keyof ShootingModifiers, value: boolean) => void;
  onPoisonedAttackChange: (value: boolean) => void;
  onAutoHitChange: (value: boolean) => void;
  onHitStrengthChange: (value: string) => void;
  onWoundValueChange: (value: string) => void;
  onTargetToughnessChange: (value: string) => void;
  onArmorSaveChange: (value: string) => void;
  onWardSaveChange: (value: string) => void;
  onRerollHitChange: (config: RerollConfig) => void;
  onRerollWoundChange: (config: RerollConfig) => void;
  onRerollArmorChange: (config: RerollConfig) => void;
  onRerollWardChange: (config: RerollConfig) => void;
};

const steps = [
  'To hit',
  'Special rules (hit)',
  'To wound',
  'Special rules (wound)',
  'Savings',
];

const renderResultNeeded = (resultNeeded: number, autoHit: boolean) => {
  if (autoHit) {
    return { main: 'Auto-hit', sub: 'All hits succeed' };
  }
  if (Number.isNaN(resultNeeded)) {
    return { main: '-', sub: null as string | null };
  }
  if (resultNeeded >= 10) {
    return { main: 'Impossible', sub: '10+ cannot be reached' };
  }
  if (resultNeeded >= 7) {
    return { main: '6+', sub: `then ${resultNeeded - 3}+` };
  }
  return { main: `${resultNeeded}+`, sub: null };
};

export default function NewUiShootingWizard({
  step,
  mode,
  diceCount,
  ballisticSkill,
  resultNeeded,
  modifiers,
  poisonedAttack,
  autoHit,
  hitStrength,
  woundValue,
  targetToughness,
  armorSave,
  wardSave,
  rerollHitConfig,
  rerollWoundConfig,
  rerollArmorConfig,
  rerollWardConfig,
  onNext,
  onBack,
  onCalculate,
  onDiceCountChange,
  onBallisticSkillChange,
  onModifierChange,
  onPoisonedAttackChange,
  onAutoHitChange,
  onHitStrengthChange,
  onWoundValueChange,
  onTargetToughnessChange,
  onArmorSaveChange,
  onWardSaveChange,
  onRerollHitChange,
  onRerollWoundChange,
  onRerollArmorChange,
  onRerollWardChange,
}: NewUiShootingWizardProps) {
  const isLast = step === steps.length - 1;
  const resultDisplay = renderResultNeeded(resultNeeded, autoHit);

  return (
    <Card className="px-4 py-5 sm:px-6 sm:py-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">Shooting phase</h2>
        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
          Step {step + 1} / {steps.length}: {steps[step]}
        </p>
      </div>

      <div className="mt-6 space-y-5">
        {step === 0 ? (
          <>
            <InputField
              id="newShootingDiceCount"
              label="Number of dice to throw"
              value={diceCount}
              min="1"
              onChange={onDiceCountChange}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-end sm:gap-5">
              <InputField
                id="newShootingBallistic"
                label="Balistic Skill"
                value={ballisticSkill}
                min="1"
                max="10"
                onChange={onBallisticSkillChange}
              />
              <div className="border-2 border-zinc-900 bg-zinc-900 px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-200">
                  Result needed
                </p>
                <p className="mt-1 font-mono text-2xl font-bold text-white">
                  {resultDisplay.main}
                </p>
                {resultDisplay.sub ? (
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-300">
                    {resultDisplay.sub}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
                <input
                  type="checkbox"
                  checked={modifiers.longRange}
                  onChange={(e) => onModifierChange('longRange', e.target.checked)}
                  className="h-4 w-4 border-2 border-zinc-900"
                />
                Long range
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
                <input
                  type="checkbox"
                  checked={modifiers.movement}
                  onChange={(e) => onModifierChange('movement', e.target.checked)}
                  className="h-4 w-4 border-2 border-zinc-900"
                />
                Movement
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
                <input
                  type="checkbox"
                  checked={modifiers.skirmisherTarget}
                  onChange={(e) => onModifierChange('skirmisherTarget', e.target.checked)}
                  className="h-4 w-4 border-2 border-zinc-900"
                />
                Skirmisher target
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
                <input
                  type="checkbox"
                  checked={modifiers.lightCover}
                  onChange={(e) => onModifierChange('lightCover', e.target.checked)}
                  className="h-4 w-4 border-2 border-zinc-900"
                />
                Light cover
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
                <input
                  type="checkbox"
                  checked={modifiers.hardCover}
                  onChange={(e) => onModifierChange('hardCover', e.target.checked)}
                  className="h-4 w-4 border-2 border-zinc-900"
                />
                Hard cover
              </label>
            </div>
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
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
              <input
                type="checkbox"
                checked={autoHit}
                onChange={(e) => onAutoHitChange(e.target.checked)}
                className="h-4 w-4 border-2 border-zinc-900"
              />
              Auto-hit
            </div>
            <ReRollOptions config={rerollHitConfig} onChange={onRerollHitChange} />
          </>
        ) : null}

        {step === 2 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            <InputField
              id="newShootingHitStrength"
              label="Hit Strength"
              value={hitStrength}
              min="1"
              onChange={onHitStrengthChange}
            />
            {mode === 'probability' ? (
              <InputField
                id="newShootingWoundValue"
                label="To Wound (X+)"
                value={woundValue}
                min="1"
                max="7"
                onChange={onWoundValueChange}
              />
            ) : (
              <InputField
                id="newShootingTargetToughness"
                label="Target Toughness"
                value={targetToughness}
                min="1"
                onChange={onTargetToughnessChange}
              />
            )}
          </div>
        ) : null}

        {step === 3 ? (
          <ReRollOptions config={rerollWoundConfig} onChange={onRerollWoundChange} />
        ) : null}

        {step === 4 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            <div className="space-y-3">
              <InputField
                id="newShootingArmorSave"
                label="Armor Save (X+)"
                value={armorSave}
                min="1"
                max="7"
                onChange={onArmorSaveChange}
              />
              <ReRollOptions config={rerollArmorConfig} onChange={onRerollArmorChange} />
            </div>
            <div className="space-y-3">
              <InputField
                id="newShootingWardSave"
                label="Ward Save (X+)"
                value={wardSave}
                min="0"
                max="7"
                placeholder="Leave empty if none"
                onChange={onWardSaveChange}
              />
              <ReRollOptions config={rerollWardConfig} onChange={onRerollWardChange} />
            </div>
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
