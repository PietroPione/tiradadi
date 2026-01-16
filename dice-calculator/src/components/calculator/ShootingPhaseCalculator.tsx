import Card from '@/components/ui/Card';
import InputField from '@/components/ui/InputField';
import ModeSwitch from '@/components/calculator/ModeSwitch';
import ProbabilityResultsCard, { type ProbabilityResults } from '@/components/calculator/ProbabilityResultsCard';

type ShootingPhaseCalculatorProps = {
  diceCount: string;
  mode: 'probability' | 'throw';
  ballisticSkill: string;
  poisonedAttack: boolean;
  autoHit: boolean;
  hitStrength: string;
  targetToughness: string;
  woundValue: string;
  armorSave: string;
  wardSave: string;
  resultNeeded: number;
  modifiers: {
    longRange: boolean;
    movement: boolean;
    skirmisherTarget: boolean;
    lightCover: boolean;
    hardCover: boolean;
  };
  errorMessage: string;
  probabilityResults: ProbabilityResults;
  throwResults: ProbabilityResults;
  hasProbabilityResults: boolean;
  hasThrowResults: boolean;
  onDiceCountChange: (value: string) => void;
  onModeChange: (mode: 'probability' | 'throw') => void;
  onBallisticSkillChange: (value: string) => void;
  onPoisonedAttackChange: (value: boolean) => void;
  onAutoHitChange: (value: boolean) => void;
  onHitStrengthChange: (value: string) => void;
  onTargetToughnessChange: (value: string) => void;
  onWoundValueChange: (value: string) => void;
  onArmorSaveChange: (value: string) => void;
  onWardSaveChange: (value: string) => void;
  onModifierChange: (key: keyof ShootingPhaseCalculatorProps['modifiers'], value: boolean) => void;
  onAverageCalculate: () => void;
  onThrowCalculate: () => void;
  onBack: () => void;
};

export default function ShootingPhaseCalculator({
  diceCount,
  mode,
  ballisticSkill,
  poisonedAttack,
  autoHit,
  hitStrength,
  targetToughness,
  woundValue,
  armorSave,
  wardSave,
  resultNeeded,
  modifiers,
  errorMessage,
  probabilityResults,
  throwResults,
  hasProbabilityResults,
  hasThrowResults,
  onDiceCountChange,
  onModeChange,
  onBallisticSkillChange,
  onPoisonedAttackChange,
  onAutoHitChange,
  onHitStrengthChange,
  onTargetToughnessChange,
  onWoundValueChange,
  onArmorSaveChange,
  onWardSaveChange,
  onModifierChange,
  onAverageCalculate,
  onThrowCalculate,
  onBack,
}: ShootingPhaseCalculatorProps) {
  const isProbability = mode === 'probability';
  const renderResultNeeded = () => {
    if (Number.isNaN(resultNeeded)) {
      return {
        main: '-',
        sub: null as string | null,
      };
    }
    if (resultNeeded >= 10) {
      return {
        main: 'Impossible',
        sub: '10+ cannot be reached',
      };
    }
    if (resultNeeded >= 7) {
      const followUp = resultNeeded - 3;
      return {
        main: '6+',
        sub: `then ${followUp}+`,
      };
    }
    return {
      main: `${resultNeeded}+`,
      sub: null,
    };
  };

  const resultDisplay = renderResultNeeded();
  const isPoisonedActive = poisonedAttack && resultNeeded <= 6 && !autoHit;

  return (
    <Card className="px-4 py-5 sm:px-6 sm:py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">Shooting phase</h2>
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
          id="shootingDiceCount"
          label="Dice Count"
          value={diceCount}
          min="1"
          onChange={onDiceCountChange}
        />
        {!autoHit ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-end sm:gap-5">
            <InputField
              id="ballisticSkill"
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
        ) : (
          <div className="border-2 border-zinc-900 bg-zinc-900 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-200">
              Result needed
            </p>
            <p className="mt-1 font-mono text-2xl font-bold text-white">
              Auto-hit
            </p>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-300">
              All hits succeed
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">Special rules</p>
            <div className="mt-3 space-y-3">
              {!autoHit ? (
                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
                  <input
                    type="checkbox"
                    checked={poisonedAttack}
                    onChange={(e) => onPoisonedAttackChange(e.target.checked)}
                    className="h-4 w-4 border-2 border-zinc-900"
                  />
                  Poisoned Attack
                </label>
              ) : null}
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
                <input
                  type="checkbox"
                  checked={autoHit}
                  onChange={(e) => onAutoHitChange(e.target.checked)}
                  className="h-4 w-4 border-2 border-zinc-900"
                />
                Auto-hit
              </label>
            </div>
          </div>

          {!autoHit ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">Cover</p>
              <div className="mt-3 space-y-3">
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
            </div>
          ) : null}
        </div>

        {!autoHit ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">Modifiers</p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
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
            </div>
          </div>
        ) : null}

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">To wound</p>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            <InputField
              id="shootingHitStrength"
              label="Hit Strength"
              value={hitStrength}
              min="1"
              onChange={onHitStrengthChange}
            />
            {isProbability ? (
              <InputField
                id="shootingWoundValue"
                label="To Wound (X+)"
                value={woundValue}
                min="1"
                max="7"
                onChange={onWoundValueChange}
              />
            ) : (
              <InputField
                id="shootingTargetToughness"
                label="Target Toughness"
                value={targetToughness}
                min="1"
                onChange={onTargetToughnessChange}
              />
            )}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">Savings</p>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            <InputField
              id="shootingArmorSave"
              label="Armor Save (X+)"
              value={armorSave}
              min="1"
              max="7"
              onChange={onArmorSaveChange}
            />
            <InputField
              id="shootingWardSave"
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

      {isProbability && hasProbabilityResults ? (
        <ProbabilityResultsCard results={probabilityResults} poisonedAttack={isPoisonedActive} />
      ) : null}

      {!isProbability && hasThrowResults ? (
        <ProbabilityResultsCard results={throwResults} poisonedAttack={isPoisonedActive} />
      ) : null}
    </Card>
  );
}
