import Card from '@/components/ui/Card';
import InputField from '@/components/ui/InputField';
import ThrowDebugPanel, { type ThrowDebug } from '@/components/calculator/ThrowDebugPanel';
import ThrowResultsCard, { type ThrowResults } from '@/components/calculator/ThrowResultsCard';
import ReRollOptions, { type RerollConfig } from '@/components/calculator/ReRollOptions';

const formatRerollLabel = (config: RerollConfig) => {
  if (!config.enabled) {
    return 'Off';
  }
  const base = `${config.mode} / ${config.scope}`;
  if (config.scope === 'specific' && config.specificValues.trim()) {
    return `${base} (${config.specificValues})`;
  }
  return base;
};

type ThrowDiceCalculatorProps = {
  diceCount: string;
  attackersAc: string;
  defendersAc: string;
  throwHitStrength: string;
  targetToughness: string;
  throwArmorSave: string;
  throwWardSave: string;
  poisonedAttack: boolean;
  predatoryFighter: boolean;
  predatoryFighterCount: string;
  multipleWoundsEnabled: boolean;
  multipleWoundsValue: string;
  errorMessage: string;
  hasThrowResults: boolean;
  throwResults: ThrowResults;
  throwDebug: ThrowDebug;
  rerollHitConfig: RerollConfig;
  rerollWoundConfig: RerollConfig;
  rerollArmorConfig: RerollConfig;
  rerollWardConfig: RerollConfig;
  onDiceCountChange: (value: string) => void;
  onAttackersAcChange: (value: string) => void;
  onDefendersAcChange: (value: string) => void;
  onThrowHitStrengthChange: (value: string) => void;
  onTargetToughnessChange: (value: string) => void;
  onThrowArmorSaveChange: (value: string) => void;
  onThrowWardSaveChange: (value: string) => void;
  onPoisonedAttackChange: (value: boolean) => void;
  onPredatoryFighterChange: (value: boolean) => void;
  onPredatoryFighterCountChange: (value: string) => void;
  onMultipleWoundsChange: (value: boolean) => void;
  onMultipleWoundsValueChange: (value: string) => void;
  onCalculate: () => void;
  onRerollHitChange: (config: RerollConfig) => void;
  onRerollWoundChange: (config: RerollConfig) => void;
  onRerollArmorChange: (config: RerollConfig) => void;
  onRerollWardChange: (config: RerollConfig) => void;
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
  predatoryFighter,
  predatoryFighterCount,
  multipleWoundsEnabled,
  multipleWoundsValue,
  errorMessage,
  hasThrowResults,
  throwResults,
  throwDebug,
  rerollHitConfig,
  rerollWoundConfig,
  rerollArmorConfig,
  rerollWardConfig,
  onDiceCountChange,
  onAttackersAcChange,
  onDefendersAcChange,
  onThrowHitStrengthChange,
  onTargetToughnessChange,
  onThrowArmorSaveChange,
  onThrowWardSaveChange,
  onPoisonedAttackChange,
  onPredatoryFighterChange,
  onPredatoryFighterCountChange,
  onMultipleWoundsChange,
  onMultipleWoundsValueChange,
  onCalculate,
  onRerollHitChange,
  onRerollWoundChange,
  onRerollArmorChange,
  onRerollWardChange,
}: ThrowDiceCalculatorProps) {
  const trimmedMultipleWounds = multipleWoundsValue.trim();
  const isMultipleWoundsInvalid = multipleWoundsEnabled && trimmedMultipleWounds !== '' && (() => {
    if (trimmedMultipleWounds.toLowerCase().startsWith('d')) {
      const sides = Number.parseInt(trimmedMultipleWounds.slice(1), 10);
      return Number.isNaN(sides) || sides < 2;
    }
    const value = Number.parseInt(trimmedMultipleWounds, 10);
    return Number.isNaN(value) || value <= 0;
  })();

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
          <div className="mt-3 space-y-3">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
              <input
                type="checkbox"
                checked={predatoryFighter}
                onChange={(e) => onPredatoryFighterChange(e.target.checked)}
                className="h-4 w-4 border-2 border-zinc-900"
              />
              Predatory fighter
            </label>
            {predatoryFighter ? (
              <InputField
                id="throwPredatoryFighterCount"
                label="Predatory fighter count"
                value={predatoryFighterCount}
                min="0"
                onChange={onPredatoryFighterCountChange}
              />
            ) : null}
          </div>
          <div className="mt-4">
            <ReRollOptions config={rerollHitConfig} onChange={onRerollHitChange} />
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
          <div className="mt-3 space-y-3">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
              <input
                type="checkbox"
                checked={multipleWoundsEnabled}
                onChange={(e) => onMultipleWoundsChange(e.target.checked)}
                className="h-4 w-4 border-2 border-zinc-900"
              />
              Multiple wounds
            </label>
            {multipleWoundsEnabled ? (
              <InputField
                id="throwMultipleWoundsValue"
                label="Multiple wounds value"
                value={multipleWoundsValue}
                type="text"
                pattern="^(?:[dD]\\d+|\\d+)$"
                title="Use a number or dX (e.g. 2 or d6)"
                placeholder="Value or dX (e.g. 2 or d6)"
                onChange={onMultipleWoundsValueChange}
              />
            ) : null}
            {isMultipleWoundsInvalid ? (
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-600">
                Use a number (e.g. 2) or dX (e.g. d6).
              </p>
            ) : null}
          </div>
          <div className="mt-4">
            <ReRollOptions config={rerollWoundConfig} onChange={onRerollWoundChange} />
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">Savings</p>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            <div className="space-y-3">
              <InputField
                id="throwArmorSave"
                label="Armor Save (X+)"
                value={throwArmorSave}
                min="1"
                max="7"
                onChange={onThrowArmorSaveChange}
              />
              <ReRollOptions config={rerollArmorConfig} onChange={onRerollArmorChange} />
            </div>
            <div className="space-y-3">
              <InputField
                id="throwWardSave"
                label="Ward Save (X+)"
                value={throwWardSave}
                min="0"
                max="7"
                placeholder="Leave empty if none"
                onChange={onThrowWardSaveChange}
              />
              <ReRollOptions config={rerollWardConfig} onChange={onRerollWardChange} />
            </div>
          </div>
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
      {hasThrowResults ? <ThrowResultsCard results={throwResults} /> : null}
      <ThrowDebugPanel
        debug={throwDebug}
        wardSave={throwWardSave}
        rerollHitLabel={formatRerollLabel(rerollHitConfig)}
        rerollWoundLabel={formatRerollLabel(rerollWoundConfig)}
        rerollArmorLabel={formatRerollLabel(rerollArmorConfig)}
        rerollWardLabel={formatRerollLabel(rerollWardConfig)}
        poisonedAttack={poisonedAttack}
        multipleWoundsValue={multipleWoundsEnabled ? multipleWoundsValue : ''}
      />
    </Card>
  );
}
