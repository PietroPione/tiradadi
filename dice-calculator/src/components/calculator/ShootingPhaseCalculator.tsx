import Card from '@/components/ui/Card';
import ActionBar from '@/components/ui/ActionBar';
import Button from '@/components/ui/Button';
import InputField from '@/components/ui/InputField';
import ProbabilityResultsCard, { type ProbabilityResults } from '@/components/calculator/ProbabilityResultsCard';
import ReRollOptions, { type RerollConfig } from '@/components/calculator/ReRollOptions';
import DebugPanel from '@/components/ui/DebugPanel';
import CardHeader from '@/components/ui/CardHeader';
import SectionBlock from '@/components/ui/SectionBlock';
import StatGrid from '@/components/ui/StatGrid';
import ShootingCompareRange from '@/components/calculator/ShootingCompareRange';
import OptionGroup from '@/components/ui/OptionGroup';

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

type ShootingPhaseCalculatorProps = {
  diceCount: string;
  mode: 'probability' | 'throw' | null;
  probabilityMode: 'single' | 'range' | null;
  ballisticSkill: string;
  poisonedAttack: boolean;
  autoHit: boolean;
  multipleWoundsEnabled: boolean;
  multipleWoundsValue: string;
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
  rerollHitConfig: RerollConfig;
  rerollWoundConfig: RerollConfig;
  rerollArmorConfig: RerollConfig;
  rerollWardConfig: RerollConfig;
  debug: {
    hitInitialRolls: number[];
    hitRerollRolls: number[];
    woundInitialRolls: number[];
    woundRerollRolls: number[];
    armorInitialRolls: number[];
    armorRerollRolls: number[];
    wardInitialRolls: number[];
    wardRerollRolls: number[];
    multipleWoundsRolls: number[];
  };
  onDiceCountChange: (value: string) => void;
  onProbabilityModeChange: (mode: 'single' | 'range' | null) => void;
  onBallisticSkillChange: (value: string) => void;
  onPoisonedAttackChange: (value: boolean) => void;
  onAutoHitChange: (value: boolean) => void;
  onMultipleWoundsChange: (value: boolean) => void;
  onMultipleWoundsValueChange: (value: string) => void;
  onHitStrengthChange: (value: string) => void;
  onTargetToughnessChange: (value: string) => void;
  onWoundValueChange: (value: string) => void;
  onArmorSaveChange: (value: string) => void;
  onWardSaveChange: (value: string) => void;
  onModifierChange: (key: keyof ShootingPhaseCalculatorProps['modifiers'], value: boolean) => void;
  onAverageCalculate: () => void;
  onThrowCalculate: () => void;
  onBack: () => void;
  onRerollHitChange: (config: RerollConfig) => void;
  onRerollWoundChange: (config: RerollConfig) => void;
  onRerollArmorChange: (config: RerollConfig) => void;
  onRerollWardChange: (config: RerollConfig) => void;
};

export default function ShootingPhaseCalculator({
  diceCount,
  mode,
  probabilityMode,
  ballisticSkill,
  poisonedAttack,
  autoHit,
  multipleWoundsEnabled,
  multipleWoundsValue,
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
  rerollHitConfig,
  rerollWoundConfig,
  rerollArmorConfig,
  rerollWardConfig,
  debug,
  onDiceCountChange,
  onProbabilityModeChange,
  onBallisticSkillChange,
  onPoisonedAttackChange,
  onAutoHitChange,
  onMultipleWoundsChange,
  onMultipleWoundsValueChange,
  onHitStrengthChange,
  onTargetToughnessChange,
  onWoundValueChange,
  onArmorSaveChange,
  onWardSaveChange,
  onModifierChange,
  onAverageCalculate,
  onThrowCalculate,
  onBack,
  onRerollHitChange,
  onRerollWoundChange,
  onRerollArmorChange,
  onRerollWardChange,
}: ShootingPhaseCalculatorProps) {
  const isProbability = mode === 'probability';
  const activeProbabilityMode = probabilityMode ?? 'single';
  const toggleLabel = activeProbabilityMode === 'range' ? 'Single value' : 'Comparation';
  const toggleMode = () => onProbabilityModeChange(activeProbabilityMode === 'range' ? 'single' : 'range');

  if (isProbability && activeProbabilityMode === 'range') {
    return (
      <ShootingCompareRange
        diceCount={diceCount}
        ballisticSkill={ballisticSkill}
        modifiers={modifiers}
        poisonedAttack={poisonedAttack}
        autoHit={autoHit}
        multipleWoundsEnabled={multipleWoundsEnabled}
        multipleWoundsValue={multipleWoundsValue}
        hitStrength={hitStrength}
        woundValue={woundValue}
        armorSave={armorSave}
        wardSave={wardSave}
        rerollHitConfig={rerollHitConfig}
        rerollWoundConfig={rerollWoundConfig}
        rerollArmorConfig={rerollArmorConfig}
        rerollWardConfig={rerollWardConfig}
        onBack={onBack}
        backLabel="Back to phases"
        rightSlot={(
          <Button size="sm" onClick={toggleMode}>
            {toggleLabel}
          </Button>
        )}
        onDiceCountChange={onDiceCountChange}
        onBallisticSkillChange={onBallisticSkillChange}
        onModifierChange={onModifierChange}
        onPoisonedAttackChange={onPoisonedAttackChange}
        onAutoHitChange={onAutoHitChange}
        onMultipleWoundsChange={onMultipleWoundsChange}
        onMultipleWoundsValueChange={onMultipleWoundsValueChange}
        onHitStrengthChange={onHitStrengthChange}
        onWoundValueChange={onWoundValueChange}
        onArmorSaveChange={onArmorSaveChange}
        onWardSaveChange={onWardSaveChange}
        onRerollHitChange={onRerollHitChange}
        onRerollWoundChange={onRerollWoundChange}
        onRerollArmorChange={onRerollArmorChange}
        onRerollWardChange={onRerollWardChange}
      />
    );
  }
  const modifiersLabel = [
    modifiers.longRange ? 'Long range' : null,
    modifiers.movement ? 'Movement' : null,
    modifiers.skirmisherTarget ? 'Skirmisher target' : null,
  ].filter(Boolean).join(', ') || '-';
  const coverLabel = [
    modifiers.lightCover ? 'Light cover' : null,
    modifiers.hardCover ? 'Hard cover' : null,
  ].filter(Boolean).join(', ') || '-';
  const parsedHitStrength = Number.parseInt(hitStrength, 10);
  const parsedArmorSave = Number.parseInt(armorSave, 10);
  const effectiveArmorSave = Number.isNaN(parsedHitStrength) || Number.isNaN(parsedArmorSave)
    ? '-'
    : `${parsedArmorSave + (parsedHitStrength - 3)}+`;
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
      <CardHeader
        title="Shooting phase"
        onBack={onBack}
        backLabel="Back to phases"
        rightSlot={isProbability ? (
          <Button size="sm" onClick={toggleMode}>
            {toggleLabel}
          </Button>
        ) : null}
      />

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
          <SectionBlock title="Special rules" contentClassName="mt-3">
            <OptionGroup layout="stack">
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
            </OptionGroup>
          </SectionBlock>

          {!autoHit ? (
            <SectionBlock title="Cover" contentClassName="mt-3">
              <OptionGroup layout="stack">
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
              </OptionGroup>
            </SectionBlock>
          ) : null}
        </div>

        {!autoHit ? (
          <SectionBlock title="Modifiers" contentClassName="mt-3">
            <OptionGroup layout="grid2">
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
            </OptionGroup>
          </SectionBlock>
        ) : null}

        <SectionBlock title="Re-roll to hit" contentClassName="mt-3">
          <ReRollOptions config={rerollHitConfig} onChange={onRerollHitChange} compact />
        </SectionBlock>

        <SectionBlock title="To wound" contentClassName="mt-3">
          <StatGrid
            fields={[
              {
                id: 'shootingHitStrength',
                label: 'Hit Strength',
                value: hitStrength,
                min: '1',
                onChange: onHitStrengthChange,
              },
              isProbability
                ? {
                  id: 'shootingWoundValue',
                  label: 'To Wound (X+)',
                  value: woundValue,
                  min: '1',
                  max: '7',
                  onChange: onWoundValueChange,
                }
                : {
                  id: 'shootingTargetToughness',
                  label: 'Target Toughness',
                  value: targetToughness,
                  min: '1',
                  onChange: onTargetToughnessChange,
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
                id="shootingMultipleWoundsValue"
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
        </SectionBlock>

        <SectionBlock title="Re-roll to wound" contentClassName="mt-3">
          <ReRollOptions config={rerollWoundConfig} onChange={onRerollWoundChange} compact />
        </SectionBlock>

        <SectionBlock title="Savings" contentClassName="mt-3">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            <div className="space-y-3">
              <StatGrid
                columns={1}
                fields={[
                  {
                    id: 'shootingArmorSave',
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
                    id: 'shootingWardSave',
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
        <ProbabilityResultsCard results={probabilityResults} poisonedAttack={isPoisonedActive} />
      ) : null}

      {!isProbability && hasThrowResults ? (
        <ProbabilityResultsCard results={throwResults} poisonedAttack={isPoisonedActive} />
      ) : null}

      <DebugPanel
        lines={[
          { label: 'Dice count', value: diceCount || '-' },
          { label: 'Result needed', value: Number.isNaN(resultNeeded) ? '-' : `${resultNeeded}+` },
          { label: 'Modifiers', value: modifiersLabel },
          { label: 'Cover', value: coverLabel },
          { label: 'Auto-hit', value: autoHit ? 'Yes' : 'No' },
          { label: 'Poisoned', value: poisonedAttack ? 'Yes' : 'No' },
          { label: 'Re-roll hit', value: formatRerollLabel(rerollHitConfig) },
          { label: 'Hit initial rolls', value: debug.hitInitialRolls.join(', ') || '-' },
          { label: 'Hit re-rolls', value: debug.hitRerollRolls.join(', ') || '-' },
          { label: 'Wound initial rolls', value: debug.woundInitialRolls.join(', ') || '-' },
          { label: 'Wound re-rolls', value: debug.woundRerollRolls.join(', ') || '-' },
          { label: 'Re-roll wound', value: formatRerollLabel(rerollWoundConfig) },
          { label: 'Multiple wounds', value: multipleWoundsLabel },
          { label: 'Armor save', value: armorSave ? `${armorSave}+` : '-' },
          { label: 'Effective armor', value: effectiveArmorSave },
          { label: 'Armor initial rolls', value: debug.armorInitialRolls.join(', ') || '-' },
          { label: 'Armor re-rolls', value: debug.armorRerollRolls.join(', ') || '-' },
          { label: 'Re-roll armor', value: formatRerollLabel(rerollArmorConfig) },
          { label: 'Ward save', value: wardSave.trim() ? `${wardSave}+` : '-' },
          { label: 'Ward initial rolls', value: debug.wardInitialRolls.join(', ') || '-' },
          { label: 'Ward re-rolls', value: debug.wardRerollRolls.join(', ') || '-' },
          { label: 'Re-roll ward', value: formatRerollLabel(rerollWardConfig) },
          { label: 'Multiple wounds rolls', value: debug.multipleWoundsRolls.join(', ') || '-' },
        ]}
      />
    </Card>
  );
}
