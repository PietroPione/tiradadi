import Card from '@/components/ui/Card';
import CardHeader from '@/components/ui/CardHeader';
import SectionBlock from '@/components/ui/SectionBlock';
import StatGrid from '@/components/ui/StatGrid';
import InputField from '@/components/ui/InputField';
import ToggleButton from '@/components/ui/ToggleButton';
import ActionBar from '@/components/ui/ActionBar';
import Button from '@/components/ui/Button';
import ProbabilityResultsCard, { type ProbabilityResults } from '@/components/calculator/ProbabilityResultsCard';
import ReRollOptions, { type RerollConfig } from '@/components/calculator/ReRollOptions';
import DebugPanel from '@/components/ui/DebugPanel';
import { getHitTarget, getWoundTarget } from '@/lib/games/wfb8/roll-utils';

type Hh2CombatPhaseCalculatorProps = {
  diceCount: string;
  mode: 'probability' | 'throw' | null;
  attackersAc: string;
  defendersAc: string;
  hitStrength: string;
  targetToughness: string;
  targetWounds: string;
  targetType: 'living' | 'vehicle';
  targetArmorValue: string;
  armorSave: string;
  wardSave: string;
  instantDeath: boolean;
  deflagrate: boolean;
  breachingEnabled: boolean;
  breachingValue: string;
  rendingEnabled: boolean;
  rendingValue: string;
  murderousEnabled: boolean;
  murderousValue: string;
  errorMessage: string;
  probabilityResults: ProbabilityResults;
  throwResults: ProbabilityResults;
  hasProbabilityResults: boolean;
  hasThrowResults: boolean;
  rerollHitConfig: RerollConfig;
  rerollWoundConfig: RerollConfig;
  rerollArmorConfig: RerollConfig;
  rerollWardConfig: RerollConfig;
  onDiceCountChange: (value: string) => void;
  onAttackersAcChange: (value: string) => void;
  onDefendersAcChange: (value: string) => void;
  onHitStrengthChange: (value: string) => void;
  onTargetToughnessChange: (value: string) => void;
  onTargetWoundsChange: (value: string) => void;
  onTargetTypeChange: (value: 'living' | 'vehicle') => void;
  onTargetArmorValueChange: (value: string) => void;
  onArmorSaveChange: (value: string) => void;
  onWardSaveChange: (value: string) => void;
  onInstantDeathChange: (value: boolean) => void;
  onDeflagrateChange: (value: boolean) => void;
  onBreachingEnabledChange: (value: boolean) => void;
  onBreachingValueChange: (value: string) => void;
  onRendingEnabledChange: (value: boolean) => void;
  onRendingValueChange: (value: string) => void;
  onMurderousEnabledChange: (value: boolean) => void;
  onMurderousValueChange: (value: string) => void;
  onAverageCalculate: () => void;
  onThrowCalculate: () => void;
  onRerollHitChange: (config: RerollConfig) => void;
  onRerollWoundChange: (config: RerollConfig) => void;
  onRerollArmorChange: (config: RerollConfig) => void;
  onRerollWardChange: (config: RerollConfig) => void;
};

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

export default function Hh2CombatPhaseCalculator({
  diceCount,
  mode,
  attackersAc,
  defendersAc,
  hitStrength,
  targetToughness,
  targetWounds,
  targetType,
  targetArmorValue,
  armorSave,
  wardSave,
  instantDeath,
  deflagrate,
  breachingEnabled,
  breachingValue,
  rendingEnabled,
  rendingValue,
  murderousEnabled,
  murderousValue,
  errorMessage,
  probabilityResults,
  throwResults,
  hasProbabilityResults,
  hasThrowResults,
  rerollHitConfig,
  rerollWoundConfig,
  rerollArmorConfig,
  rerollWardConfig,
  onDiceCountChange,
  onAttackersAcChange,
  onDefendersAcChange,
  onHitStrengthChange,
  onTargetToughnessChange,
  onTargetWoundsChange,
  onTargetTypeChange,
  onTargetArmorValueChange,
  onArmorSaveChange,
  onWardSaveChange,
  onInstantDeathChange,
  onDeflagrateChange,
  onBreachingEnabledChange,
  onBreachingValueChange,
  onRendingEnabledChange,
  onRendingValueChange,
  onMurderousEnabledChange,
  onMurderousValueChange,
  onAverageCalculate,
  onThrowCalculate,
  onRerollHitChange,
  onRerollWoundChange,
  onRerollArmorChange,
  onRerollWardChange,
}: Hh2CombatPhaseCalculatorProps) {
  const isProbability = mode === 'probability';
  const parsedAttackersAc = Number.parseInt(attackersAc, 10);
  const parsedDefendersAc = Number.parseInt(defendersAc, 10);
  const parsedStrength = Number.parseInt(hitStrength, 10);
  const parsedToughness = Number.parseInt(targetToughness, 10);
  const parsedArmorValue = targetArmorValue.trim() === '' ? 0 : Number.parseInt(targetArmorValue, 10);
  const hitTarget = Number.isNaN(parsedAttackersAc) || Number.isNaN(parsedDefendersAc)
    ? null
    : getHitTarget(parsedAttackersAc, parsedDefendersAc);
  const woundTarget = Number.isNaN(parsedStrength) || Number.isNaN(parsedToughness)
    ? null
    : getWoundTarget(parsedStrength, parsedToughness);
  const vehicleRequiredRoll = targetType === 'vehicle' && !Number.isNaN(parsedArmorValue) && !Number.isNaN(parsedStrength)
    ? parsedArmorValue - parsedStrength
    : null;
  const vehicleResultDisplay = vehicleRequiredRoll === null || Number.isNaN(vehicleRequiredRoll)
    ? { main: '-', sub: null }
    : vehicleRequiredRoll > 6
      ? { main: 'Impossible', sub: 'Armor value is too high' }
      : vehicleRequiredRoll <= 1
        ? { main: 'Any roll', sub: null }
        : { main: `${vehicleRequiredRoll}+`, sub: null };

  return (
    <Card className="px-4 py-5 sm:px-6 sm:py-6">
      <CardHeader title="Horus Heresy combat" />
      <div className="mt-4 space-y-5">
        <InputField
          id="hh2CombatDiceCount"
          label="Dice Count"
          value={diceCount}
          min="1"
          onChange={onDiceCountChange}
        />
        <SectionBlock title="To hit" contentClassName="mt-3">
          <StatGrid
            columns={2}
            fields={[
              {
                id: 'hh2CombatAttackersAc',
                label: 'Attackers WS',
                value: attackersAc,
                min: '1',
                onChange: onAttackersAcChange,
              },
              {
                id: 'hh2CombatDefendersAc',
                label: 'Defenders WS',
                value: defendersAc,
                min: '1',
                onChange: onDefendersAcChange,
              },
            ]}
          />
          <div className="mt-3 border-2 border-zinc-900 bg-zinc-900 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-200">
              Result needed
            </p>
            <p className="mt-1 font-mono text-2xl font-bold text-white">
              {hitTarget ? `${hitTarget}+` : '-'}
            </p>
          </div>
          <div className="mt-3">
            <ReRollOptions config={rerollHitConfig} onChange={onRerollHitChange} compact />
          </div>
        </SectionBlock>

        <SectionBlock title="Target" contentClassName="mt-3">
          <div className="flex flex-wrap gap-2">
            <ToggleButton
              active={targetType === 'living'}
              onClick={() => onTargetTypeChange('living')}
              size="sm"
            >
              Living target
            </ToggleButton>
            <ToggleButton
              active={targetType === 'vehicle'}
              onClick={() => onTargetTypeChange('vehicle')}
              size="sm"
            >
              Vehicle
            </ToggleButton>
          </div>
        </SectionBlock>

        <SectionBlock title={targetType === 'vehicle' ? 'To penetrate' : 'To wound'} contentClassName="mt-3">
          {targetType === 'living' ? (
            <>
              <StatGrid
                columns={2}
                fields={[
                  {
                    id: 'hh2CombatStrength',
                    label: 'Strength',
                    value: hitStrength,
                    min: '1',
                    onChange: onHitStrengthChange,
                  },
                  {
                    id: 'hh2CombatToughness',
                    label: 'Toughness',
                    value: targetToughness,
                    min: '1',
                    onChange: onTargetToughnessChange,
                  },
                  {
                    id: 'hh2CombatTargetWounds',
                    label: 'Target Wounds',
                    value: targetWounds,
                    min: '1',
                    onChange: onTargetWoundsChange,
                  },
                ]}
              />
              <div className="mt-3 border-2 border-zinc-900 bg-zinc-900 px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-200">
                  Result needed
                </p>
                <p className="mt-1 font-mono text-2xl font-bold text-white">
                  {woundTarget ? `${woundTarget}+` : '-'}
                </p>
              </div>
              <div className="mt-3 space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
                  <input
                    type="checkbox"
                    checked={instantDeath}
                    onChange={(e) => onInstantDeathChange(e.target.checked)}
                    className="h-4 w-4 border-2 border-zinc-900"
                  />
                  Instant death
                </label>
              </div>
            </>
          ) : (
            <>
              <StatGrid
                columns={2}
                fields={[
                  {
                    id: 'hh2CombatStrength',
                    label: 'Strength',
                    value: hitStrength,
                    min: '1',
                    onChange: onHitStrengthChange,
                  },
                  {
                    id: 'hh2CombatArmorValue',
                    label: 'Armor Value',
                    value: targetArmorValue,
                    min: '0',
                    onChange: onTargetArmorValueChange,
                  },
                ]}
              />
              <div className="mt-3 border-2 border-zinc-900 bg-zinc-900 px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-200">
                  Result needed
                </p>
                <p className="mt-1 font-mono text-2xl font-bold text-white">
                  {vehicleResultDisplay.main}
                </p>
                {vehicleResultDisplay.sub ? (
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-300">
                    {vehicleResultDisplay.sub}
                  </p>
                ) : null}
              </div>
            </>
          )}
        </SectionBlock>

        <SectionBlock title={targetType === 'vehicle' ? 'Re-roll to penetrate' : 'Re-roll to wound'} contentClassName="mt-3">
          <ReRollOptions config={rerollWoundConfig} onChange={onRerollWoundChange} compact />
        </SectionBlock>

        {targetType === 'living' ? (
          <SectionBlock title="Special rules" contentClassName="mt-3">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
                <input
                  type="checkbox"
                  checked={deflagrate}
                  onChange={(e) => onDeflagrateChange(e.target.checked)}
                  className="h-4 w-4 border-2 border-zinc-900"
                />
                Deflagrate
              </label>
              <div className="flex flex-wrap gap-3">
                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
                  <input
                    type="checkbox"
                    checked={breachingEnabled}
                    onChange={(e) => onBreachingEnabledChange(e.target.checked)}
                    className="h-4 w-4 border-2 border-zinc-900"
                  />
                  Breaching
                </label>
                {breachingEnabled ? (
                  <InputField
                    id="hh2CombatBreachingValue"
                    label="Breaching value (X+)"
                    value={breachingValue}
                    min="1"
                    max="6"
                    onChange={onBreachingValueChange}
                  />
                ) : null}
              </div>
              <div className="flex flex-wrap gap-3">
                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
                  <input
                    type="checkbox"
                    checked={rendingEnabled}
                    onChange={(e) => onRendingEnabledChange(e.target.checked)}
                    className="h-4 w-4 border-2 border-zinc-900"
                  />
                  Rending
                </label>
                {rendingEnabled ? (
                  <InputField
                    id="hh2CombatRendingValue"
                    label="Rending value (X+)"
                    value={rendingValue}
                    min="1"
                    max="6"
                    onChange={onRendingValueChange}
                  />
                ) : null}
              </div>
              <div className="flex flex-wrap gap-3">
                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
                  <input
                    type="checkbox"
                    checked={murderousEnabled}
                    onChange={(e) => onMurderousEnabledChange(e.target.checked)}
                    className="h-4 w-4 border-2 border-zinc-900"
                  />
                  Murderous strike
                </label>
                {murderousEnabled ? (
                  <InputField
                    id="hh2CombatMurderousValue"
                    label="Murderous value (X+)"
                    value={murderousValue}
                    min="1"
                    max="6"
                    onChange={onMurderousValueChange}
                  />
                ) : null}
              </div>
            </div>
          </SectionBlock>
        ) : null}

        {targetType === 'living' ? (
          <SectionBlock title="Saves" contentClassName="mt-3">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
              <div className="space-y-3">
                <StatGrid
                  columns={1}
                  fields={[
                    {
                      id: 'hh2CombatArmorSave',
                      label: 'Armor Save (X+)',
                      value: armorSave,
                      min: '0',
                      max: '7',
                      placeholder: 'Leave empty if none',
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
                      id: 'hh2CombatInvulnerableSave',
                      label: 'Invulnerable Save (X+)',
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
        ) : null}

        <SectionBlock title="Re-roll summary" contentClassName="mt-3">
          <div className="grid grid-cols-1 gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600 sm:grid-cols-2">
            <div>Hit: <span className="font-mono text-zinc-900">{formatRerollLabel(rerollHitConfig)}</span></div>
            <div>{targetType === 'vehicle' ? 'Penetrate' : 'Wound'}: <span className="font-mono text-zinc-900">{formatRerollLabel(rerollWoundConfig)}</span></div>
            <div>Armor: <span className="font-mono text-zinc-900">{formatRerollLabel(rerollArmorConfig)}</span></div>
            <div>Invulnerable: <span className="font-mono text-zinc-900">{formatRerollLabel(rerollWardConfig)}</span></div>
          </div>
        </SectionBlock>
      </div>

      <ActionBar>
        <Button type="button" onClick={isProbability ? onAverageCalculate : onThrowCalculate} fullWidth size="lg">
          Calculate
        </Button>
      </ActionBar>

      {errorMessage ? (
        <p className="mt-4 border-2 border-zinc-900 bg-zinc-100 px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-zinc-700">
          {errorMessage}
        </p>
      ) : null}

      {isProbability && hasProbabilityResults ? (
        <ProbabilityResultsCard results={probabilityResults} poisonedAttack={false} wardLabel="Invulnerable" />
      ) : null}

      {!isProbability && hasThrowResults ? (
        <ProbabilityResultsCard results={throwResults} poisonedAttack={false} wardLabel="Invulnerable" />
      ) : null}

      <DebugPanel
        lines={[
          { label: 'Dice count', value: diceCount || '-' },
          { label: 'Hit target', value: hitTarget ? `${hitTarget}+` : '-' },
          { label: 'Target', value: targetType },
          {
            label: targetType === 'vehicle' ? 'Penetration needed' : 'Wound needed',
            value: targetType === 'vehicle'
              ? (vehicleResultDisplay.main === '-' ? '-' : vehicleResultDisplay.main)
              : (woundTarget ? `${woundTarget}+` : '-'),
          },
          { label: 'Armor value', value: targetType === 'vehicle' ? (targetArmorValue.trim() || '-') : '-' },
          { label: 'Armor save', value: armorSave.trim() ? `${armorSave}+` : '-' },
          { label: 'Invulnerable save', value: wardSave.trim() ? `${wardSave}+` : '-' },
          { label: 'Instant death', value: instantDeath ? 'Yes' : 'No' },
          { label: 'Deflagrate', value: deflagrate ? 'Yes' : 'No' },
          { label: 'Breaching', value: breachingEnabled ? (breachingValue.trim() ? `${breachingValue}+` : 'On') : 'Off' },
          { label: 'Rending', value: rendingEnabled ? (rendingValue.trim() ? `${rendingValue}+` : 'On') : 'Off' },
          { label: 'Murderous strike', value: murderousEnabled ? (murderousValue.trim() ? `${murderousValue}+` : 'On') : 'Off' },
          { label: 'Re-roll hit', value: formatRerollLabel(rerollHitConfig) },
          { label: 'Re-roll wound', value: formatRerollLabel(rerollWoundConfig) },
          { label: 'Re-roll armor', value: formatRerollLabel(rerollArmorConfig) },
          { label: 'Re-roll invulnerable', value: formatRerollLabel(rerollWardConfig) },
        ]}
      />
    </Card>
  );
}
