import { useState, type ReactNode } from 'react';
import Card from '@/components/ui/Card';
import CardHeader from '@/components/ui/CardHeader';
import SectionBlock from '@/components/ui/SectionBlock';
import OptionGroup from '@/components/ui/OptionGroup';
import StatGrid from '@/components/ui/StatGrid';
import InputField from '@/components/ui/InputField';
import ActionBar from '@/components/ui/ActionBar';
import Button from '@/components/ui/Button';
import LineChart from '@/components/ui/LineChart';
import ToggleButton from '@/components/ui/ToggleButton';
import ReRollOptions, { type RerollConfig } from '@/components/calculator/ReRollOptions';
import {
  getFaceProbabilitiesWithReroll,
  getShootingSuccessChanceWithReroll,
  parseSpecificValues,
  shouldRerollValue,
} from '@/lib/games/wfb8/roll-utils';
import {
  getHh2HitProfile,
  getHh2HitSuccessChance,
  getHh2WoundProfile,
  getHh2WoundSuccessChance,
  rollHh2Hit,
} from '@/lib/games/hh2/shooting-utils';

type ShootingModifiers = {
  longRange: boolean;
  movement: boolean;
  skirmisherTarget: boolean;
  lightCover: boolean;
  hardCover: boolean;
};

type ShootingInputs = {
  diceCount: string;
  ballisticSkill: string;
  nightFighting: boolean;
  modifiers: ShootingModifiers;
  poisonedAttack: boolean;
  autoHit: boolean;
  targetType: 'living' | 'vehicle';
  targetWounds: string;
  instantDeath: boolean;
  atomanticShield: boolean;
  multipleWoundsEnabled: boolean;
  multipleWoundsValue: string;
  hitStrength: string;
  targetToughness: string;
  armorPenetration: string;
  woundValue: string;
  armorSave: string;
  wardSave: string;
  rerollHitConfig: RerollConfig;
  rerollWoundConfig: RerollConfig;
  rerollArmorConfig: RerollConfig;
  rerollWardConfig: RerollConfig;
};

type RangeFieldValues = {
  diceCount: number;
  ballisticSkill: number;
  hitStrength: number;
  woundValue: number;
  armorSave: number;
  wardSave: number;
};

type CompareConfig = ShootingInputs & {
  id: string;
  label: string;
  compareMode: 'single' | 'range';
  singleField: keyof RangeFieldValues;
  compareValues: string;
  compareRangeValues: string;
};

type ShootingCompareRangeProps = ShootingInputs & {
  systemKey: 'wfb8' | 'trech' | 'hh2';
  onBack: () => void;
  backLabel?: string;
  rightSlot?: ReactNode;
  onDiceCountChange: (value: string) => void;
  onBallisticSkillChange: (value: string) => void;
  onNightFightingChange: (value: boolean) => void;
  onModifierChange: (key: keyof ShootingModifiers, value: boolean) => void;
  onPoisonedAttackChange: (value: boolean) => void;
  onAutoHitChange: (value: boolean) => void;
  onTargetTypeChange: (value: 'living' | 'vehicle') => void;
  onTargetWoundsChange: (value: string) => void;
  onInstantDeathChange: (value: boolean) => void;
  onAtomanticShieldChange: (value: boolean) => void;
  onMultipleWoundsChange: (value: boolean) => void;
  onMultipleWoundsValueChange: (value: string) => void;
  onHitStrengthChange: (value: string) => void;
  onTargetToughnessChange: (value: string) => void;
  onArmorPenetrationChange: (value: string) => void;
  onWoundValueChange: (value: string) => void;
  onArmorSaveChange: (value: string) => void;
  onWardSaveChange: (value: string) => void;
  onRerollHitChange: (config: RerollConfig) => void;
  onRerollWoundChange: (config: RerollConfig) => void;
  onRerollArmorChange: (config: RerollConfig) => void;
  onRerollWardChange: (config: RerollConfig) => void;
};

const fieldLabels: Record<keyof RangeFieldValues, string> = {
  diceCount: 'Dice Count',
  ballisticSkill: 'Balistic Skill',
  hitStrength: 'Hit Strength',
  woundValue: 'To Wound (X+)',
  armorSave: 'Armor Save (X+)',
  wardSave: 'Ward Save (X+)',
};

const parseNumber = (value: string) => Number.parseInt(value, 10);

const buildCompareConfig = (base: ShootingInputs, index: number): CompareConfig => ({
  ...base,
  id: `compare-${Date.now()}-${index}`,
  label: `Compare ${index + 1}`,
  compareMode: 'range',
  singleField: 'ballisticSkill',
  compareValues: '',
  compareRangeValues: '',
});

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

const getShootingResultNeeded = (ballisticSkillValue: number, modifiers: ShootingModifiers, autoHit: boolean) => {
  if (autoHit) {
    return 1;
  }
  if (Number.isNaN(ballisticSkillValue)) {
    return Number.NaN;
  }
  const baseResult = 7 - ballisticSkillValue;
  const modifierCount = Object.values(modifiers).filter(Boolean).length;
  const hardCoverPenalty = modifiers.hardCover ? 1 : 0;
  return baseResult + modifierCount + hardCoverPenalty;
};

const calculateFinalDamage = (inputs: ShootingInputs, systemKey: 'wfb8' | 'trech' | 'hh2') => {
  const parsedDice = parseNumber(inputs.diceCount);
  const parsedBallistic = parseNumber(inputs.ballisticSkill);
  if (systemKey === 'hh2') {
    if (Number.isNaN(parsedDice) || parsedDice <= 0 || Number.isNaN(parsedBallistic)) {
      return 0;
    }
    const hitChance = getHh2HitSuccessChance(parsedBallistic, inputs.rerollHitConfig, {
      nightFighting: inputs.nightFighting,
    });
    if (Number.isNaN(hitChance)) {
      return 0;
    }
    const expectedHits = parsedDice * hitChance;
    const parsedStrength = parseNumber(inputs.hitStrength);
    const parsedToughness = parseNumber(inputs.targetToughness);
    const parsedTargetWounds = parseNumber(inputs.targetWounds);
    const parsedArmorSave = parseNumber(inputs.armorSave);
    const parsedInvulnerable = inputs.wardSave.trim() === '' ? 0 : parseNumber(inputs.wardSave);
    const parsedArmorPenetration = inputs.armorPenetration.trim() === ''
      ? Number.NaN
      : parseNumber(inputs.armorPenetration);
    let successfulWounds = expectedHits;
    if (inputs.targetType === 'living') {
      if (Number.isNaN(parsedStrength) || Number.isNaN(parsedToughness)) {
        return 0;
      }
      const woundChance = getHh2WoundSuccessChance(parsedStrength, parsedToughness);
      if (Number.isNaN(woundChance)) {
        return 0;
      }
      successfulWounds = expectedHits * woundChance;
    }
    const armorBlocked = Number.isFinite(parsedArmorPenetration) &&
      parsedArmorPenetration > 0 &&
      parsedArmorPenetration <= parsedArmorSave;
    const armorSaveChance = !armorBlocked && parsedArmorSave > 1 && parsedArmorSave <= 6
      ? (7 - parsedArmorSave) / 6
      : 0;
    const invulnerableChance = parsedInvulnerable > 1 && parsedInvulnerable <= 6
      ? (7 - parsedInvulnerable) / 6
      : 0;
    const failedArmorSaves = successfulWounds * (1 - armorSaveChance);
    const failedInvulnerableSaves = failedArmorSaves * (1 - invulnerableChance);
    let finalDamage = failedInvulnerableSaves;
    if (inputs.targetType === 'living' && parsedTargetWounds > 0) {
      const instantDeathActive = inputs.instantDeath || parsedStrength >= parsedToughness * 2;
      if (instantDeathActive) {
        if (inputs.atomanticShield) {
          finalDamage = failedInvulnerableSaves * 2;
        } else {
          finalDamage = failedInvulnerableSaves * parsedTargetWounds;
        }
      }
    }
    return parseFloat(finalDamage.toFixed(2));
  }
  const parsedStrength = parseNumber(inputs.hitStrength);
  const parsedWound = parseNumber(inputs.woundValue);
  const parsedArmor = parseNumber(inputs.armorSave);
  const parsedWard = inputs.wardSave.trim() === '' ? 0 : parseNumber(inputs.wardSave);
  const parsedMultiple = inputs.multipleWoundsEnabled ? parseMultipleWoundsValue(inputs.multipleWoundsValue) : null;
  const resultNeeded = getShootingResultNeeded(parsedBallistic, inputs.modifiers, inputs.autoHit);

  if (
    [parsedDice, parsedStrength, parsedWound, parsedArmor, parsedWard].some(Number.isNaN) ||
    Number.isNaN(resultNeeded) ||
    (inputs.multipleWoundsEnabled && !parsedMultiple)
  ) {
    return 0;
  }

  const hitChance = inputs.autoHit
    ? 1
    : getShootingSuccessChanceWithReroll(resultNeeded, inputs.rerollHitConfig);
  const hitProbabilities = resultNeeded <= 6 && !inputs.autoHit
    ? getFaceProbabilitiesWithReroll(resultNeeded, inputs.rerollHitConfig)
    : null;
  const poisonedAutoWoundChance = inputs.poisonedAttack && resultNeeded <= 6 && !inputs.autoHit
    ? hitProbabilities?.sixChance ?? 0
    : 0;
  const nonPoisonHitChance = poisonedAutoWoundChance > 0
    ? Math.max(0, hitChance - poisonedAutoWoundChance)
    : hitChance;
  const woundChance = getFaceProbabilitiesWithReroll(parsedWound, inputs.rerollWoundConfig).successChance;
  const armorSaveModifier = parsedStrength - 3;
  const effectiveArmorSave = parsedArmor + armorSaveModifier;
  const armorSaveChance = effectiveArmorSave > 1
    ? getFaceProbabilitiesWithReroll(effectiveArmorSave, inputs.rerollArmorConfig).successChance
    : 0;
  const wardSaveChance = parsedWard > 1
    ? getFaceProbabilitiesWithReroll(parsedWard, inputs.rerollWardConfig).successChance
    : 0;

  const autoWounds = parsedDice * poisonedAutoWoundChance;
  const hitsToWound = parsedDice * nonPoisonHitChance;
  const successfulWounds = autoWounds + hitsToWound * woundChance;
  const failedArmorSaves = successfulWounds * (1 - armorSaveChance);
  const failedWardSaves = failedArmorSaves * (1 - wardSaveChance);
  const multipleWoundsMultiplier = parsedMultiple
    ? (parsedMultiple.type === 'dice'
      ? (parsedMultiple.sides + 1) / 2
      : parsedMultiple.value)
    : 1;
  const finalDamage = failedWardSaves * multipleWoundsMultiplier;
  return parseFloat(finalDamage.toFixed(2));
};

const renderResultNeeded = (resultNeeded: number, autoHit: boolean) => {
  if (autoHit) {
    return {
      main: 'Auto-hit',
      sub: 'All shots hit',
    };
  }
  if (Number.isNaN(resultNeeded)) {
    return { main: '-', sub: null as string | null };
  }
  if (resultNeeded >= 10) {
    return { main: 'Impossible', sub: '10+ cannot be reached' };
  }
  if (resultNeeded >= 7) {
    const followUp = resultNeeded - 3;
    return { main: '6+', sub: `then ${followUp}+` };
  }
  return { main: `${resultNeeded}+`, sub: null };
};

export default function ShootingCompareRange({
  systemKey,
  diceCount,
  ballisticSkill,
  nightFighting,
  modifiers,
  poisonedAttack,
  autoHit,
  targetType,
  targetWounds,
  instantDeath,
  atomanticShield,
  multipleWoundsEnabled,
  multipleWoundsValue,
  hitStrength,
  targetToughness,
  armorPenetration,
  woundValue,
  armorSave,
  wardSave,
  rerollHitConfig,
  rerollWoundConfig,
  rerollArmorConfig,
  rerollWardConfig,
  onBack,
  backLabel = 'Back to phases',
  rightSlot,
  onDiceCountChange,
  onBallisticSkillChange,
  onNightFightingChange,
  onModifierChange,
  onPoisonedAttackChange,
  onAutoHitChange,
  onTargetTypeChange,
  onTargetWoundsChange,
  onInstantDeathChange,
  onAtomanticShieldChange,
  onMultipleWoundsChange,
  onMultipleWoundsValueChange,
  onHitStrengthChange,
  onTargetToughnessChange,
  onArmorPenetrationChange,
  onWoundValueChange,
  onArmorSaveChange,
  onWardSaveChange,
  onRerollHitChange,
  onRerollWoundChange,
  onRerollArmorChange,
  onRerollWardChange,
}: ShootingCompareRangeProps) {
  const baseInputs: ShootingInputs = {
    diceCount,
    ballisticSkill,
    nightFighting,
    modifiers,
    poisonedAttack,
    autoHit,
    targetType,
    targetWounds,
    instantDeath,
    atomanticShield,
    multipleWoundsEnabled,
    multipleWoundsValue,
    hitStrength,
    targetToughness,
    armorPenetration,
    woundValue,
    armorSave,
    wardSave,
    rerollHitConfig,
    rerollWoundConfig,
    rerollArmorConfig,
    rerollWardConfig,
  };
  const isHorusHeresy = systemKey === 'hh2';
  const availableFieldEntries = (Object.entries(fieldLabels) as Array<[keyof RangeFieldValues, string]>)
    .filter(([key]) => !isHorusHeresy || key === 'diceCount' || key === 'ballisticSkill');
  const [compareItems, setCompareItems] = useState<CompareConfig[]>([buildCompareConfig(baseInputs, 0)]);
  const [chartSeries, setChartSeries] = useState<Array<{ name: string; points: Array<{ x: number; y: number }>; color: string }>>([]);
  const [expectedSeries, setExpectedSeries] = useState<Array<{ name: string; points: Array<{ x: number; y: number }>; color: string }>>([]);
  const [tableRows, setTableRows] = useState<Array<{
    x: number;
    values: Record<string, number>;
  }>>([]);
  const [generatedBaseResult, setGeneratedBaseResult] = useState<number | null>(null);
  const hh2Profile = isHorusHeresy ? getHh2HitProfile(parseNumber(ballisticSkill), { nightFighting }) : null;
  const hh2WoundProfile = isHorusHeresy && targetType === 'living'
    ? getHh2WoundProfile(parseNumber(hitStrength), parseNumber(targetToughness))
    : null;
  const resultNeeded = isHorusHeresy && hh2Profile
    ? hh2Profile.baseTarget
    : getShootingResultNeeded(parseNumber(ballisticSkill), modifiers, autoHit);
  const resultDisplay = isHorusHeresy && hh2Profile
    ? {
      main: Number.isNaN(hh2Profile.baseTarget) ? '-' : `${hh2Profile.baseTarget}+`,
      sub: hh2Profile.followUpTarget ? `then ${hh2Profile.followUpTarget}+` : null,
    }
    : renderResultNeeded(resultNeeded, autoHit);
  const hh2WoundDisplay = hh2WoundProfile?.impossible
    ? { main: 'Impossible', sub: 'Target toughness is too high' }
    : hh2WoundProfile?.target
      ? { main: `${hh2WoundProfile.target}+`, sub: null }
      : { main: '-', sub: null };
  const isHh2InstantDeath = (hh2WoundProfile?.instantDeath ?? false) || instantDeath;

  const updateCompare = (id: string, patch: Partial<CompareConfig>) => {
    setCompareItems((items) => items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };
  const resolveSingleField = (field: keyof RangeFieldValues) => (
    isHorusHeresy && field !== 'diceCount' && field !== 'ballisticSkill' ? 'ballisticSkill' : field
  );

  const parseCompareValues = (input: string) => {
    return input
      .split(',')
      .map((value) => Number.parseInt(value.trim(), 10))
      .filter((value) => Number.isFinite(value));
  };
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
    return parseCompareValues(trimmed);
  };
  const hasInvalidCompareValues = compareItems.some((item) => (
    item.compareMode === 'single'
      ? parseCompareValues(item.compareValues).length === 0
      : parseRangeValues(item.compareRangeValues).length === 0
  ));
  const baseResult = calculateFinalDamage(baseInputs, systemKey);

  const buildSeries = () => {
    const rangeSeries = compareItems.flatMap((item) => {
      const field = resolveSingleField(item.singleField);
      const rangeValues = item.compareMode === 'single'
        ? parseCompareValues(item.compareValues)
        : parseRangeValues(item.compareRangeValues);
      return rangeValues.map((value) => {
        const inputs: ShootingInputs = {
          ...item,
          modifiers: item.modifiers,
        };
        if (field === 'diceCount') {
          inputs.diceCount = value.toString();
        } else if (field === 'ballisticSkill') {
          inputs.ballisticSkill = value.toString();
        } else if (field === 'hitStrength') {
          inputs.hitStrength = value.toString();
        } else if (field === 'woundValue') {
          inputs.woundValue = value.toString();
        } else if (field === 'armorSave') {
          inputs.armorSave = value.toString();
        } else if (field === 'wardSave') {
          inputs.wardSave = value.toString();
        }
        return {
          name: `${item.label} • ${fieldLabels[field]} ${value}`,
          inputs,
        };
      });
    });
    return { rangeSeries };
  };

  const handleGenerate = () => {
    const { rangeSeries } = buildSeries();
    const iterations = 20000;
    const getHh2MaxDamage = (inputs: ShootingInputs) => {
      const dice = parseNumber(inputs.diceCount);
      const wounds = parseNumber(inputs.targetWounds);
      const strengthValue = parseNumber(inputs.hitStrength);
      const toughnessValue = parseNumber(inputs.targetToughness);
      const instantDeathActive = inputs.instantDeath || strengthValue >= toughnessValue * 2;
      if (inputs.targetType !== 'living') {
        return Math.max(0, dice);
      }
      if (inputs.atomanticShield) {
        return Math.max(0, dice * 3);
      }
      if (instantDeathActive) {
        return Number.isNaN(wounds) ? Math.max(0, dice) : Math.max(0, dice * wounds);
      }
      return Math.max(0, dice);
    };
    const baseMaxMultiple = multipleWoundsEnabled
      ? (parseMultipleWoundsValue(multipleWoundsValue)?.type === 'dice'
        ? (parseMultipleWoundsValue(multipleWoundsValue)?.sides ?? 1)
        : (parseMultipleWoundsValue(multipleWoundsValue)?.value ?? 1))
      : 1;
    const baseMaxDamage = isHorusHeresy
      ? getHh2MaxDamage(baseInputs)
      : Math.max(0, parseNumber(diceCount) * baseMaxMultiple);
    const seriesData = rangeSeries.map((entry) => {
      if (isHorusHeresy) {
        const maxDamage = getHh2MaxDamage(entry.inputs);
        return { name: entry.name, inputs: entry.inputs, maxDamage };
      }
      const compareMultiple = entry.inputs.multipleWoundsEnabled
        ? (parseMultipleWoundsValue(entry.inputs.multipleWoundsValue)?.type === 'dice'
          ? (parseMultipleWoundsValue(entry.inputs.multipleWoundsValue)?.sides ?? 1)
          : (parseMultipleWoundsValue(entry.inputs.multipleWoundsValue)?.value ?? 1))
        : 1;
      const maxDamage = Math.max(0, parseNumber(entry.inputs.diceCount) * compareMultiple);
      return { name: entry.name, inputs: entry.inputs, maxDamage };
    });
    const overallMax = Math.max(baseMaxDamage, ...seriesData.map((item) => item.maxDamage));

    const rollDie = () => Math.floor(Math.random() * 6) + 1;

    const rollShootingHit = (target: number, config: RerollConfig) => {
      const specificValues = new Set(parseSpecificValues(config.specificValues));
      const rollOnce = () => rollDie();
      let roll = rollOnce();
      let followUp = 0;
      let success = false;
      if (target <= 6) {
        success = roll >= target;
      } else if (target < 10) {
        if (roll === 6) {
          followUp = rollOnce();
          success = followUp >= target - 3;
        }
      }
      const shouldReroll = config.enabled ? shouldRerollValue(roll, success, config, specificValues) : false;
      if (shouldReroll) {
        roll = rollOnce();
        followUp = 0;
        success = false;
        if (target <= 6) {
          success = roll >= target;
        } else if (target < 10) {
          if (roll === 6) {
            followUp = rollOnce();
            success = followUp >= target - 3;
          }
        }
      }
      return { roll, success };
    };

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

    const simulateShooting = (inputs: ShootingInputs) => {
      const counts = Array.from({ length: overallMax + 1 }, () => 0);
      const diceCountValue = parseNumber(inputs.diceCount);
      const ballisticValue = parseNumber(inputs.ballisticSkill);
      if (isHorusHeresy) {
        const strengthValue = parseNumber(inputs.hitStrength);
        const toughnessValue = parseNumber(inputs.targetToughness);
        const woundProfile = inputs.targetType === 'living'
          ? getHh2WoundProfile(strengthValue, toughnessValue)
          : null;
        const woundTarget = woundProfile?.target ?? 0;
        const targetWoundsValue = parseNumber(inputs.targetWounds);
        const armorSaveValue = parseNumber(inputs.armorSave);
        const invulnerableValue = inputs.wardSave.trim() === '' ? 0 : parseNumber(inputs.wardSave);
        const armorPenetrationValue = inputs.armorPenetration.trim() === ''
          ? Number.NaN
          : parseNumber(inputs.armorPenetration);
        const armorBlocked = Number.isFinite(armorPenetrationValue) &&
          armorPenetrationValue > 0 &&
          armorPenetrationValue <= armorSaveValue;
        for (let i = 0; i < iterations; i += 1) {
          let hitSuccesses = 0;
          for (let j = 0; j < diceCountValue; j += 1) {
            const result = rollHh2Hit(ballisticValue, inputs.rerollHitConfig, { nightFighting: inputs.nightFighting });
            if (result.success) {
              hitSuccesses += 1;
            }
          }
          let successfulWounds = hitSuccesses;
          if (inputs.targetType === 'living') {
            if (woundProfile?.impossible || woundTarget === 0) {
              successfulWounds = 0;
            } else {
              successfulWounds = 0;
              for (let k = 0; k < hitSuccesses; k += 1) {
                const roll = rollDie();
                if (roll >= woundTarget) {
                  successfulWounds += 1;
                }
              }
            }
          }
          let failedArmorSaves = successfulWounds;
          if (!armorBlocked && armorSaveValue > 1 && armorSaveValue <= 6) {
            failedArmorSaves = 0;
            for (let k = 0; k < successfulWounds; k += 1) {
              const roll = rollDie();
              if (roll < armorSaveValue) {
                failedArmorSaves += 1;
              }
            }
          }
          let failedInvulnerableSaves = failedArmorSaves;
          if (invulnerableValue > 1 && invulnerableValue <= 6) {
            failedInvulnerableSaves = 0;
            for (let k = 0; k < failedArmorSaves; k += 1) {
              const roll = rollDie();
              if (roll < invulnerableValue) {
                failedInvulnerableSaves += 1;
              }
            }
          }
          let finalWounds = failedInvulnerableSaves;
          if (inputs.targetType === 'living') {
            const instantDeathActive = inputs.instantDeath || strengthValue >= toughnessValue * 2;
            if (instantDeathActive) {
              if (inputs.atomanticShield) {
                finalWounds = 0;
                for (let k = 0; k < failedInvulnerableSaves; k += 1) {
                  finalWounds += Math.floor(Math.random() * 3) + 1;
                }
              } else if (targetWoundsValue > 0) {
                finalWounds = failedInvulnerableSaves * targetWoundsValue;
              }
            }
          }
          const bucket = Math.min(finalWounds, overallMax);
          counts[bucket] += 1;
        }
        return counts.map((count) => count / iterations);
      }
      const hitStrengthValue = parseNumber(inputs.hitStrength);
      const woundValueNumber = parseNumber(inputs.woundValue);
      const armorSaveValue = parseNumber(inputs.armorSave);
      const wardSaveValue = inputs.wardSave.trim() === '' ? 0 : parseNumber(inputs.wardSave);
      const resultNeeded = getShootingResultNeeded(parseNumber(inputs.ballisticSkill), inputs.modifiers, inputs.autoHit);
      const multipleValue = parseMultipleWoundsValue(inputs.multipleWoundsValue);

      for (let i = 0; i < iterations; i += 1) {
        let hitSuccesses = 0;
        let autoWounds = 0;
        for (let j = 0; j < diceCountValue; j += 1) {
          if (inputs.autoHit) {
            hitSuccesses += 1;
            continue;
          }
          if (resultNeeded >= 10) {
            continue;
          }
          const hit = rollShootingHit(resultNeeded, inputs.rerollHitConfig);
          if (hit.success) {
            if (inputs.poisonedAttack && resultNeeded <= 6 && hit.roll === 6) {
              autoWounds += 1;
            } else {
              hitSuccesses += 1;
            }
          }
        }

        let successfulWounds = autoWounds;
        for (let k = 0; k < hitSuccesses; k += 1) {
          const woundResult = rollWithReroll(woundValueNumber, inputs.rerollWoundConfig);
          if (woundResult.isSuccess) {
            successfulWounds += 1;
          }
        }

        const effectiveArmor = armorSaveValue + (hitStrengthValue - 3);
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
        if (wardSaveValue <= 1 || wardSaveValue > 6) {
          failedWard = failedArmor;
        } else {
          for (let k = 0; k < failedArmor; k += 1) {
            const wardResult = rollWithReroll(wardSaveValue, inputs.rerollWardConfig);
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
        const bucket = Math.min(finalDamage, overallMax);
        counts[bucket] += 1;
      }
      return counts.map((count) => count / iterations);
    };

    const probabilitySeries = [
      {
        name: 'Base',
        points: simulateShooting(baseInputs).map((value, index) => ({
          x: index,
          y: parseFloat(value.toFixed(4)),
        })),
        color: '',
      },
      ...seriesData.map((entry) => ({
        name: entry.name,
        points: simulateShooting(entry.inputs).map((value, index) => ({
          x: index,
          y: parseFloat(value.toFixed(4)),
        })),
        color: '',
      })),
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
    const rows = Array.from({ length: overallMax + 1 }, (_, index) => {
      const values: Record<string, number> = {};
      probabilitySeries.forEach((seriesEntry) => {
        values[seriesEntry.name] = seriesEntry.points[index]?.y ?? 0;
      });
      return { x: index, values };
    });
    setChartSeries(series);
    setExpectedSeries(expected);
    setTableRows(rows);
    setGeneratedBaseResult(baseResult);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button size="sm" onClick={onBack}>
          {backLabel}
        </Button>
        {rightSlot ? rightSlot : null}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="px-4 py-5 sm:px-6 sm:py-6">
          <CardHeader
            title="Step 1: Shooting base values"
            subtitle="Set your baseline for comparison"
          />
          <div className="mt-4 space-y-5">
            <InputField
              id="shootingCompareDiceCount"
              label="Dice Count"
              value={diceCount}
              min="1"
              onChange={onDiceCountChange}
            />
            <SectionBlock title="To hit" contentClassName="mt-3">
              {(!autoHit || isHorusHeresy) ? (
                <StatGrid
                  fields={[
                    {
                      id: 'shootingCompareBallisticSkill',
                      label: 'Balistic Skill',
                      value: ballisticSkill,
                      min: '1',
                      max: '10',
                      onChange: onBallisticSkillChange,
                    },
                  ]}
                  columns={1}
                />
              ) : null}
              <div className="mt-3 border-2 border-zinc-900 px-4 py-3">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
                  Result needed
                </div>
                <div className="text-lg font-semibold text-zinc-900">{resultDisplay.main}</div>
                {resultDisplay.sub ? (
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-600">
                    {resultDisplay.sub}
                  </div>
                ) : null}
              </div>
              {!isHorusHeresy ? (
                <OptionGroup layout="stack" className="mt-3">
                  <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
                    <input
                      type="checkbox"
                      checked={autoHit}
                      onChange={(e) => onAutoHitChange(e.target.checked)}
                      className="h-4 w-4 border-2 border-zinc-900"
                    />
                    Auto-hit
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
                    <input
                      type="checkbox"
                      checked={poisonedAttack}
                      onChange={(e) => onPoisonedAttackChange(e.target.checked)}
                      className="h-4 w-4 border-2 border-zinc-900"
                    />
                    Poisoned Attack
                  </label>
                </OptionGroup>
              ) : (
                <OptionGroup layout="stack" className="mt-3">
                  <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
                    <input
                      type="checkbox"
                      checked={nightFighting}
                      onChange={(e) => onNightFightingChange(e.target.checked)}
                      className="h-4 w-4 border-2 border-zinc-900"
                    />
                    Night fighting
                  </label>
                </OptionGroup>
              )}
            </SectionBlock>

            {!autoHit && !isHorusHeresy ? (
              <SectionBlock title="Hit modifiers" contentClassName="mt-3">
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

            {!autoHit && !isHorusHeresy ? (
              <SectionBlock title="Cover" contentClassName="mt-3">
                <OptionGroup layout="grid2">
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

            <SectionBlock title="Re-roll to hit" contentClassName="mt-3">
              <ReRollOptions config={rerollHitConfig} onChange={onRerollHitChange} compact />
            </SectionBlock>

            {!isHorusHeresy ? (
              <>
                <SectionBlock title="To wound" contentClassName="mt-3">
                  <StatGrid
                    fields={[
                      {
                        id: 'shootingCompareHitStrength',
                        label: 'Hit Strength',
                        value: hitStrength,
                        min: '1',
                        onChange: onHitStrengthChange,
                      },
                      {
                        id: 'shootingCompareWoundValue',
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
                        id="shootingCompareMultipleWoundsValue"
                        label="Multiple wounds value"
                        value={multipleWoundsValue}
                        type="text"
                        pattern="^(?:[dD]\\d+|\\d+)$"
                        title="Use a number or dX (e.g. 2 or d6)"
                        placeholder="Value or dX (e.g. 2 or d6)"
                        onChange={onMultipleWoundsValueChange}
                      />
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
                            id: 'shootingCompareArmorSave',
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
                            id: 'shootingCompareWardSave',
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
              </>
            ) : (
              <>
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
                <SectionBlock title="To wound" contentClassName="mt-3">
                  {targetType === 'living' ? (
                    <>
                      <StatGrid
                        columns={2}
                        fields={[
                          {
                            id: 'shootingCompareHitStrength',
                            label: 'Strength',
                            value: hitStrength,
                            min: '1',
                            onChange: onHitStrengthChange,
                          },
                          {
                            id: 'shootingCompareTargetToughness',
                            label: 'Toughness',
                            value: targetToughness,
                            min: '1',
                            onChange: onTargetToughnessChange,
                          },
                          {
                            id: 'shootingCompareArmorPenetration',
                            label: 'Armor Penetration',
                            value: armorPenetration,
                            min: '0',
                            placeholder: 'Leave empty if none',
                            onChange: onArmorPenetrationChange,
                          },
                          {
                            id: 'shootingCompareTargetWounds',
                            label: 'Target Wounds',
                            value: targetWounds,
                            min: '1',
                            onChange: onTargetWoundsChange,
                          },
                        ]}
                      />
                      <div className="mt-3 border-2 border-zinc-900 px-4 py-3">
                        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
                          Result needed
                        </div>
                        <div className="text-lg font-semibold text-zinc-900">{hh2WoundDisplay.main}</div>
                        {hh2WoundDisplay.sub ? (
                          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-600">
                            {hh2WoundDisplay.sub}
                          </div>
                        ) : null}
                      </div>
                      <div className="mt-3 space-y-2">
                        {hh2WoundProfile?.impossible ? (
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-600">
                            Impossible to wound: toughness is at least double the strength.
                          </p>
                        ) : null}
                        {isHh2InstantDeath ? (
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-700">
                            Instant death active.
                          </p>
                        ) : null}
                      </div>
                    </>
                  ) : (
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-600">
                      Vehicle wound rules will be added later.
                    </p>
                  )}
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
                    <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
                      <input
                        type="checkbox"
                        checked={atomanticShield}
                        onChange={(e) => onAtomanticShieldChange(e.target.checked)}
                        className="h-4 w-4 border-2 border-zinc-900"
                      />
                      Atomantic shield
                    </label>
                  </div>
                </SectionBlock>
                <SectionBlock title="Saves" contentClassName="mt-3">
                  <StatGrid
                    columns={2}
                    fields={[
                      {
                        id: 'shootingCompareArmorSave',
                        label: 'Armor Save (X+)',
                        value: armorSave,
                        min: '0',
                        max: '7',
                        placeholder: 'Leave empty if none',
                        onChange: onArmorSaveChange,
                      },
                      {
                        id: 'shootingCompareInvulnerableSave',
                        label: 'Invulnerable Save (X+)',
                        value: wardSave,
                        min: '0',
                        max: '7',
                        placeholder: 'Leave empty if none',
                        onChange: onWardSaveChange,
                      },
                    ]}
                  />
                </SectionBlock>
              </>
            )}
          </div>
          <ActionBar>
            <div className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-700">
              {isHorusHeresy ? 'Base expected damage' : 'Base final damage'}:{' '}
              <span className="font-mono text-zinc-900">{baseResult.toFixed(2)}</span>
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
                    value={resolveSingleField(item.singleField)}
                    onChange={(event) => updateCompare(item.id, { singleField: event.target.value as keyof RangeFieldValues })}
                  >
                    {availableFieldEntries.map(([key, label]) => (
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
                    <InputField
                      id={`${item.id}-compare-range`}
                      label="Range values"
                      value={item.compareRangeValues}
                      type="text"
                      placeholder="Use a range (e.g. 2-4) or list (e.g. 2,3,4)"
                      onChange={(value) => updateCompare(item.id, { compareRangeValues: value })}
                    />
                  )}
                  {item.compareMode === 'range'
                    && item.compareRangeValues.trim()
                    && parseRangeValues(item.compareRangeValues).length === 0 ? (
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-600">
                      Invalid range format. Use 2-4 or 2,3,4.
                    </p>
                  ) : null}
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
    </div>
  );
}
