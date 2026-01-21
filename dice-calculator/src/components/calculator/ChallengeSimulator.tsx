import { useMemo, useState } from 'react';
import Card from '@/components/ui/Card';
import ActionBar from '@/components/ui/ActionBar';
import Button from '@/components/ui/Button';
import InputField from '@/components/ui/InputField';
import CardHeader from '@/components/ui/CardHeader';
import SectionBlock from '@/components/ui/SectionBlock';
import StatGrid from '@/components/ui/StatGrid';
import ModeSwitch from '@/components/calculator/ModeSwitch';
import ReRollOptions, { type RerollConfig } from '@/components/calculator/ReRollOptions';
import DebugPanel from '@/components/ui/DebugPanel';
import {
  applyRerollWithDebug,
  getFaceProbabilitiesWithReroll,
  getHitTarget,
  getWoundTarget,
  parseSpecificValues,
  shouldRerollValue,
} from '@/lib/roll-utils';

const MAX_ROUNDS = 50;

type FighterState = {
  name: string;
  ac: string;
  strength: string;
  resistance: string;
  wounds: string;
  initiative: string;
  attacks: string;
  armorSave: string;
  wardSave: string;
  hitModifierPositive: string;
  hitModifierNegative: string;
  poisonedAttack: boolean;
  predatoryFighter: boolean;
  predatoryFighterCount: string;
  multipleWoundsEnabled: boolean;
  multipleWoundsValue: string;
  alwaysStrikeFirst: boolean;
  alwaysStrikeLast: boolean;
  rerollHit: RerollConfig;
  rerollWound: RerollConfig;
  rerollArmor: RerollConfig;
  rerollWard: RerollConfig;
};

type ChallengerState = FighterState & {
  mountType: 'none' | 'normal' | 'monster';
  mountBreathWeapon: boolean;
  mountBreathStrength: string;
  mount: FighterState;
};

type ParsedMultipleWounds = {
  type: 'fixed' | 'dice';
  value?: number;
  sides?: number;
};

type ParsedFighter = {
  ac: number;
  strength: number;
  resistance: number;
  wounds: number;
  initiative: number;
  attacks: number;
  armorSave: number;
  wardSave: number;
  hitModifierPositive: number;
  hitModifierNegative: number;
  poisonedAttack: boolean;
  predatoryFighterCount: number;
  multipleWounds: ParsedMultipleWounds | null;
  alwaysStrikeFirst: boolean;
  alwaysStrikeLast: boolean;
  rerollHit: RerollConfig;
  rerollWound: RerollConfig;
  rerollArmor: RerollConfig;
  rerollWard: RerollConfig;
};

type ParsedChallenger = {
  rider: ParsedFighter;
  mount: ParsedFighter | null;
  mountType: 'none' | 'normal' | 'monster';
  mountBreathWeapon: boolean;
  mountBreathStrength: number | null;
  defense: {
    ac: number;
    resistance: number;
    wounds: number;
    armorSave: number;
    wardSave: number;
    rerollArmor: RerollConfig;
    rerollWard: RerollConfig;
  };
};

type DefenderProfile = {
  ac: number;
  resistance: number;
  armorSave: number;
  wardSave: number;
  rerollArmor: RerollConfig;
  rerollWard: RerollConfig;
};

type FighterEntry = {
  key: string;
  label: string;
  owner: 'one' | 'two';
  fighter: ParsedFighter;
  opponent: ParsedFighter;
  defender: DefenderProfile;
  attackType?: 'normal' | 'breath';
  breathStrength?: number;
  breathHits?: number;
};

type AttackDebug = {
  hitTarget: number;
  baseHitTarget: number;
  hitModifierPositive: number;
  hitModifierNegative: number;
  woundTarget: number;
  effectiveArmorSave: number;
  poisonedAttack: boolean;
  predatoryCount: number;
  predatorySixes: number;
  totalAttacks: number;
  poisonedAutoWounds: number;
  nonPoisonHits: number;
  rerollHitLabel: string;
  rerollWoundLabel: string;
  rerollArmorLabel: string;
  rerollWardLabel: string;
  asfBonusReroll: boolean;
  hitInitialRolls: number[];
  hitRerollRolls: number[];
  hitRolls: number[];
  woundInitialRolls: number[];
  woundRerollRolls: number[];
  woundRolls: number[];
  armorInitialRolls: number[];
  armorRerollRolls: number[];
  armorRolls: number[];
  wardInitialRolls: number[];
  wardRerollRolls: number[];
  wardRolls: number[];
  breathRolls?: number[];
  multipleWoundsValue: string;
  multipleWoundsRolls: number[];
  hitChance?: number;
  woundChance?: number;
  armorSaveChance?: number;
  wardSaveChance?: number;
  skipped?: boolean;
};

type AttackOutcome = {
  successfulHits: number;
  successfulWounds: number;
  poisonedAutoWounds: number;
  failedArmorSaves: number;
  failedWardSaves: number;
  finalDamage: number;
  debug: AttackDebug;
};

type RoundAction = {
  label: string;
  sourceOwner: 'one' | 'two';
  targetOwner: 'one' | 'two';
  outcome: AttackOutcome;
};

type RoundLog = {
  round: number;
  orderLabel: string;
  startWounds: { one: number; two: number };
  endWounds: { one: number; two: number };
  actions: RoundAction[];
  summary: {
    oneDamage: number;
    twoDamage: number;
  };
};

type ChallengeSimulatorProps = {
  onBack: () => void;
};

const buildDefaultReroll = (): RerollConfig => ({
  enabled: false,
  mode: 'failed',
  scope: 'all',
  specificValues: '',
});

const buildDefaultFighter = (): FighterState => ({
  name: '',
  ac: '4',
  strength: '3',
  resistance: '3',
  wounds: '3',
  initiative: '3',
  attacks: '1',
  armorSave: '4',
  wardSave: '0',
  hitModifierPositive: '0',
  hitModifierNegative: '0',
  poisonedAttack: false,
  predatoryFighter: false,
  predatoryFighterCount: '0',
  multipleWoundsEnabled: false,
  multipleWoundsValue: '',
  alwaysStrikeFirst: false,
  alwaysStrikeLast: false,
  rerollHit: buildDefaultReroll(),
  rerollWound: buildDefaultReroll(),
  rerollArmor: buildDefaultReroll(),
  rerollWard: buildDefaultReroll(),
});

const buildDefaultChallenger = (): ChallengerState => ({
  ...buildDefaultFighter(),
  mountType: 'none',
  mountBreathWeapon: false,
  mountBreathStrength: '3',
  mount: buildDefaultFighter(),
});

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

const parseMultipleWoundsValue = (rawValue: string): ParsedMultipleWounds | null => {
  const value = rawValue.trim();
  if (!value) {
    return null;
  }
  if (value.toLowerCase().startsWith('d')) {
    const sides = Number.parseInt(value.slice(1), 10);
    if (Number.isNaN(sides) || sides < 2) {
      return null;
    }
    return { type: 'dice', sides };
  }
  const fixed = Number.parseInt(value, 10);
  if (Number.isNaN(fixed) || fixed <= 0) {
    return null;
  }
  return { type: 'fixed', value: fixed };
};

const parseFighter = (fighter: FighterState): ParsedFighter | null => {
  const wardSaveValue = fighter.wardSave.trim() === '' ? '0' : fighter.wardSave;
  const parsed = {
    ac: Number.parseInt(fighter.ac, 10),
    strength: Number.parseInt(fighter.strength, 10),
    resistance: Number.parseInt(fighter.resistance, 10),
    wounds: Number.parseInt(fighter.wounds, 10),
    initiative: Number.parseInt(fighter.initiative, 10),
    attacks: Number.parseInt(fighter.attacks, 10),
    armorSave: Number.parseInt(fighter.armorSave, 10),
    wardSave: Number.parseInt(wardSaveValue, 10),
    hitModifierPositive: Number.parseInt(fighter.hitModifierPositive || '0', 10),
    hitModifierNegative: Number.parseInt(fighter.hitModifierNegative || '0', 10),
    predatoryFighterCount: fighter.predatoryFighter
      ? Number.parseInt(fighter.predatoryFighterCount, 10)
      : 0,
  };
  const multipleWounds = fighter.multipleWoundsEnabled
    ? parseMultipleWoundsValue(fighter.multipleWoundsValue)
    : null;

  if (
    Number.isNaN(parsed.ac)
    || Number.isNaN(parsed.strength)
    || Number.isNaN(parsed.resistance)
    || Number.isNaN(parsed.wounds)
    || parsed.wounds <= 0
    || Number.isNaN(parsed.initiative)
    || Number.isNaN(parsed.attacks)
    || parsed.attacks <= 0
    || Number.isNaN(parsed.armorSave)
    || Number.isNaN(parsed.wardSave)
    || Number.isNaN(parsed.hitModifierPositive)
    || Number.isNaN(parsed.hitModifierNegative)
    || Number.isNaN(parsed.predatoryFighterCount)
    || parsed.predatoryFighterCount < 0
    || (fighter.multipleWoundsEnabled && !multipleWounds)
  ) {
    return null;
  }

  return {
    ...parsed,
    poisonedAttack: fighter.poisonedAttack,
    predatoryFighterCount: Math.min(parsed.predatoryFighterCount, parsed.attacks),
    multipleWounds,
    alwaysStrikeFirst: fighter.alwaysStrikeFirst,
    alwaysStrikeLast: fighter.alwaysStrikeLast,
    rerollHit: fighter.rerollHit,
    rerollWound: fighter.rerollWound,
    rerollArmor: fighter.rerollArmor,
    rerollWard: fighter.rerollWard,
  };
};

const resolveHitRerollConfig = (
  attacker: ParsedFighter,
  defender: ParsedFighter,
): { config: RerollConfig; asfBonus: boolean } => {
  if (
    attacker.alwaysStrikeFirst
    && !defender.alwaysStrikeFirst
    && attacker.initiative > defender.initiative
  ) {
    if (attacker.rerollHit.enabled) {
      return { config: attacker.rerollHit, asfBonus: true };
    }
    return {
      config: {
        enabled: true,
        mode: 'failed',
        scope: 'all',
        specificValues: '',
      },
      asfBonus: true,
    };
  }
  return { config: attacker.rerollHit, asfBonus: false };
};

const buildAttackOrder = (entries: FighterEntry[]) => {
  const priorityFor = (fighter: ParsedFighter) => {
    if (fighter.alwaysStrikeFirst) {
      return 0;
    }
    if (fighter.alwaysStrikeLast) {
      return 2;
    }
    return 1;
  };

  const sorted = [...entries].sort((a, b) => {
    const priorityA = priorityFor(a.fighter);
    const priorityB = priorityFor(b.fighter);
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    if (a.fighter.initiative !== b.fighter.initiative) {
      return b.fighter.initiative - a.fighter.initiative;
    }
    return a.key.localeCompare(b.key);
  });

  const groups: FighterEntry[][] = [];
  sorted.forEach((entry) => {
    const priority = priorityFor(entry.fighter);
    const lastGroup = groups[groups.length - 1];
    if (
      lastGroup
      && priorityFor(lastGroup[0].fighter) === priority
      && lastGroup[0].fighter.initiative === entry.fighter.initiative
    ) {
      lastGroup.push(entry);
    } else {
      groups.push([entry]);
    }
  });

  const label = groups
    .map((group) => {
      const fighter = group[0].fighter;
      const prefix = fighter.alwaysStrikeFirst
        ? 'ASF'
        : fighter.alwaysStrikeLast
          ? 'ASL'
          : 'I';
      return `${prefix} ${fighter.initiative}`;
    })
    .join(' -> ');

  return { groups, label: label || '-' };
};

const getExtendedHitProbabilities = (target: number, config: RerollConfig) => {
  if (target <= 6) {
    return getFaceProbabilitiesWithReroll(target, config);
  }
  const followUpTarget = target - 3;
  const followUpChance = target >= 10 ? 0 : Math.max(0, (7 - followUpTarget) / 6);
  const specificValues = new Set(parseSpecificValues(config.specificValues));
  let rerollChance = 0;
  const rerollChanceByValue: number[] = [];
  for (let value = 1; value <= 6; value += 1) {
    const successProb = value === 6 ? followUpChance : 0;
    const failureProb = 1 - successProb;
    let rerollProb = 0;
    if (config.enabled) {
      const inScope = config.scope === 'all' || specificValues.has(value);
      if (inScope) {
        rerollProb = config.mode === 'failed' ? failureProb : successProb;
      }
    }
    rerollChanceByValue[value] = (1 / 6) * rerollProb;
    rerollChance += rerollChanceByValue[value];
  }
  const probabilities: number[] = [];
  for (let value = 1; value <= 6; value += 1) {
    const baseChance = 1 / 6 - (rerollChanceByValue[value] ?? 0);
    probabilities[value] = baseChance + rerollChance / 6;
  }
  const sixChance = probabilities[6] ?? 0;
  const successChance = sixChance * followUpChance;
  return { successChance, sixChance };
};

const resolveHitRolls = (
  initialRolls: number[],
  hitTarget: number,
  config: RerollConfig,
) => {
  if (hitTarget <= 6) {
    const rerollResult = applyRerollWithDebug(initialRolls, hitTarget, config);
    const successCount = rerollResult.finalRolls.filter((roll) => roll >= hitTarget).length;
    return {
      finalRolls: rerollResult.finalRolls,
      rerollRolls: rerollResult.rerollRolls,
      successCount,
    };
  }

  const followUpTarget = hitTarget - 3;
  const specificValues = new Set(parseSpecificValues(config.specificValues));
  const rerollRolls: number[] = [];
  const finalRolls: number[] = [];
  let successCount = 0;

  initialRolls.forEach((roll) => {
    let initialRoll = roll;
    let followUpRoll = 0;
    if (initialRoll === 6) {
      followUpRoll = Math.floor(Math.random() * 6) + 1;
    }
    let attemptSuccess = initialRoll === 6 && followUpRoll >= followUpTarget;
    if (shouldRerollValue(initialRoll, attemptSuccess, config, specificValues)) {
      initialRoll = Math.floor(Math.random() * 6) + 1;
      rerollRolls.push(initialRoll);
      followUpRoll = initialRoll === 6 ? Math.floor(Math.random() * 6) + 1 : 0;
      attemptSuccess = initialRoll === 6 && followUpRoll >= followUpTarget;
    }
    finalRolls.push(initialRoll);
    if (attemptSuccess) {
      successCount += 1;
    }
  });

  return { finalRolls, rerollRolls, successCount };
};

const computeBreathAttack = (
  attacker: ParsedFighter,
  defender: DefenderProfile,
  hits: number,
  breathStrength: number,
  breathRolls: number[],
): AttackOutcome => {
  const woundTarget = getWoundTarget(breathStrength, defender.resistance);
  const woundInitialRolls = Array.from({ length: hits }, () => Math.floor(Math.random() * 6) + 1);
  const woundRerollResult = applyRerollWithDebug(woundInitialRolls, woundTarget, attacker.rerollWound);
  const woundRolls = woundRerollResult.finalRolls;
  const woundSuccesses = woundRolls.filter((roll) => roll >= woundTarget).length;

  const effectiveArmorSave = defender.armorSave + (breathStrength - 3);
  let failedArmorSaves = woundSuccesses;
  let armorRolls: number[] = [];
  let armorInitialRolls: number[] = [];
  let armorRerollRolls: number[] = [];
  if (effectiveArmorSave > 1 && effectiveArmorSave <= 6) {
    armorInitialRolls = Array.from({ length: woundSuccesses }, () => Math.floor(Math.random() * 6) + 1);
    const armorRerollResult = applyRerollWithDebug(armorInitialRolls, effectiveArmorSave, defender.rerollArmor);
    armorRerollRolls = armorRerollResult.rerollRolls;
    armorRolls = armorRerollResult.finalRolls;
    const armorSuccesses = armorRolls.filter((roll) => roll >= effectiveArmorSave).length;
    failedArmorSaves = woundSuccesses - armorSuccesses;
  }

  let failedWardSaves = failedArmorSaves;
  let wardRolls: number[] = [];
  let wardInitialRolls: number[] = [];
  let wardRerollRolls: number[] = [];
  if (defender.wardSave > 1 && defender.wardSave <= 6) {
    wardInitialRolls = Array.from({ length: failedArmorSaves }, () => Math.floor(Math.random() * 6) + 1);
    const wardRerollResult = applyRerollWithDebug(wardInitialRolls, defender.wardSave, defender.rerollWard);
    wardRerollRolls = wardRerollResult.rerollRolls;
    wardRolls = wardRerollResult.finalRolls;
    const wardSuccesses = wardRolls.filter((roll) => roll >= defender.wardSave).length;
    failedWardSaves = failedArmorSaves - wardSuccesses;
  }

  let finalDamage = failedWardSaves;
  let multipleWoundsRolls: number[] = [];
  if (attacker.multipleWounds) {
    if (attacker.multipleWounds.type === 'fixed') {
      finalDamage = failedWardSaves * (attacker.multipleWounds.value ?? 1);
    } else {
      const sides = attacker.multipleWounds.sides ?? 0;
      multipleWoundsRolls = Array.from({ length: failedWardSaves }, () => Math.floor(Math.random() * sides) + 1);
      finalDamage = multipleWoundsRolls.reduce((sum, roll) => sum + roll, 0);
    }
  }

  return {
    successfulHits: hits,
    successfulWounds: woundSuccesses,
    poisonedAutoWounds: 0,
    failedArmorSaves,
    failedWardSaves,
    finalDamage,
    debug: {
      hitTarget: 0,
      baseHitTarget: 0,
      hitModifierPositive: 0,
      hitModifierNegative: 0,
      woundTarget,
      effectiveArmorSave,
      poisonedAttack: false,
      predatoryCount: 0,
      predatorySixes: 0,
      totalAttacks: hits,
      poisonedAutoWounds: 0,
      nonPoisonHits: hits,
      rerollHitLabel: 'Auto-hit',
      rerollWoundLabel: formatRerollLabel(attacker.rerollWound),
      rerollArmorLabel: formatRerollLabel(defender.rerollArmor),
      rerollWardLabel: formatRerollLabel(defender.rerollWard),
      asfBonusReroll: false,
      hitInitialRolls: [],
      hitRerollRolls: [],
      hitRolls: [],
      woundInitialRolls,
      woundRerollRolls: woundRerollResult.rerollRolls,
      woundRolls,
      armorInitialRolls,
      armorRerollRolls,
      armorRolls,
      wardInitialRolls,
      wardRerollRolls,
      wardRolls,
      breathRolls,
      multipleWoundsValue: attacker.multipleWounds
        ? (attacker.multipleWounds.type === 'dice'
          ? `d${attacker.multipleWounds.sides}`
          : `${attacker.multipleWounds.value}`)
        : '',
      multipleWoundsRolls,
    },
  };
};

const computeProbabilityAttack = (
  attacker: ParsedFighter,
  defender: DefenderProfile,
  asfBonus: { config: RerollConfig; asfBonus: boolean },
): AttackOutcome => {
  const baseHitTarget = getHitTarget(attacker.ac, defender.ac);
  const rawHitTarget = baseHitTarget + attacker.hitModifierNegative - attacker.hitModifierPositive;
  const hitTarget = Math.max(2, rawHitTarget);
  const woundTarget = getWoundTarget(attacker.strength, defender.resistance);
  const hitProbabilities = getExtendedHitProbabilities(hitTarget, asfBonus.config);
  const poisonActive = attacker.poisonedAttack && hitTarget <= 6;
  const predatoryActive = hitTarget <= 6;
  const poisonedAutoWoundChance = poisonActive ? hitProbabilities.sixChance : 0;
  const nonPoisonHitChance = poisonActive
    ? Math.max(0, hitProbabilities.successChance - hitProbabilities.sixChance)
    : hitProbabilities.successChance;
  const cappedPredatory = predatoryActive
    ? Math.min(attacker.predatoryFighterCount, attacker.attacks)
    : 0;
  const extraAttacks = cappedPredatory * hitProbabilities.sixChance;
  const totalAttacks = attacker.attacks + extraAttacks;
  const woundChance = getFaceProbabilitiesWithReroll(woundTarget, attacker.rerollWound).successChance;
  const armorSaveModifier = attacker.strength - 3;
  const effectiveArmorSave = defender.armorSave + armorSaveModifier;
  const armorSaveChance = effectiveArmorSave > 1
    ? getFaceProbabilitiesWithReroll(effectiveArmorSave, defender.rerollArmor).successChance
    : 0;
  const wardSaveChance = defender.wardSave > 1
    ? getFaceProbabilitiesWithReroll(defender.wardSave, defender.rerollWard).successChance
    : 0;

  const successfulHits = totalAttacks * hitProbabilities.successChance;
  const poisonedAutoWounds = totalAttacks * poisonedAutoWoundChance;
  const hitsToWound = totalAttacks * nonPoisonHitChance;
  const successfulWounds = attacker.poisonedAttack
    ? poisonedAutoWounds + hitsToWound * woundChance
    : successfulHits * woundChance;
  const failedArmorSaves = successfulWounds * (1 - armorSaveChance);
  const failedWardSaves = failedArmorSaves * (1 - wardSaveChance);
  const multipleWoundsMultiplier = attacker.multipleWounds
    ? (attacker.multipleWounds.type === 'dice'
      ? ((attacker.multipleWounds.sides ?? 0) + 1) / 2
      : attacker.multipleWounds.value ?? 1)
    : 1;
  const finalDamage = failedWardSaves * multipleWoundsMultiplier;

  return {
    successfulHits: parseFloat(successfulHits.toFixed(2)),
    successfulWounds: parseFloat(successfulWounds.toFixed(2)),
    poisonedAutoWounds: parseFloat(poisonedAutoWounds.toFixed(2)),
    failedArmorSaves: parseFloat(failedArmorSaves.toFixed(2)),
    failedWardSaves: parseFloat(failedWardSaves.toFixed(2)),
    finalDamage: parseFloat(finalDamage.toFixed(2)),
    debug: {
      hitTarget,
      baseHitTarget,
      hitModifierPositive: attacker.hitModifierPositive,
      hitModifierNegative: attacker.hitModifierNegative,
      woundTarget,
      effectiveArmorSave,
      poisonedAttack: poisonActive,
      predatoryCount: cappedPredatory,
      predatorySixes: predatoryActive ? parseFloat((extraAttacks || 0).toFixed(2)) : 0,
      totalAttacks: parseFloat(totalAttacks.toFixed(2)),
      poisonedAutoWounds: parseFloat(poisonedAutoWounds.toFixed(2)),
      nonPoisonHits: parseFloat(hitsToWound.toFixed(2)),
      rerollHitLabel: formatRerollLabel(asfBonus.config),
      rerollWoundLabel: formatRerollLabel(attacker.rerollWound),
      rerollArmorLabel: formatRerollLabel(defender.rerollArmor),
      rerollWardLabel: formatRerollLabel(defender.rerollWard),
      asfBonusReroll: asfBonus.asfBonus,
      hitInitialRolls: [],
      hitRerollRolls: [],
      hitRolls: [],
      woundInitialRolls: [],
      woundRerollRolls: [],
      woundRolls: [],
      armorInitialRolls: [],
      armorRerollRolls: [],
      armorRolls: [],
      wardInitialRolls: [],
      wardRerollRolls: [],
      wardRolls: [],
      multipleWoundsValue: attacker.multipleWounds
        ? (attacker.multipleWounds.type === 'dice'
          ? `d${attacker.multipleWounds.sides}`
          : `${attacker.multipleWounds.value}`)
        : '',
      multipleWoundsRolls: [],
      hitChance: hitProbabilities.successChance,
      woundChance,
      armorSaveChance,
      wardSaveChance,
    },
  };
};

const computeThrowAttack = (
  attacker: ParsedFighter,
  defender: DefenderProfile,
  asfBonus: { config: RerollConfig; asfBonus: boolean },
): AttackOutcome => {
  const baseHitTarget = getHitTarget(attacker.ac, defender.ac);
  const rawHitTarget = baseHitTarget + attacker.hitModifierNegative - attacker.hitModifierPositive;
  const hitTarget = Math.max(2, rawHitTarget);
  const hitInitialRolls = Array.from({ length: attacker.attacks }, () => Math.floor(Math.random() * 6) + 1);
  const hitRerollResult = resolveHitRolls(hitInitialRolls, hitTarget, asfBonus.config);
  const hitRolls = hitRerollResult.finalRolls;
  const predatoryActive = hitTarget <= 6;
  const predatoryCount = predatoryActive
    ? Math.min(attacker.predatoryFighterCount, attacker.attacks)
    : 0;
  const predatorySixes = predatoryCount
    ? hitRolls.slice(0, predatoryCount).filter((roll) => roll === 6).length
    : 0;
  let extraHitInitialRolls: number[] = [];
  let extraHitRerolls: number[] = [];
  let extraHitRolls: number[] = [];
  let extraHitSuccesses = 0;
  if (predatorySixes > 0) {
    extraHitInitialRolls = Array.from({ length: predatorySixes }, () => Math.floor(Math.random() * 6) + 1);
    const extraHitRerollResult = resolveHitRolls(extraHitInitialRolls, hitTarget, asfBonus.config);
    extraHitRerolls = extraHitRerollResult.rerollRolls;
    extraHitRolls = extraHitRerollResult.finalRolls;
    extraHitSuccesses = extraHitRerollResult.successCount;
  }
  const combinedHitInitialRolls = hitInitialRolls.concat(extraHitInitialRolls);
  const combinedHitRerollRolls = hitRerollResult.rerollRolls.concat(extraHitRerolls);
  const combinedHitRolls = hitRolls.concat(extraHitRolls);
  const totalAttacks = attacker.attacks + predatorySixes;
  const poisonActive = attacker.poisonedAttack && hitTarget <= 6;
  const poisonedAutoWounds = poisonActive
    ? combinedHitRolls.filter((roll) => roll === 6).length
    : 0;
  const nonPoisonHits = poisonActive
    ? combinedHitRolls.filter((roll) => roll >= hitTarget && roll !== 6).length
    : hitRerollResult.successCount + extraHitSuccesses;
  const hitSuccesses = poisonActive ? (poisonedAutoWounds + nonPoisonHits) : nonPoisonHits;

  const woundTarget = getWoundTarget(attacker.strength, defender.resistance);
  const woundInitialRolls = Array.from({ length: nonPoisonHits }, () => Math.floor(Math.random() * 6) + 1);
  const woundRerollResult = applyRerollWithDebug(woundInitialRolls, woundTarget, attacker.rerollWound);
  const woundRolls = woundRerollResult.finalRolls;
  const woundSuccesses = woundRolls.filter((roll) => roll >= woundTarget).length;
  const totalWounds = poisonActive
    ? poisonedAutoWounds + woundSuccesses
    : woundSuccesses;

  const effectiveArmorSave = defender.armorSave + (attacker.strength - 3);
  let failedArmorSaves = totalWounds;
  let armorRolls: number[] = [];
  let armorInitialRolls: number[] = [];
  let armorRerollRolls: number[] = [];
  if (effectiveArmorSave > 1 && effectiveArmorSave <= 6) {
    armorInitialRolls = Array.from({ length: totalWounds }, () => Math.floor(Math.random() * 6) + 1);
    const armorRerollResult = applyRerollWithDebug(armorInitialRolls, effectiveArmorSave, defender.rerollArmor);
    armorRerollRolls = armorRerollResult.rerollRolls;
    armorRolls = armorRerollResult.finalRolls;
    const armorSuccesses = armorRolls.filter((roll) => roll >= effectiveArmorSave).length;
    failedArmorSaves = totalWounds - armorSuccesses;
  }

  let failedWardSaves = failedArmorSaves;
  let wardRolls: number[] = [];
  let wardInitialRolls: number[] = [];
  let wardRerollRolls: number[] = [];
  if (defender.wardSave > 1 && defender.wardSave <= 6) {
    wardInitialRolls = Array.from({ length: failedArmorSaves }, () => Math.floor(Math.random() * 6) + 1);
    const wardRerollResult = applyRerollWithDebug(wardInitialRolls, defender.wardSave, defender.rerollWard);
    wardRerollRolls = wardRerollResult.rerollRolls;
    wardRolls = wardRerollResult.finalRolls;
    const wardSuccesses = wardRolls.filter((roll) => roll >= defender.wardSave).length;
    failedWardSaves = failedArmorSaves - wardSuccesses;
  }

  let finalDamage = failedWardSaves;
  let multipleWoundsRolls: number[] = [];
  if (attacker.multipleWounds) {
    if (attacker.multipleWounds.type === 'fixed') {
      finalDamage = failedWardSaves * (attacker.multipleWounds.value ?? 1);
    } else {
      const sides = attacker.multipleWounds.sides ?? 0;
      multipleWoundsRolls = Array.from({ length: failedWardSaves }, () => Math.floor(Math.random() * sides) + 1);
      finalDamage = multipleWoundsRolls.reduce((sum, roll) => sum + roll, 0);
    }
  }

  return {
    successfulHits: hitSuccesses,
    successfulWounds: totalWounds,
    poisonedAutoWounds: poisonedAutoWounds,
    failedArmorSaves,
    failedWardSaves,
    finalDamage,
    debug: {
      hitTarget,
      baseHitTarget,
      hitModifierPositive: attacker.hitModifierPositive,
      hitModifierNegative: attacker.hitModifierNegative,
      woundTarget,
      effectiveArmorSave,
      poisonedAttack: poisonActive,
      predatoryCount,
      predatorySixes,
      totalAttacks,
      poisonedAutoWounds,
      nonPoisonHits,
      rerollHitLabel: formatRerollLabel(asfBonus.config),
      rerollWoundLabel: formatRerollLabel(attacker.rerollWound),
      rerollArmorLabel: formatRerollLabel(defender.rerollArmor),
      rerollWardLabel: formatRerollLabel(defender.rerollWard),
      asfBonusReroll: asfBonus.asfBonus,
      hitInitialRolls: combinedHitInitialRolls,
      hitRerollRolls: combinedHitRerollRolls,
      hitRolls: combinedHitRolls,
      woundInitialRolls,
      woundRerollRolls: woundRerollResult.rerollRolls,
      woundRolls,
      armorInitialRolls,
      armorRerollRolls,
      armorRolls,
      wardInitialRolls,
      wardRerollRolls,
      wardRolls,
      multipleWoundsValue: attacker.multipleWounds
        ? (attacker.multipleWounds.type === 'dice'
          ? `d${attacker.multipleWounds.sides}`
          : `${attacker.multipleWounds.value}`)
        : '',
      multipleWoundsRolls,
    },
  };
};

const FighterFields = ({
  fighter,
  onChange,
  idPrefix,
  nameLabel,
  showNameField = true,
}: {
  fighter: FighterState;
  onChange: (next: FighterState) => void;
  idPrefix: string;
  nameLabel: string;
  showNameField?: boolean;
}) => {
  const multipleWoundsValue = fighter.multipleWoundsValue.trim();
  const multipleWoundsInvalid = fighter.multipleWoundsEnabled && multipleWoundsValue !== '' && (() => {
    if (multipleWoundsValue.toLowerCase().startsWith('d')) {
      const sides = Number.parseInt(multipleWoundsValue.slice(1), 10);
      return Number.isNaN(sides) || sides < 2;
    }
    const fixed = Number.parseInt(multipleWoundsValue, 10);
    return Number.isNaN(fixed) || fixed <= 0;
  })();

  return (
    <>
      {showNameField ? (
        <div className="mt-4">
          <InputField
            id={`${idPrefix}-name`}
            label={nameLabel}
            value={fighter.name}
            type="text"
            placeholder={nameLabel}
            onChange={(value) => onChange({ ...fighter, name: value })}
          />
        </div>
      ) : null}
      <StatGrid
        fields={[
          {
            id: `${idPrefix}-ac`,
            label: 'AC',
            value: fighter.ac,
            min: '1',
            onChange: (value) => onChange({ ...fighter, ac: value }),
          },
          {
            id: `${idPrefix}-strength`,
            label: 'Strength',
            value: fighter.strength,
            min: '1',
            onChange: (value) => onChange({ ...fighter, strength: value }),
          },
          {
            id: `${idPrefix}-resistance`,
            label: 'Resistance',
            value: fighter.resistance,
            min: '1',
            onChange: (value) => onChange({ ...fighter, resistance: value }),
          },
          {
            id: `${idPrefix}-wounds`,
            label: 'Wounds',
            value: fighter.wounds,
            min: '1',
            onChange: (value) => onChange({ ...fighter, wounds: value }),
          },
          {
            id: `${idPrefix}-initiative`,
            label: 'Initiative',
            value: fighter.initiative,
            min: '1',
            onChange: (value) => onChange({ ...fighter, initiative: value }),
          },
          {
            id: `${idPrefix}-attacks`,
            label: 'Attacks',
            value: fighter.attacks,
            min: '1',
            onChange: (value) => onChange({ ...fighter, attacks: value }),
          },
          {
            id: `${idPrefix}-armor`,
            label: 'Armor Save (X+)',
            value: fighter.armorSave,
            min: '1',
            max: '7',
            onChange: (value) => onChange({ ...fighter, armorSave: value }),
          },
          {
            id: `${idPrefix}-ward`,
            label: 'Ward Save (X+)',
            value: fighter.wardSave,
            min: '0',
            max: '7',
            placeholder: 'Leave empty if none',
            onChange: (value) => onChange({ ...fighter, wardSave: value }),
          },
        ]}
        className="mt-4"
      />

      <div className="mt-5 space-y-5">
        <SectionBlock title="Hit modifiers" variant="bar" contentClassName="mt-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InputField
              id={`${idPrefix}-hit-mod-pos`}
              label="Positive modifier"
              value={fighter.hitModifierPositive}
              min="0"
              onChange={(value) => onChange({ ...fighter, hitModifierPositive: value })}
            />
            <InputField
              id={`${idPrefix}-hit-mod-neg`}
              label="Negative modifier"
              value={fighter.hitModifierNegative}
              min="0"
              onChange={(value) => onChange({ ...fighter, hitModifierNegative: value })}
            />
          </div>
        </SectionBlock>

        <SectionBlock title="Special rules" variant="bar" contentClassName="mt-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
              <input
                type="checkbox"
                checked={fighter.poisonedAttack}
                onChange={(e) => onChange({ ...fighter, poisonedAttack: e.target.checked })}
                className="h-4 w-4 border-2 border-zinc-900"
              />
              Poisoned Attack
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
              <input
                type="checkbox"
                checked={fighter.predatoryFighter}
                onChange={(e) => onChange({ ...fighter, predatoryFighter: e.target.checked })}
                className="h-4 w-4 border-2 border-zinc-900"
              />
              Predatory fighter
            </label>
            {fighter.predatoryFighter ? (
              <InputField
                id={`${idPrefix}-predatory-count`}
                label="Predatory fighter count"
                value={fighter.predatoryFighterCount}
                min="0"
                onChange={(value) => onChange({ ...fighter, predatoryFighterCount: value })}
              />
            ) : null}
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
              <input
                type="checkbox"
                checked={fighter.alwaysStrikeFirst}
                onChange={(e) => onChange({ ...fighter, alwaysStrikeFirst: e.target.checked })}
                className="h-4 w-4 border-2 border-zinc-900"
              />
              Always strike first
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
              <input
                type="checkbox"
                checked={fighter.alwaysStrikeLast}
                onChange={(e) => onChange({ ...fighter, alwaysStrikeLast: e.target.checked })}
                className="h-4 w-4 border-2 border-zinc-900"
              />
              Always strike last
            </label>
          </div>
        </SectionBlock>

        <SectionBlock title="Multiple wounds" variant="bar" contentClassName="mt-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
              <input
                type="checkbox"
                checked={fighter.multipleWoundsEnabled}
                onChange={(e) => onChange({ ...fighter, multipleWoundsEnabled: e.target.checked })}
                className="h-4 w-4 border-2 border-zinc-900"
              />
              Enable multiple wounds
            </label>
            {fighter.multipleWoundsEnabled ? (
              <InputField
                id={`${idPrefix}-multiple-wounds`}
                label="Multiple wounds value"
                value={fighter.multipleWoundsValue}
                type="text"
                pattern="^(?:[dD]\\d+|\\d+)$"
                title="Use a number or dX (e.g. 2 or d6)"
                placeholder="Value or dX (e.g. 2 or d6)"
                onChange={(value) => onChange({ ...fighter, multipleWoundsValue: value })}
              />
            ) : null}
            {multipleWoundsInvalid ? (
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-600">
                Use a number (e.g. 2) or dX (e.g. d6).
              </p>
            ) : null}
          </div>
        </SectionBlock>

        <SectionBlock title="Re-rolls" variant="bar" contentClassName="mt-3">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-zinc-900">Re-roll to hit</p>
              <div className="mt-2 border-2 border-zinc-900 bg-white px-3 py-3">
                <ReRollOptions
                  config={fighter.rerollHit}
                  onChange={(config) => onChange({ ...fighter, rerollHit: config })}
                  compact
                />
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-zinc-900">Re-roll to wound</p>
              <div className="mt-2 border-2 border-zinc-900 bg-white px-3 py-3">
                <ReRollOptions
                  config={fighter.rerollWound}
                  onChange={(config) => onChange({ ...fighter, rerollWound: config })}
                  compact
                />
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-zinc-900">Re-roll armor</p>
              <div className="mt-2 border-2 border-zinc-900 bg-white px-3 py-3">
                <ReRollOptions
                  config={fighter.rerollArmor}
                  onChange={(config) => onChange({ ...fighter, rerollArmor: config })}
                  compact
                />
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-zinc-900">Re-roll ward</p>
              <div className="mt-2 border-2 border-zinc-900 bg-white px-3 py-3">
                <ReRollOptions
                  config={fighter.rerollWard}
                  onChange={(config) => onChange({ ...fighter, rerollWard: config })}
                  compact
                />
              </div>
            </div>
          </div>
        </SectionBlock>
      </div>
    </>
  );
};

const ChallengerForm = ({
  title,
  challenger,
  onChange,
}: {
  title: string;
  challenger: ChallengerState;
  onChange: (next: ChallengerState) => void;
}) => {
  const updateFighter = (next: FighterState) => onChange({ ...challenger, ...next });
  const mountLabel = challenger.mountType === 'monster' ? 'Monster' : 'Normal';

  return (
    <Card className="px-4 py-5 sm:px-6 sm:py-6">
      <h3 className="text-base font-semibold text-zinc-900">
        {challenger.name.trim() ? `${title} — ${challenger.name.trim()}` : title}
      </h3>
      <FighterFields
        fighter={challenger}
        onChange={updateFighter}
        idPrefix={title}
        nameLabel="Challenger name"
        showNameField={true}
      />

      <SectionBlock title="Mount" variant="bar" contentClassName="mt-3" className="mt-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(['none', 'normal', 'monster'] as const).map((option) => (
            <label
              key={`${title}-mount-${option}`}
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600"
            >
              <input
                type="radio"
                name={`${title}-mount-type`}
                checked={challenger.mountType === option}
                onChange={() => onChange({ ...challenger, mountType: option })}
                className="h-4 w-4 border-2 border-zinc-900"
              />
              {option === 'none' ? 'No mount' : option === 'normal' ? 'Normal' : 'Monster'}
            </label>
          ))}
          {challenger.mountType === 'monster' ? (
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
              <input
                type="checkbox"
                checked={challenger.mountBreathWeapon}
                onChange={(e) => onChange({ ...challenger, mountBreathWeapon: e.target.checked })}
                className="h-4 w-4 border-2 border-zinc-900"
              />
              Breath weapon
            </label>
          ) : null}
        </div>
        {challenger.mountType === 'monster' && challenger.mountBreathWeapon ? (
          <div className="mt-3">
            <InputField
              id={`${title}-breath-strength`}
              label="Breath weapon strength"
              value={challenger.mountBreathStrength}
              min="1"
              onChange={(value) => onChange({ ...challenger, mountBreathStrength: value })}
            />
          </div>
        ) : null}
      </SectionBlock>

      {challenger.mountType !== 'none' ? (
        <Card className="mt-5 px-4 py-5 sm:px-6 sm:py-6">
          <h4 className="text-base font-semibold text-zinc-900">
            {mountLabel} mount
          </h4>
          <FighterFields
            fighter={challenger.mount}
            onChange={(next) => onChange({ ...challenger, mount: next })}
            idPrefix={`${title}-mount`}
            nameLabel="Mount name"
            showNameField={false}
          />
        </Card>
      ) : null}
    </Card>
  );
};

const RoundDetails = ({
  round,
  challengerOneLabel,
  challengerTwoLabel,
  isProbability,
}: {
  round: RoundLog;
  challengerOneLabel: string;
  challengerTwoLabel: string;
  isProbability: boolean;
}) => {
  const buildLines = (label: string, outcome: AttackOutcome) => {
    const debug = outcome.debug;
    const rerollSummary = `Hit: ${debug.rerollHitLabel} | Wound: ${debug.rerollWoundLabel} | Armor: ${debug.rerollArmorLabel} | Ward: ${debug.rerollWardLabel}`;
    return [
      { label: `${label} final damage`, value: outcome.finalDamage },
      { label: `${label} successful hits`, value: outcome.successfulHits },
      { label: `${label} successful wounds`, value: outcome.successfulWounds },
      { label: `${label} poisoned wounds`, value: outcome.poisonedAutoWounds },
      { label: `${label} failed armor`, value: outcome.failedArmorSaves },
      { label: `${label} failed ward`, value: outcome.failedWardSaves },
      { label: `${label} hit target`, value: debug.hitTarget ? `${debug.hitTarget}+` : '-' },
      { label: `${label} base hit target`, value: debug.baseHitTarget ? `${debug.baseHitTarget}+` : '-' },
      { label: `${label} hit modifier +`, value: debug.hitModifierPositive },
      { label: `${label} hit modifier -`, value: debug.hitModifierNegative },
      { label: `${label} wound target`, value: debug.woundTarget ? `${debug.woundTarget}+` : '-' },
      { label: `${label} effective armor`, value: debug.effectiveArmorSave ? `${debug.effectiveArmorSave}+` : '-' },
      { label: `${label} poisoned`, value: debug.poisonedAttack ? 'Yes' : 'No' },
      { label: `${label} predatory count`, value: debug.predatoryCount },
      { label: `${label} predatory sixes`, value: debug.predatorySixes },
      { label: `${label} total attacks`, value: debug.totalAttacks },
      { label: `${label} non-poison hits`, value: debug.nonPoisonHits },
      { label: `${label} rerolls`, value: rerollSummary },
      { label: `${label} ASF bonus`, value: debug.asfBonusReroll ? 'Yes' : 'No' },
      { label: `${label} multiple wounds`, value: debug.multipleWoundsValue || '-' },
      { label: `${label} breath rolls`, value: debug.breathRolls?.join(', ') || '-' },
      { label: `${label} skipped`, value: debug.skipped ? 'Yes' : 'No' },
      ...(isProbability ? [
        { label: `${label} hit chance`, value: debug.hitChance?.toFixed(3) ?? '-' },
        { label: `${label} wound chance`, value: debug.woundChance?.toFixed(3) ?? '-' },
        { label: `${label} armor chance`, value: debug.armorSaveChance?.toFixed(3) ?? '-' },
        { label: `${label} ward chance`, value: debug.wardSaveChance?.toFixed(3) ?? '-' },
      ] : [
        { label: `${label} hit initial rolls`, value: debug.hitInitialRolls.join(', ') || '-' },
        { label: `${label} hit rerolls`, value: debug.hitRerollRolls.join(', ') || '-' },
        { label: `${label} hit rolls`, value: debug.hitRolls.join(', ') || '-' },
        { label: `${label} wound initial rolls`, value: debug.woundInitialRolls.join(', ') || '-' },
        { label: `${label} wound rerolls`, value: debug.woundRerollRolls.join(', ') || '-' },
        { label: `${label} wound rolls`, value: debug.woundRolls.join(', ') || '-' },
        { label: `${label} armor initial rolls`, value: debug.armorInitialRolls.join(', ') || '-' },
        { label: `${label} armor rerolls`, value: debug.armorRerollRolls.join(', ') || '-' },
        { label: `${label} armor rolls`, value: debug.armorRolls.join(', ') || '-' },
        { label: `${label} ward initial rolls`, value: debug.wardInitialRolls.join(', ') || '-' },
        { label: `${label} ward rerolls`, value: debug.wardRerollRolls.join(', ') || '-' },
        { label: `${label} ward rolls`, value: debug.wardRolls.join(', ') || '-' },
        { label: `${label} multiple wounds rolls`, value: debug.multipleWoundsRolls.join(', ') || '-' },
      ]),
    ];
  };

  return (
    <Card className="px-4 py-5 sm:px-6 sm:py-6">
      <h3 className="text-base font-semibold text-zinc-900">Round {round.round}</h3>
      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
        {round.orderLabel}
      </p>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="border-2 border-zinc-900 px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">Start wounds</p>
          <p className="mt-1 text-lg font-bold text-zinc-900">
            {challengerOneLabel}: {round.startWounds.one} | {challengerTwoLabel}: {round.startWounds.two}
          </p>
        </div>
        <div className="border-2 border-zinc-900 px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">End wounds</p>
          <p className="mt-1 text-lg font-bold text-zinc-900">
            {challengerOneLabel}: {round.endWounds.one} | {challengerTwoLabel}: {round.endWounds.two}
          </p>
        </div>
      </div>
      <div className="mt-4 border-2 border-zinc-900 px-3 py-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">Damage inflicted</p>
        <p className="mt-1 text-lg font-bold text-zinc-900">
          {challengerOneLabel}: {round.summary.oneDamage.toFixed(2)} | {challengerTwoLabel}: {round.summary.twoDamage.toFixed(2)}
        </p>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {round.actions.map((action, index) => (
          <DebugPanel
            key={`${round.round}-${index}`}
            title={action.label}
            lines={buildLines(action.label, action.outcome)}
          />
        ))}
      </div>
    </Card>
  );
};

export default function ChallengeSimulator({ onBack }: ChallengeSimulatorProps) {
  const [mode, setMode] = useState<'probability' | 'throw'>('probability');
  const [challengerOne, setChallengerOne] = useState<ChallengerState>(buildDefaultChallenger());
  const [challengerTwo, setChallengerTwo] = useState<ChallengerState>(buildDefaultChallenger());
  const [rounds, setRounds] = useState<RoundLog[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasResults, setHasResults] = useState(false);

  const parseChallenger = (challenger: ChallengerState): ParsedChallenger | null => {
    const rider = parseFighter(challenger);
    if (!rider) {
      return null;
    }
    const mount = challenger.mountType === 'none' ? null : parseFighter(challenger.mount);
    if (challenger.mountType !== 'none' && !mount) {
      return null;
    }

    const armorBonus = challenger.mountType === 'none' ? 0 : 1;
    const defenseAc = mount ? Math.max(rider.ac, mount.ac) : rider.ac;
    const defenseResistance = mount ? Math.max(rider.resistance, mount.resistance) : rider.resistance;
    const defenseWounds = mount
      ? (challenger.mountType === 'monster' ? rider.wounds : Math.max(rider.wounds, mount.wounds))
      : rider.wounds;
    const defenseArmorSave = Math.max(1, rider.armorSave - armorBonus);
    const mountBreathStrength = challenger.mountType === 'monster' && challenger.mountBreathWeapon
      ? Number.parseInt(challenger.mountBreathStrength, 10)
      : null;
    if (
      challenger.mountType === 'monster'
      && challenger.mountBreathWeapon
      && (!mountBreathStrength || Number.isNaN(mountBreathStrength) || mountBreathStrength <= 0)
    ) {
      return null;
    }

    return {
      rider,
      mount,
      mountType: challenger.mountType,
      mountBreathWeapon: challenger.mountBreathWeapon,
      mountBreathStrength,
      defense: {
        ac: defenseAc,
        resistance: defenseResistance,
        wounds: defenseWounds,
        armorSave: defenseArmorSave,
        wardSave: rider.wardSave,
        rerollArmor: rider.rerollArmor,
        rerollWard: rider.rerollWard,
      },
    };
  };

  const handleCalculate = () => {
    const parsedOne = parseChallenger(challengerOne);
    const parsedTwo = parseChallenger(challengerTwo);

    if (!parsedOne || !parsedTwo) {
      setErrorMessage('Devi inserire un risultato di dado');
      return;
    }

    setErrorMessage('');
    const nameOne = challengerOne.name.trim() || 'Challenger 1';
    const nameTwo = challengerTwo.name.trim() || 'Challenger 2';
    const mountOneTitle = parsedOne.mountType === 'none' ? '' : ` (${parsedOne.mountType})`;
    const mountTwoTitle = parsedTwo.mountType === 'none' ? '' : ` (${parsedTwo.mountType})`;
    const entries: FighterEntry[] = [
      {
        key: 'one-rider',
        label: nameOne,
        owner: 'one',
        fighter: parsedOne.rider,
        opponent: parsedTwo.rider,
        defender: parsedTwo.defense,
        attackType: 'normal',
      },
      {
        key: 'two-rider',
        label: nameTwo,
        owner: 'two',
        fighter: parsedTwo.rider,
        opponent: parsedOne.rider,
        defender: parsedOne.defense,
        attackType: 'normal',
      },
    ];
    if (parsedOne.mount) {
      entries.push({
        key: 'one-mount',
        label: `${nameOne} mount${mountOneTitle}`,
        owner: 'one',
        fighter: parsedOne.mount,
        opponent: parsedTwo.rider,
        defender: parsedTwo.defense,
        attackType: 'normal',
      });
    }
    if (parsedTwo.mount) {
      entries.push({
        key: 'two-mount',
        label: `${nameTwo} mount${mountTwoTitle}`,
        owner: 'two',
        fighter: parsedTwo.mount,
        opponent: parsedOne.rider,
        defender: parsedOne.defense,
        attackType: 'normal',
      });
    }

    const newRounds: RoundLog[] = [];
    let woundsOne = parsedOne.defense.wounds;
    let woundsTwo = parsedTwo.defense.wounds;
    let round = 1;

    let breathOneUsed = false;
    let breathTwoUsed = false;
    while (round <= MAX_ROUNDS && woundsOne > 0 && woundsTwo > 0) {
      const startWounds = { one: woundsOne, two: woundsTwo };
      const livingEntries = entries.filter((entry) => (
        entry.owner === 'one' ? woundsOne > 0 : woundsTwo > 0
      ));
      const orderCandidates = [...livingEntries];
      if (parsedOne.mountType === 'monster' && parsedOne.mountBreathWeapon && !breathOneUsed && parsedOne.mount) {
        orderCandidates.push({
          key: 'one-breath',
          label: `${nameOne} breath weapon`,
          owner: 'one',
          fighter: parsedOne.mount,
          opponent: parsedTwo.rider,
          defender: parsedTwo.defense,
          attackType: 'breath',
          breathStrength: parsedOne.mountBreathStrength ?? undefined,
        });
      }
      if (parsedTwo.mountType === 'monster' && parsedTwo.mountBreathWeapon && !breathTwoUsed && parsedTwo.mount) {
        orderCandidates.push({
          key: 'two-breath',
          label: `${nameTwo} breath weapon`,
          owner: 'two',
          fighter: parsedTwo.mount,
          opponent: parsedOne.rider,
          defender: parsedOne.defense,
          attackType: 'breath',
          breathStrength: parsedTwo.mountBreathStrength ?? undefined,
        });
      }

      const orderInfo = buildAttackOrder(orderCandidates);
      const actions: RoundAction[] = [];
      for (const group of orderInfo.groups) {
        if (woundsOne <= 0 || woundsTwo <= 0) {
          break;
        }
        let pendingDamageOne = 0;
        let pendingDamageTwo = 0;
        for (const entry of group) {
          if (entry.owner === 'one' && woundsOne <= 0) {
            continue;
          }
          if (entry.owner === 'two' && woundsTwo <= 0) {
            continue;
          }
          let outcome: AttackOutcome;
          if (entry.attackType === 'breath' && entry.breathStrength) {
            let hits = 7;
            let breathRolls: number[] = [];
            if (mode === 'throw') {
              const first = Math.floor(Math.random() * 6) + 1;
              const second = Math.floor(Math.random() * 6) + 1;
              breathRolls = [first, second];
              hits = first + second;
            }
            outcome = computeBreathAttack(entry.fighter, entry.defender, hits, entry.breathStrength, breathRolls);
            if (entry.owner === 'one') {
              breathOneUsed = true;
            } else {
              breathTwoUsed = true;
            }
          } else {
            const hitConfig = resolveHitRerollConfig(entry.fighter, entry.opponent);
            outcome = mode === 'probability'
              ? computeProbabilityAttack(entry.fighter, entry.defender, hitConfig)
              : computeThrowAttack(entry.fighter, entry.defender, hitConfig);
          }
          actions.push({
            label: `${entry.label} -> ${entry.owner === 'one' ? nameTwo : nameOne}`,
            sourceOwner: entry.owner,
            targetOwner: entry.owner === 'one' ? 'two' : 'one',
            outcome,
          });
          if (entry.owner === 'one') {
            pendingDamageTwo += outcome.finalDamage;
          } else {
            pendingDamageOne += outcome.finalDamage;
          }
        }
        if (pendingDamageOne) {
          woundsOne = parseFloat((woundsOne - pendingDamageOne).toFixed(2));
        }
        if (pendingDamageTwo) {
          woundsTwo = parseFloat((woundsTwo - pendingDamageTwo).toFixed(2));
        }
      }

      newRounds.push({
        round,
        orderLabel: orderInfo.label,
        startWounds,
        endWounds: { one: woundsOne, two: woundsTwo },
        actions,
        summary: {
          oneDamage: actions
            .filter((action) => action.sourceOwner === 'one')
            .reduce((sum, action) => sum + action.outcome.finalDamage, 0),
          twoDamage: actions
            .filter((action) => action.sourceOwner === 'two')
            .reduce((sum, action) => sum + action.outcome.finalDamage, 0),
        },
      });

      round += 1;
    }

    setRounds(newRounds);
    setHasResults(true);
  };

  const winnerLabel = useMemo(() => {
    if (!hasResults || rounds.length === 0) {
      return '-';
    }
    const lastRound = rounds[rounds.length - 1];
    const { one, two } = lastRound.endWounds;
    const nameOne = challengerOne.name.trim() || 'Challenger 1';
    const nameTwo = challengerTwo.name.trim() || 'Challenger 2';
    if (one <= 0 && two <= 0) {
      return 'Double KO';
    }
    if (one <= 0) {
      return nameTwo;
    }
    if (two <= 0) {
      return nameOne;
    }
    return 'No winner';
  }, [hasResults, rounds, challengerOne.name, challengerTwo.name]);

  return (
    <Card className="px-4 py-5 sm:px-6 sm:py-6">
      <CardHeader
        title="Challenge simulator"
        onBack={onBack}
        backLabel="Back to phases"
        rightSlot={<ModeSwitch mode={mode} onModeChange={setMode} />}
      />

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <ChallengerForm
          title="Challenger 1"
          challenger={challengerOne}
          onChange={setChallengerOne}
        />
        <ChallengerForm
          title="Challenger 2"
          challenger={challengerTwo}
          onChange={setChallengerTwo}
        />
      </div>

      <ActionBar className="mt-6">
        <Button type="button" onClick={handleCalculate} fullWidth size="lg">
          Calculate
        </Button>
      </ActionBar>

      {errorMessage ? (
        <p className="mt-4 border-2 border-zinc-900 bg-zinc-100 px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-zinc-700">
          {errorMessage}
        </p>
      ) : null}

      {hasResults ? (
        <div className="mt-6 space-y-5">
          <Card className="px-4 py-5 sm:px-6 sm:py-6">
            <h3 className="text-base font-semibold text-zinc-900">Summary</h3>
            <p className="mt-2 text-sm text-zinc-600">
              Challenger 1: {challengerOne.name.trim() || 'Challenger 1'}
            </p>
            <p className="mt-1 text-sm text-zinc-600">
              Challenger 2: {challengerTwo.name.trim() || 'Challenger 2'}
            </p>
            <p className="mt-2 text-sm text-zinc-600">Winner: {winnerLabel}</p>
            <p className="mt-1 text-sm text-zinc-600">Rounds played: {rounds.length}</p>
          </Card>
          {rounds.map((round) => (
            <RoundDetails
              key={`round-${round.round}`}
              round={round}
              challengerOneLabel={challengerOne.name.trim() || 'Challenger 1'}
              challengerTwoLabel={challengerTwo.name.trim() || 'Challenger 2'}
              isProbability={mode === 'probability'}
            />
          ))}
        </div>
      ) : null}
    </Card>
  );
}
