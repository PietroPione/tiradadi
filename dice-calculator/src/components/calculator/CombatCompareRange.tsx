import { useState } from 'react';
import Card from '@/components/ui/Card';
import CardHeader from '@/components/ui/CardHeader';
import SectionBlock from '@/components/ui/SectionBlock';
import OptionGroup from '@/components/ui/OptionGroup';
import StatGrid from '@/components/ui/StatGrid';
import InputField from '@/components/ui/InputField';
import Button from '@/components/ui/Button';
import ActionBar from '@/components/ui/ActionBar';
import LineChart from '@/components/ui/LineChart';
import ReRollOptions, { type RerollConfig } from '@/components/calculator/ReRollOptions';
import { calculateAverages, type RerollConfig as DiceRerollConfig } from '@/lib/dice-calculator';
import { parseSpecificValues, shouldRerollValue } from '@/lib/roll-utils';

const toDiceRerollConfig = (config: RerollConfig): DiceRerollConfig => ({
  enabled: config.enabled,
  mode: config.mode,
  scope: config.scope,
  specificValues: parseSpecificValues(config.specificValues),
});

type CombatInputs = {
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
  rerollHitConfig: RerollConfig;
  rerollWoundConfig: RerollConfig;
  rerollArmorConfig: RerollConfig;
  rerollWardConfig: RerollConfig;
};

type CompareConfig = CombatInputs & {
  id: string;
  label: string;
  compareMode: 'single' | 'range';
  singleField: keyof RangeFieldValues;
  compareValues: string;
  compareRangeValues: string;
};

type RangeFieldValues = {
  diceCount: number;
  hitValue: number;
  hitStrength: number;
  woundValue: number;
  armorSave: number;
  wardSave: number;
  predatoryFighterCount: number;
};

type CombatCompareRangeProps = CombatInputs & {
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
  onRerollHitChange: (config: RerollConfig) => void;
  onRerollWoundChange: (config: RerollConfig) => void;
  onRerollArmorChange: (config: RerollConfig) => void;
  onRerollWardChange: (config: RerollConfig) => void;
};

const parseMultipleWoundsValue = (rawValue: string) => {
  const value = rawValue.trim();
  if (!value) {
    return null;
  }
  if (value.toLowerCase().startsWith('d')) {
    const sides = Number.parseInt(value.slice(1), 10);
    if (Number.isNaN(sides) || sides < 2) {
      return null;
    }
    return { type: 'dice' as const, sides };
  }
  const fixed = Number.parseInt(value, 10);
  if (Number.isNaN(fixed) || fixed <= 0) {
    return null;
  }
  return { type: 'fixed' as const, value: fixed };
};

const fieldLabels: Record<keyof RangeFieldValues, string> = {
  diceCount: 'Dice Count',
  hitValue: 'To Hit (X+)',
  hitStrength: 'Hit Strength',
  woundValue: 'To Wound (X+)',
  armorSave: 'Armor Save (X+)',
  wardSave: 'Ward Save (X+)',
  predatoryFighterCount: 'Predatory fighter count',
};

const buildCompareConfig = (base: CombatInputs, index: number): CompareConfig => ({
  ...base,
  id: `compare-${Date.now()}-${index}`,
  label: `Compare ${index + 1}`,
  compareMode: 'range',
  singleField: 'hitValue',
  compareValues: '',
  compareRangeValues: '',
});

const parseNumber = (value: string) => Number.parseInt(value, 10);

export default function CombatCompareRange({
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
  onRerollHitChange,
  onRerollWoundChange,
  onRerollArmorChange,
  onRerollWardChange,
}: CombatCompareRangeProps) {
  const baseInputs: CombatInputs = {
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
    rerollHitConfig,
    rerollWoundConfig,
    rerollArmorConfig,
    rerollWardConfig,
  };
  const [compareItems, setCompareItems] = useState<CompareConfig[]>([buildCompareConfig(baseInputs, 0)]);

  const updateCompare = (id: string, patch: Partial<CompareConfig>) => {
    setCompareItems((items) => items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const [chartSeries, setChartSeries] = useState<Array<{ name: string; points: Array<{ x: number; y: number }>; color: string }>>([]);
  const [expectedSeries, setExpectedSeries] = useState<Array<{ name: string; points: Array<{ x: number; y: number }>; color: string }>>([]);
  const [tableRows, setTableRows] = useState<Array<{
    x: number;
    values: Record<string, number>;
  }>>([]);
  const [generatedBaseResult, setGeneratedBaseResult] = useState<number | null>(null);
  const parseRangeValues = (input: string) => {
    const trimmed = input.trim().replace(/[–—]/g, '-');
    if (!trimmed) {
      return [];
    }
    if (trimmed.includes('-')) {
      const parts = trimmed.split('-').map((value) => value.trim()).filter(Boolean);
      if (parts.length !== 2) {
        return [];
      }
      const [startRaw, endRaw] = parts;
      const start = Number.parseInt(startRaw, 10);
      const end = Number.parseInt(endRaw, 10);
      if (!Number.isFinite(start) || !Number.isFinite(end)) {
        return [];
      }
      const min = Math.min(start, end);
      const max = Math.max(start, end);
      return Array.from({ length: max - min + 1 }, (_, index) => min + index);
    }
    return trimmed
      .split(',')
      .map((value) => Number.parseInt(value.trim(), 10))
      .filter((value) => Number.isFinite(value));
  };

  const hasInvalidCompareValues = compareItems.some((item) => (
    item.compareMode === 'single'
      ? parseRangeValues(item.compareValues).length === 0
      : parseRangeValues(item.compareRangeValues).length === 0
  ));

  const computeFinalDamage = (inputs: CombatInputs) => {
    const parsedDice = parseNumber(inputs.diceCount);
    const parsedHit = parseNumber(inputs.hitValue);
    const parsedStrength = parseNumber(inputs.hitStrength);
    const parsedWound = parseNumber(inputs.woundValue);
    const parsedArmor = parseNumber(inputs.armorSave);
    const parsedWard = inputs.wardSave.trim() === '' ? 0 : parseNumber(inputs.wardSave);
    const parsedPredatory = inputs.predatoryFighter ? parseNumber(inputs.predatoryFighterCount) : 0;
    const parsedMultiple = inputs.multipleWoundsEnabled ? parseMultipleWoundsValue(inputs.multipleWoundsValue) : null;
    if ([parsedDice, parsedHit, parsedStrength, parsedWound, parsedArmor, parsedWard].some(Number.isNaN)) {
      return 0;
    }
    const base = calculateAverages({
      diceCount: parsedDice,
      hitValue: parsedHit,
      poisonedAttack: inputs.poisonedAttack,
      predatoryFighterCount: parsedPredatory,
      hitStrength: parsedStrength,
      woundValue: parsedWound,
      armorSave: parsedArmor,
      wardSave: parsedWard,
      rerollHitConfig: toDiceRerollConfig(inputs.rerollHitConfig),
      rerollWoundConfig: toDiceRerollConfig(inputs.rerollWoundConfig),
      rerollArmorConfig: toDiceRerollConfig(inputs.rerollArmorConfig),
      rerollWardConfig: toDiceRerollConfig(inputs.rerollWardConfig),
    });
    if (!parsedMultiple) {
      return base.finalDamage;
    }
    const multiplier = parsedMultiple.type === 'dice'
      ? (parsedMultiple.sides + 1) / 2
      : parsedMultiple.value;
    return parseFloat((base.finalDamage * multiplier).toFixed(2));
  };

  const buildSeries = () => {
    const baseFieldValues: RangeFieldValues = {
      diceCount: parseNumber(diceCount),
      hitValue: parseNumber(hitValue),
      hitStrength: parseNumber(hitStrength),
      woundValue: parseNumber(woundValue),
      armorSave: parseNumber(armorSave),
      wardSave: wardSave.trim() === '' ? 0 : parseNumber(wardSave),
      predatoryFighterCount: predatoryFighter ? parseNumber(predatoryFighterCount) : 0,
    };

    const rangeSeries = compareItems.flatMap((item) => {
      const field = item.singleField;
      const compareValues = parseRangeValues(item.compareValues);
      const rangeValues = item.compareMode === 'single'
        ? compareValues
        : parseRangeValues(item.compareRangeValues);
      return rangeValues.map((value) => {
        const inputs: RangeFieldValues = {
          ...baseFieldValues,
          diceCount: parseNumber(item.diceCount),
          hitValue: parseNumber(item.hitValue),
          hitStrength: parseNumber(item.hitStrength),
          woundValue: parseNumber(item.woundValue),
          armorSave: parseNumber(item.armorSave),
          wardSave: item.wardSave.trim() === '' ? 0 : parseNumber(item.wardSave),
          predatoryFighterCount: item.predatoryFighter ? parseNumber(item.predatoryFighterCount) : 0,
        };
        inputs[field] = value;
        return {
          name: `${item.label} • ${fieldLabels[field]} ${value}`,
          inputs: {
            ...item,
            diceCount: inputs.diceCount.toString(),
            hitValue: inputs.hitValue.toString(),
            hitStrength: inputs.hitStrength.toString(),
            woundValue: inputs.woundValue.toString(),
            armorSave: inputs.armorSave.toString(),
            wardSave: inputs.wardSave.toString(),
            predatoryFighterCount: inputs.predatoryFighterCount.toString(),
          },
        };
      });
    });

    return { rangeSeries };
  };

  const handleGenerate = () => {
    const { rangeSeries } = buildSeries();
    const iterations = 20000;
    const rollDie = () => Math.floor(Math.random() * 6) + 1;
    const rollWithReroll = (target: number, config: RerollConfig) => {
      const specificValues = new Set(parseSpecificValues(config.specificValues));
      let roll = rollDie();
      let isSuccess = target <= 6 ? roll >= target : false;
      if (config.enabled && shouldRerollValue(roll, isSuccess, config, specificValues)) {
        roll = rollDie();
        isSuccess = target <= 6 ? roll >= target : false;
      }
      return { roll, isSuccess };
    };
    const simulateCombatDamage = (inputs: CombatInputs, maxDamage: number) => {
      const counts = Array.from({ length: maxDamage + 1 }, () => 0);
      const hitTarget = Number.parseInt(inputs.hitValue, 10);
      const woundTarget = Number.parseInt(inputs.woundValue, 10);
      const armorSave = Number.parseInt(inputs.armorSave, 10);
      const wardSave = inputs.wardSave.trim() === '' ? 0 : Number.parseInt(inputs.wardSave, 10);
      const strength = Number.parseInt(inputs.hitStrength, 10);
      const diceCountValue = Number.parseInt(inputs.diceCount, 10);
      const predatoryCount = inputs.predatoryFighter ? Number.parseInt(inputs.predatoryFighterCount, 10) : 0;
      const multipleValue = parseMultipleWoundsValue(inputs.multipleWoundsValue);

      for (let i = 0; i < iterations; i += 1) {
        const totalAttacks = diceCountValue;
        let extraAttacks = 0;
        const hitRolls: number[] = [];

        for (let j = 0; j < totalAttacks; j += 1) {
          const result = rollWithReroll(hitTarget, inputs.rerollHitConfig);
          hitRolls.push(result.roll);
          if (inputs.predatoryFighter && hitTarget <= 6 && j < predatoryCount && result.roll === 6) {
            extraAttacks += 1;
          }
        }

        for (let j = 0; j < extraAttacks; j += 1) {
          const result = rollWithReroll(hitTarget, inputs.rerollHitConfig);
          hitRolls.push(result.roll);
        }

        let autoWounds = 0;
        const hitsToWound: number[] = [];
        hitRolls.forEach((roll) => {
          if (inputs.poisonedAttack && hitTarget <= 6 && roll === 6) {
            autoWounds += 1;
          } else if (hitTarget <= 6 && roll >= hitTarget) {
            hitsToWound.push(roll);
          }
        });

        let successfulWounds = autoWounds;
        hitsToWound.forEach(() => {
          const woundResult = rollWithReroll(woundTarget, inputs.rerollWoundConfig);
          if (woundResult.isSuccess) {
            successfulWounds += 1;
          }
        });

        const effectiveArmor = armorSave + (strength - 3);
        let failedArmor = 0;
        if (effectiveArmor <= 1 || effectiveArmor > 6) {
          failedArmor = successfulWounds;
        } else {
          for (let k = 0; k < successfulWounds; k += 1) {
            const armorResult = rollWithReroll(effectiveArmor, inputs.rerollArmorConfig);
            if (!armorResult.isSuccess) {
              failedArmor += 1;
            }
          }
        }

        let failedWard = 0;
        if (wardSave <= 1 || wardSave > 6) {
          failedWard = failedArmor;
        } else {
          for (let k = 0; k < failedArmor; k += 1) {
            const wardResult = rollWithReroll(wardSave, inputs.rerollWardConfig);
            if (!wardResult.isSuccess) {
              failedWard += 1;
            }
          }
        }

        let finalDamage = failedWard;
        if (inputs.multipleWoundsEnabled && multipleValue) {
          if (multipleValue.type === 'fixed') {
            finalDamage = failedWard * multipleValue.value;
          } else {
            finalDamage = 0;
            for (let k = 0; k < failedWard; k += 1) {
              finalDamage += Math.floor(Math.random() * multipleValue.sides) + 1;
            }
          }
        }
        const bucket = Math.min(finalDamage, maxDamage);
        counts[bucket] += 1;
      }
      return counts.map((count) => count / iterations);
    };
    const baseMaxMultiple = multipleWoundsEnabled
      ? (parseMultipleWoundsValue(multipleWoundsValue)?.type === 'dice'
        ? (parseMultipleWoundsValue(multipleWoundsValue)?.sides ?? 1)
        : (parseMultipleWoundsValue(multipleWoundsValue)?.value ?? 1))
      : 1;
    const baseMaxDamage = Math.max(0, parseNumber(diceCount) * baseMaxMultiple);
    const seriesData = rangeSeries.map((seriesItem) => {
      const seriesMaxMultiple = seriesItem.inputs.multipleWoundsEnabled
        ? (parseMultipleWoundsValue(seriesItem.inputs.multipleWoundsValue)?.type === 'dice'
          ? (parseMultipleWoundsValue(seriesItem.inputs.multipleWoundsValue)?.sides ?? 1)
          : (parseMultipleWoundsValue(seriesItem.inputs.multipleWoundsValue)?.value ?? 1))
        : 1;
      const seriesMaxDamage = Math.max(0, parseNumber(seriesItem.inputs.diceCount) * seriesMaxMultiple);
      return { name: seriesItem.name, inputs: seriesItem.inputs, maxDamage: seriesMaxDamage };
    });
    const overallMaxDamage = Math.max(baseMaxDamage, ...seriesData.map((item) => item.maxDamage));
    const baseDistribution = simulateCombatDamage(baseInputs, overallMaxDamage);
    const probabilitySeries = [
      {
        name: 'Base',
        points: baseDistribution.map((value, index) => ({ x: index, y: parseFloat(value.toFixed(4)) })),
        color: '',
      },
      ...seriesData.map((item) => {
        const distribution = simulateCombatDamage(item.inputs, overallMaxDamage);
        return {
          name: item.name,
          points: distribution.map((value, index) => ({ x: index, y: parseFloat(value.toFixed(4)) })),
          color: '',
        };
      }),
    ];
    const expected = probabilitySeries.map((entry, index) => {
      const expectedValue = entry.points.reduce((sum, point) => sum + point.x * point.y, 0);
      return {
        name: entry.name,
        points: [{ x: index + 1, y: parseFloat(expectedValue.toFixed(2)) }],
        color: '',
      };
    });
    const series = probabilitySeries.map((entry) => ({
      ...entry,
      points: entry.points.map((point) => ({ ...point, y: parseFloat((point.y * 100).toFixed(2)) })),
    }));
    const rows = Array.from({ length: overallMaxDamage + 1 }, (_, index) => {
      const values: Record<string, number> = {};
      probabilitySeries.forEach((entry) => {
        values[entry.name] = entry.points[index]?.y ?? 0;
      });
      return { x: index, values };
    });
    setChartSeries(series);
    setExpectedSeries(expected);
    setTableRows(rows);
    setGeneratedBaseResult(computeFinalDamage(baseInputs));
  };

  const currentBaseResult = computeFinalDamage(baseInputs);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Card className="px-4 py-5 sm:px-6 sm:py-6">
        <CardHeader title="Step 1: Combat base values" subtitle="Set your baseline for comparison" />
        <div className="mt-4 space-y-5">
          <InputField
            id="diceCount"
            label="Dice Count"
            value={diceCount}
            min="1"
            onChange={onDiceCountChange}
          />
          <SectionBlock title="To hit" contentClassName="mt-3">
            <StatGrid
              fields={[
                {
                  id: 'hitValue',
                  label: 'To Hit (X+)',
                  value: hitValue,
                  min: '1',
                  max: '7',
                  onChange: onHitValueChange,
                },
              ]}
              columns={1}
            />
            <OptionGroup layout="stack" className="mt-3">
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
            </OptionGroup>
            <div className="mt-3">
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
            <OptionGroup layout="stack" className="mt-3">
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
            </OptionGroup>
            <div className="mt-3">
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
          <div className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-700">
            Base final damage: <span className="font-mono text-zinc-900">{currentBaseResult.toFixed(2)}</span>
          </div>
        </ActionBar>
      </Card>

      <Card className="px-4 py-5 sm:px-6 sm:py-6">
        <CardHeader title="Step 2: Compare with" subtitle="Choose what to vary and override values" />
        <div className="space-y-6">
          {compareItems.map((item) => (
            <div key={item.id} className="border-2 border-zinc-900 px-4 py-4">
              <div className="flex items-center justify-between gap-2">
                <InputField
                  id={`${item.id}-label`}
                  label="Label"
                  value={item.label}
                  type="text"
                  onChange={(value) => updateCompare(item.id, { label: value })}
                />
                <Button size="sm" onClick={() => setCompareItems((list) => list.filter((entry) => entry.id !== item.id))}>
                  Remove
                </Button>
              </div>
              <SectionBlock title="Step 2A: Field to compare" contentClassName="mt-3">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">Value to vary</label>
                <select
                  className="mt-2 w-full border-2 border-zinc-900 bg-white px-3 py-2 text-sm"
                  value={item.singleField}
                  onChange={(event) => updateCompare(item.id, { singleField: event.target.value as keyof RangeFieldValues })}
                >
                  {Object.entries(fieldLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
                <div className="mt-3">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">Compare mode</label>
                  <select
                    className="mt-2 w-full border-2 border-zinc-900 bg-white px-3 py-2 text-sm"
                    value={item.compareMode}
                    onChange={(event) => updateCompare(item.id, { compareMode: event.target.value as 'single' | 'range' })}
                  >
                    <option value="single">Compare single value</option>
                    <option value="range">Compare</option>
                  </select>
                </div>
                {item.compareMode === 'single' ? (
                  <>
                    <InputField
                      id={`${item.id}-compare-value`}
                      label="Compare values (comma separated)"
                      value={item.compareValues}
                      type="text"
                      placeholder="e.g. 3,4,5"
                      onChange={(value) => updateCompare(item.id, { compareValues: value })}
                    />
                    {!item.compareValues.trim() ? (
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-600">
                        Insert at least one value to compare.
                      </p>
                    ) : null}
                  </>
                ) : (
                  <>
                    <InputField
                      id={`${item.id}-compare-range`}
                      label="Range values"
                      value={item.compareRangeValues}
                      type="text"
                      placeholder="Use a range (e.g. 2-4) or list (e.g. 2,3,4)"
                      onChange={(value) => updateCompare(item.id, { compareRangeValues: value })}
                    />
                    {item.compareRangeValues.trim()
                      && parseRangeValues(item.compareRangeValues).length === 0 ? (
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-600">
                        Invalid range format. Use 2-4 or 2,3,4.
                      </p>
                    ) : null}
                  </>
                )}
              </SectionBlock>

            </div>
          ))}
        </div>
        <ActionBar>
          <div className="flex flex-wrap gap-3">
            <Button
              size="sm"
              onClick={() => setCompareItems((items) => items.concat(buildCompareConfig(baseInputs, items.length)))}
            >
              Add compare
            </Button>
            <Button size="sm" onClick={handleGenerate} disabled={hasInvalidCompareValues}>
              Generate results
            </Button>
          </div>
          {hasInvalidCompareValues ? (
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-600">
              Add compare values before generating.
            </p>
          ) : null}
        </ActionBar>
      </Card>

      <Card className="lg:col-span-2 px-4 py-5 sm:px-6 sm:py-6">
        <CardHeader title="Step 3: Results" subtitle="Final damage distribution" />
        {chartSeries.length ? (
          <>
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
              Series: {chartSeries.map((series) => series.name).join(' | ')}
            </div>
            <LineChart
              series={chartSeries.map((item, index) => ({
                ...item,
                color: item.color || ['#111827', '#2563eb', '#16a34a', '#db2777', '#f97316', '#7c3aed'][index % 6],
              }))}
              xLabel="Final damage"
              xUnit="wounds"
              yLabel="Probability"
              yUnit="%"
              footer={(
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
                  X axis shows total final damage (0 to max).
                </p>
              )}
            />
          </>
        ) : (
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-600">
            Generate charts to see results.
          </p>
        )}
      </Card>

      <Card className="lg:col-span-2 px-4 py-5 sm:px-6 sm:py-6">
        <CardHeader title="Step 3: Results table" subtitle="Probability by final damage" />
        {tableRows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b-2 border-zinc-900">
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
                    Value
                  </th>
                  {chartSeries.map((series) => (
                    <th
                      key={series.name}
                      className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600"
                    >
                      {series.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row) => (
                  <tr key={row.x} className="border-b border-zinc-200">
                    <td className="px-3 py-2 font-mono text-zinc-900">{row.x}</td>
                    {chartSeries.map((series) => (
                      <td key={`${series.name}-${row.x}`} className="px-3 py-2 text-zinc-700">
                        {((row.values[series.name] ?? 0) * 100).toFixed(2)}%
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-600">
            Generate charts to see results.
          </p>
        )}
        {generatedBaseResult !== null ? (
          <div className="mt-3 space-y-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
            <div>Base final damage (expected): {generatedBaseResult.toFixed(2)}</div>
            {expectedSeries.length ? (
              <div>
                Compare expected:{' '}
                {expectedSeries
                  .filter((series) => series.name !== 'Base')
                  .map((series) => `${series.name}=${(series.points[0]?.y ?? 0).toFixed(2)}`)
                  .join(' | ')}
              </div>
            ) : null}
          </div>
        ) : null}
      </Card>
    </div>
  );
}
