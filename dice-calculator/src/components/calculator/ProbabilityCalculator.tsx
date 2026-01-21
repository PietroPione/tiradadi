import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ActionBar from '@/components/ui/ActionBar';
import InputField from '@/components/ui/InputField';
import StatGrid from '@/components/ui/StatGrid';
import ProbabilityResultsCard, { type ProbabilityResults } from '@/components/calculator/ProbabilityResultsCard';
import ReRollOptions, { type RerollConfig } from '@/components/calculator/ReRollOptions';
import DebugPanel from '@/components/ui/DebugPanel';
import CardHeader from '@/components/ui/CardHeader';
import SectionBlock from '@/components/ui/SectionBlock';

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

type ProbabilityCalculatorProps = {
  diceCount: string;
  hitValue: string;
  poisonedAttack: boolean;
  predatoryFighter: boolean;
  predatoryFighterCount: string;
  multipleWoundsEnabled: boolean;
  multipleWoundsValue: string;
  hitStrength: string;
  woundValue: string;
  armorSave: string;
  wardSave: string;
  errorMessage: string;
  results: ProbabilityResults;
  rerollHitConfig: RerollConfig;
  rerollWoundConfig: RerollConfig;
  rerollArmorConfig: RerollConfig;
  rerollWardConfig: RerollConfig;
  onDiceCountChange: (value: string) => void;
  onHitValueChange: (value: string) => void;
  onPoisonedAttackChange: (value: boolean) => void;
  onPredatoryFighterChange: (value: boolean) => void;
  onPredatoryFighterCountChange: (value: string) => void;
  onMultipleWoundsChange: (value: boolean) => void;
  onMultipleWoundsValueChange: (value: string) => void;
  onHitStrengthChange: (value: string) => void;
  onWoundValueChange: (value: string) => void;
  onArmorSaveChange: (value: string) => void;
  onWardSaveChange: (value: string) => void;
  onCalculate: () => void;
  onRerollHitChange: (config: RerollConfig) => void;
  onRerollWoundChange: (config: RerollConfig) => void;
  onRerollArmorChange: (config: RerollConfig) => void;
  onRerollWardChange: (config: RerollConfig) => void;
};

export default function ProbabilityCalculator({
  diceCount,
  hitValue,
  poisonedAttack,
  predatoryFighter,
  predatoryFighterCount,
  multipleWoundsEnabled,
  multipleWoundsValue,
  hitStrength,
  woundValue,
  armorSave,
  wardSave,
  errorMessage,
  results,
  rerollHitConfig,
  rerollWoundConfig,
  rerollArmorConfig,
  rerollWardConfig,
  onDiceCountChange,
  onHitValueChange,
  onPoisonedAttackChange,
  onPredatoryFighterChange,
  onPredatoryFighterCountChange,
  onMultipleWoundsChange,
  onMultipleWoundsValueChange,
  onHitStrengthChange,
  onWoundValueChange,
  onArmorSaveChange,
  onWardSaveChange,
  onCalculate,
  onRerollHitChange,
  onRerollWoundChange,
  onRerollArmorChange,
  onRerollWardChange,
}: ProbabilityCalculatorProps) {
  const parsedHitStrength = Number.parseInt(hitStrength, 10);
  const parsedArmorSave = Number.parseInt(armorSave, 10);
  const effectiveArmorSave = Number.isNaN(parsedHitStrength) || Number.isNaN(parsedArmorSave)
    ? '-'
    : `${parsedArmorSave + (parsedHitStrength - 3)}+`;
  const predatoryLabel = predatoryFighter ? predatoryFighterCount : '-';
  const multipleWoundsLabel = multipleWoundsEnabled ? (multipleWoundsValue.trim() || '-') : 'Off';
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
    <>
      <Card className="px-4 py-5 sm:px-6 sm:py-6">
      <CardHeader title="Probability calculator" />
      <div className="mt-4 space-y-5">
        <InputField
          id="diceCount"
          label="Dice Count"
          value={diceCount}
          min="1"
          onChange={onDiceCountChange}
        />
        <SectionBlock title="To hit" contentClassName="mt-3">
          <div className="grid grid-cols-1 gap-4 sm:gap-5">
            <div>
              <InputField
                id="hitValue"
                label="To Hit (X+)"
                value={hitValue}
                min="1"
                max="7"
                onChange={onHitValueChange}
              />
              <div className="mt-3 space-y-3">
                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
                  <input
                    type="checkbox"
                    checked={poisonedAttack}
                    onChange={(e) => onPoisonedAttackChange(e.target.checked)}
                    className="h-4 w-4 border-2 border-zinc-900"
                  />
                  Poisoned Attack
                </label>
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
                    id="predatoryFighterCount"
                    label="Predatory fighter count"
                    value={predatoryFighterCount}
                    min="0"
                    onChange={onPredatoryFighterCountChange}
                  />
                ) : null}
              </div>
            </div>
          </div>
          <div className="mt-4">
            <ReRollOptions config={rerollHitConfig} onChange={onRerollHitChange} compact />
          </div>
        </SectionBlock>
        <SectionBlock title="To wound" contentClassName="mt-3">
          <StatGrid
            fields={[
              {
                id: 'hitStrength',
                label: 'Hit Strength',
                value: hitStrength,
                min: '1',
                max: '10',
                onChange: onHitStrengthChange,
              },
              {
                id: 'woundValue',
                label: 'To Wound (X+)',
                value: woundValue,
                min: '1',
                max: '7',
                onChange: onWoundValueChange,
              },
            ]}
          />
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
                id="multipleWoundsValue"
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
            <ReRollOptions config={rerollWoundConfig} onChange={onRerollWoundChange} compact />
          </div>
        </SectionBlock>
        <SectionBlock title="Savings" contentClassName="mt-3">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            <div className="space-y-3">
              <StatGrid
                columns={1}
                fields={[
                  {
                    id: 'armorSave',
                    label: 'Armor Save (X+)',
                    value: armorSave,
                    min: '1',
                    max: '7',
                    onChange: onArmorSaveChange,
                  },
                ]}
              />
              <ReRollOptions config={rerollArmorConfig} onChange={onRerollArmorChange} compact />
            </div>
            <div className="space-y-3">
              <StatGrid
                columns={1}
                fields={[
                  {
                    id: 'wardSave',
                    label: 'Ward Save (X+)',
                    value: wardSave,
                    min: '0',
                    max: '7',
                    placeholder: 'Leave empty if none',
                    onChange: onWardSaveChange,
                  },
                ]}
              />
              <ReRollOptions config={rerollWardConfig} onChange={onRerollWardChange} compact />
            </div>
          </div>
        </SectionBlock>
      </div>

      <ActionBar>
        <Button onClick={onCalculate} fullWidth size="lg">
          Calculate
        </Button>
      </ActionBar>
      {errorMessage ? (
        <p className="mt-4 border-2 border-zinc-900 bg-zinc-100 px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-zinc-700">
          {errorMessage}
        </p>
      ) : null}

        <ProbabilityResultsCard results={results} poisonedAttack={poisonedAttack} />
      </Card>
      <DebugPanel
        lines={[
          { label: 'Dice count', value: diceCount || '-' },
          { label: 'To hit', value: hitValue ? `${hitValue}+` : '-' },
          { label: 'Poisoned', value: poisonedAttack ? 'Yes' : 'No' },
          { label: 'Predatory fighter', value: predatoryLabel },
          { label: 'Re-roll hit', value: formatRerollLabel(rerollHitConfig) },
          { label: 'To wound', value: woundValue ? `${woundValue}+` : '-' },
          { label: 'Multiple wounds', value: multipleWoundsLabel },
          { label: 'Re-roll wound', value: formatRerollLabel(rerollWoundConfig) },
          { label: 'Armor save', value: armorSave ? `${armorSave}+` : '-' },
          { label: 'Effective armor', value: effectiveArmorSave },
          { label: 'Re-roll armor', value: formatRerollLabel(rerollArmorConfig) },
          { label: 'Ward save', value: wardSave.trim() ? `${wardSave}+` : '-' },
          { label: 'Re-roll ward', value: formatRerollLabel(rerollWardConfig) },
        ]}
      />
    </>
  );
}
