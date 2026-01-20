import { useMemo, useState } from 'react';
import Card from '@/components/ui/Card';
import InputField from '@/components/ui/InputField';
import ModeSwitch from '@/components/calculator/ModeSwitch';
import ReRollOptions, { type RerollConfig } from '@/components/calculator/ReRollOptions';
import DebugPanel from '@/components/ui/DebugPanel';
import {
  applyRerollWithDebug,
  getFaceProbabilitiesWithReroll,
  getHitTarget,
  getWoundTarget,
} from '@/lib/roll-utils';

const MAX_ROUNDS = 50;

type ChallengerState = {
  ac: string;
  strength: string;
  resistance: string;
  wounds: string;
  initiative: string;
  attacks: string;
  armorSave: string;
  wardSave: string;
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

type ParsedMultipleWounds = {
  type: 'fixed' | 'dice';
  value?: number;
  sides?: number;
};

type ParsedChallenger = {
  ac: number;
  strength: number;
  resistance: number;
  wounds: number;
  initiative: number;
  attacks: number;
  armorSave: number;
  wardSave: number;
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

type AttackDebug = {
  hitTarget: number;
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

type RoundLog = {
  round: number;
  orderLabel: string;
  startWounds: { one: number; two: number };
  endWounds: { one: number; two: number };
  challengerOne: AttackOutcome;
  challengerTwo: AttackOutcome;
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

const buildDefaultChallenger = (): ChallengerState => ({
  ac: '4',
  strength: '3',
  resistance: '3',
  wounds: '3',
  initiative: '3',
  attacks: '1',
  armorSave: '4',
  wardSave: '0',
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

const resolveHitRerollConfig = (
  attacker: ParsedChallenger,
  defender: ParsedChallenger,
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

const resolveOrder = (
  challengerOne: ParsedChallenger,
  challengerTwo: ParsedChallenger,
): { order: 'one' | 'two' | 'simultaneous'; label: string } => {
  const oneASF = challengerOne.alwaysStrikeFirst;
  const twoASF = challengerTwo.alwaysStrikeFirst;
  const oneASL = challengerOne.alwaysStrikeLast;
  const twoASL = challengerTwo.alwaysStrikeLast;

  if ((oneASF && twoASF) || (oneASL && twoASL)) {
    return { order: 'simultaneous', label: 'Same strike rule' };
  }
  if (oneASF && twoASL) {
    return { order: 'one', label: 'Challenger 1 strikes first (ASF vs ASL)' };
  }
  if (twoASF && oneASL) {
    return { order: 'two', label: 'Challenger 2 strikes first (ASF vs ASL)' };
  }
  if (oneASF && !twoASF) {
    return { order: 'one', label: 'Challenger 1 strikes first (ASF)' };
  }
  if (twoASF && !oneASF) {
    return { order: 'two', label: 'Challenger 2 strikes first (ASF)' };
  }
  if (oneASL && !twoASL) {
    return { order: 'two', label: 'Challenger 2 strikes first (ASL)' };
  }
  if (twoASL && !oneASL) {
    return { order: 'one', label: 'Challenger 1 strikes first (ASL)' };
  }
  if (challengerOne.initiative === challengerTwo.initiative) {
    return { order: 'simultaneous', label: 'Same initiative' };
  }
  if (challengerOne.initiative > challengerTwo.initiative) {
    return { order: 'one', label: 'Challenger 1 strikes first (initiative)' };
  }
  return { order: 'two', label: 'Challenger 2 strikes first (initiative)' };
};

const buildSkippedOutcome = (multipleWoundsValue: string): AttackOutcome => ({
  successfulHits: 0,
  successfulWounds: 0,
  poisonedAutoWounds: 0,
  failedArmorSaves: 0,
  failedWardSaves: 0,
  finalDamage: 0,
  debug: {
    hitTarget: 0,
    woundTarget: 0,
    effectiveArmorSave: 0,
    poisonedAttack: false,
    predatoryCount: 0,
    predatorySixes: 0,
    totalAttacks: 0,
    poisonedAutoWounds: 0,
    nonPoisonHits: 0,
    rerollHitLabel: 'Off',
    rerollWoundLabel: 'Off',
    rerollArmorLabel: 'Off',
    rerollWardLabel: 'Off',
    asfBonusReroll: false,
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
    multipleWoundsValue,
    multipleWoundsRolls: [],
    skipped: true,
  },
});

const computeProbabilityAttack = (
  attacker: ParsedChallenger,
  defender: ParsedChallenger,
  asfBonus: { config: RerollConfig; asfBonus: boolean },
): AttackOutcome => {
  const hitTarget = getHitTarget(attacker.ac, defender.ac);
  const woundTarget = getWoundTarget(attacker.strength, defender.resistance);
  const hitProbabilities = getFaceProbabilitiesWithReroll(hitTarget, asfBonus.config);
  const poisonedAutoWoundChance = attacker.poisonedAttack ? hitProbabilities.sixChance : 0;
  const nonPoisonHitChance = attacker.poisonedAttack
    ? Math.max(0, hitProbabilities.successChance - hitProbabilities.sixChance)
    : hitProbabilities.successChance;
  const cappedPredatory = Math.min(attacker.predatoryFighterCount, attacker.attacks);
  const extraAttacks = cappedPredatory * hitProbabilities.sixChance;
  const totalAttacks = attacker.attacks + extraAttacks;
  const woundChance = getFaceProbabilitiesWithReroll(woundTarget, attacker.rerollWound).successChance;
  const armorSaveModifier = attacker.strength - 3;
  const effectiveArmorSave = defender.armorSave + armorSaveModifier;
  const armorSaveChance = effectiveArmorSave > 1
    ? getFaceProbabilitiesWithReroll(effectiveArmorSave, attacker.rerollArmor).successChance
    : 0;
  const wardSaveChance = defender.wardSave > 1
    ? getFaceProbabilitiesWithReroll(defender.wardSave, attacker.rerollWard).successChance
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
      woundTarget,
      effectiveArmorSave,
      poisonedAttack: attacker.poisonedAttack,
      predatoryCount: cappedPredatory,
      predatorySixes: parseFloat((extraAttacks || 0).toFixed(2)),
      totalAttacks: parseFloat(totalAttacks.toFixed(2)),
      poisonedAutoWounds: parseFloat(poisonedAutoWounds.toFixed(2)),
      nonPoisonHits: parseFloat(hitsToWound.toFixed(2)),
      rerollHitLabel: formatRerollLabel(asfBonus.config),
      rerollWoundLabel: formatRerollLabel(attacker.rerollWound),
      rerollArmorLabel: formatRerollLabel(attacker.rerollArmor),
      rerollWardLabel: formatRerollLabel(attacker.rerollWard),
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
  attacker: ParsedChallenger,
  defender: ParsedChallenger,
  asfBonus: { config: RerollConfig; asfBonus: boolean },
): AttackOutcome => {
  const hitTarget = getHitTarget(attacker.ac, defender.ac);
  const hitInitialRolls = Array.from({ length: attacker.attacks }, () => Math.floor(Math.random() * 6) + 1);
  const hitRerollResult = applyRerollWithDebug(hitInitialRolls, hitTarget, asfBonus.config);
  const hitRolls = hitRerollResult.finalRolls;
  const predatoryCount = Math.min(attacker.predatoryFighterCount, attacker.attacks);
  const predatorySixes = predatoryCount
    ? hitRolls.slice(0, predatoryCount).filter((roll) => roll === 6).length
    : 0;
  let extraHitInitialRolls: number[] = [];
  let extraHitRerolls: number[] = [];
  let extraHitRolls: number[] = [];
  if (predatorySixes > 0) {
    extraHitInitialRolls = Array.from({ length: predatorySixes }, () => Math.floor(Math.random() * 6) + 1);
    const extraHitRerollResult = applyRerollWithDebug(extraHitInitialRolls, hitTarget, asfBonus.config);
    extraHitRerolls = extraHitRerollResult.rerollRolls;
    extraHitRolls = extraHitRerollResult.finalRolls;
  }
  const combinedHitInitialRolls = hitInitialRolls.concat(extraHitInitialRolls);
  const combinedHitRerollRolls = hitRerollResult.rerollRolls.concat(extraHitRerolls);
  const combinedHitRolls = hitRolls.concat(extraHitRolls);
  const totalAttacks = attacker.attacks + predatorySixes;
  const poisonedAutoWounds = attacker.poisonedAttack
    ? combinedHitRolls.filter((roll) => roll === 6).length
    : 0;
  const nonPoisonHits = attacker.poisonedAttack
    ? combinedHitRolls.filter((roll) => roll >= hitTarget && roll !== 6).length
    : combinedHitRolls.filter((roll) => roll >= hitTarget).length;
  const hitSuccesses = poisonedAutoWounds + nonPoisonHits;

  const woundTarget = getWoundTarget(attacker.strength, defender.resistance);
  const woundInitialRolls = Array.from({ length: nonPoisonHits }, () => Math.floor(Math.random() * 6) + 1);
  const woundRerollResult = applyRerollWithDebug(woundInitialRolls, woundTarget, attacker.rerollWound);
  const woundRolls = woundRerollResult.finalRolls;
  const woundSuccesses = woundRolls.filter((roll) => roll >= woundTarget).length;
  const totalWounds = attacker.poisonedAttack
    ? poisonedAutoWounds + woundSuccesses
    : woundSuccesses;

  const effectiveArmorSave = defender.armorSave + (attacker.strength - 3);
  let failedArmorSaves = totalWounds;
  let armorRolls: number[] = [];
  let armorInitialRolls: number[] = [];
  let armorRerollRolls: number[] = [];
  if (effectiveArmorSave > 1 && effectiveArmorSave <= 6) {
    armorInitialRolls = Array.from({ length: totalWounds }, () => Math.floor(Math.random() * 6) + 1);
    const armorRerollResult = applyRerollWithDebug(armorInitialRolls, effectiveArmorSave, attacker.rerollArmor);
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
    const wardRerollResult = applyRerollWithDebug(wardInitialRolls, defender.wardSave, attacker.rerollWard);
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
      woundTarget,
      effectiveArmorSave,
      poisonedAttack: attacker.poisonedAttack,
      predatoryCount,
      predatorySixes,
      totalAttacks,
      poisonedAutoWounds,
      nonPoisonHits,
      rerollHitLabel: formatRerollLabel(asfBonus.config),
      rerollWoundLabel: formatRerollLabel(attacker.rerollWound),
      rerollArmorLabel: formatRerollLabel(attacker.rerollArmor),
      rerollWardLabel: formatRerollLabel(attacker.rerollWard),
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

const ChallengerForm = ({
  title,
  challenger,
  onChange,
}: {
  title: string;
  challenger: ChallengerState;
  onChange: (next: ChallengerState) => void;
}) => {
  const multipleWoundsValue = challenger.multipleWoundsValue.trim();
  const multipleWoundsInvalid = challenger.multipleWoundsEnabled && multipleWoundsValue !== '' && (() => {
    if (multipleWoundsValue.toLowerCase().startsWith('d')) {
      const sides = Number.parseInt(multipleWoundsValue.slice(1), 10);
      return Number.isNaN(sides) || sides < 2;
    }
    const fixed = Number.parseInt(multipleWoundsValue, 10);
    return Number.isNaN(fixed) || fixed <= 0;
  })();

  return (
    <Card className="px-4 py-5 sm:px-6 sm:py-6">
      <h3 className="text-base font-semibold text-zinc-900">{title}</h3>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
        <InputField
          id={`${title}-ac`}
          label="AC"
          value={challenger.ac}
          min="1"
          onChange={(value) => onChange({ ...challenger, ac: value })}
        />
        <InputField
          id={`${title}-strength`}
          label="Strength"
          value={challenger.strength}
          min="1"
          onChange={(value) => onChange({ ...challenger, strength: value })}
        />
        <InputField
          id={`${title}-resistance`}
          label="Resistance"
          value={challenger.resistance}
          min="1"
          onChange={(value) => onChange({ ...challenger, resistance: value })}
        />
        <InputField
          id={`${title}-wounds`}
          label="Wounds"
          value={challenger.wounds}
          min="1"
          onChange={(value) => onChange({ ...challenger, wounds: value })}
        />
        <InputField
          id={`${title}-initiative`}
          label="Initiative"
          value={challenger.initiative}
          min="1"
          onChange={(value) => onChange({ ...challenger, initiative: value })}
        />
        <InputField
          id={`${title}-attacks`}
          label="Attacks"
          value={challenger.attacks}
          min="1"
          onChange={(value) => onChange({ ...challenger, attacks: value })}
        />
        <InputField
          id={`${title}-armor`}
          label="Armor Save (X+)"
          value={challenger.armorSave}
          min="1"
          max="7"
          onChange={(value) => onChange({ ...challenger, armorSave: value })}
        />
        <InputField
          id={`${title}-ward`}
          label="Ward Save (X+)"
          value={challenger.wardSave}
          min="0"
          max="7"
          placeholder="Leave empty if none"
          onChange={(value) => onChange({ ...challenger, wardSave: value })}
        />
      </div>

      <div className="mt-5 space-y-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-700">Special rules</p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
              <input
                type="checkbox"
                checked={challenger.poisonedAttack}
                onChange={(e) => onChange({ ...challenger, poisonedAttack: e.target.checked })}
                className="h-4 w-4 border-2 border-zinc-900"
              />
              Poisoned Attack
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
              <input
                type="checkbox"
                checked={challenger.predatoryFighter}
                onChange={(e) => onChange({ ...challenger, predatoryFighter: e.target.checked })}
                className="h-4 w-4 border-2 border-zinc-900"
              />
              Predatory fighter
            </label>
            {challenger.predatoryFighter ? (
              <InputField
                id={`${title}-predatory-count`}
                label="Predatory fighter count"
                value={challenger.predatoryFighterCount}
                min="0"
                onChange={(value) => onChange({ ...challenger, predatoryFighterCount: value })}
              />
            ) : null}
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
              <input
                type="checkbox"
                checked={challenger.alwaysStrikeFirst}
                onChange={(e) => onChange({ ...challenger, alwaysStrikeFirst: e.target.checked })}
                className="h-4 w-4 border-2 border-zinc-900"
              />
              Always strike first
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
              <input
                type="checkbox"
                checked={challenger.alwaysStrikeLast}
                onChange={(e) => onChange({ ...challenger, alwaysStrikeLast: e.target.checked })}
                className="h-4 w-4 border-2 border-zinc-900"
              />
              Always strike last
            </label>
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-700">Multiple wounds</p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
              <input
                type="checkbox"
                checked={challenger.multipleWoundsEnabled}
                onChange={(e) => onChange({ ...challenger, multipleWoundsEnabled: e.target.checked })}
                className="h-4 w-4 border-2 border-zinc-900"
              />
              Enable multiple wounds
            </label>
            {challenger.multipleWoundsEnabled ? (
              <InputField
                id={`${title}-multiple-wounds`}
                label="Multiple wounds value"
                value={challenger.multipleWoundsValue}
                type="text"
                pattern="^(?:[dD]\\d+|\\d+)$"
                title="Use a number or dX (e.g. 2 or d6)"
                placeholder="Value or dX (e.g. 2 or d6)"
                onChange={(value) => onChange({ ...challenger, multipleWoundsValue: value })}
              />
            ) : null}
            {multipleWoundsInvalid ? (
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-600">
                Use a number (e.g. 2) or dX (e.g. d6).
              </p>
            ) : null}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-700">Re-rolls</p>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">Re-roll to hit</p>
              <div className="mt-2">
                <ReRollOptions
                  config={challenger.rerollHit}
                  onChange={(config) => onChange({ ...challenger, rerollHit: config })}
                />
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">Re-roll to wound</p>
              <div className="mt-2">
                <ReRollOptions
                  config={challenger.rerollWound}
                  onChange={(config) => onChange({ ...challenger, rerollWound: config })}
                />
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">Re-roll armor</p>
              <div className="mt-2">
                <ReRollOptions
                  config={challenger.rerollArmor}
                  onChange={(config) => onChange({ ...challenger, rerollArmor: config })}
                />
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">Re-roll ward</p>
              <div className="mt-2">
                <ReRollOptions
                  config={challenger.rerollWard}
                  onChange={(config) => onChange({ ...challenger, rerollWard: config })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
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
    return [
      { label: `${label} final damage`, value: outcome.finalDamage },
      { label: `${label} successful hits`, value: outcome.successfulHits },
      { label: `${label} successful wounds`, value: outcome.successfulWounds },
      { label: `${label} poisoned wounds`, value: outcome.poisonedAutoWounds },
      { label: `${label} failed armor`, value: outcome.failedArmorSaves },
      { label: `${label} failed ward`, value: outcome.failedWardSaves },
      { label: `${label} hit target`, value: debug.hitTarget ? `${debug.hitTarget}+` : '-' },
      { label: `${label} wound target`, value: debug.woundTarget ? `${debug.woundTarget}+` : '-' },
      { label: `${label} effective armor`, value: debug.effectiveArmorSave ? `${debug.effectiveArmorSave}+` : '-' },
      { label: `${label} poisoned`, value: debug.poisonedAttack ? 'Yes' : 'No' },
      { label: `${label} predatory count`, value: debug.predatoryCount },
      { label: `${label} predatory sixes`, value: debug.predatorySixes },
      { label: `${label} total attacks`, value: debug.totalAttacks },
      { label: `${label} non-poison hits`, value: debug.nonPoisonHits },
      { label: `${label} reroll hit`, value: debug.rerollHitLabel },
      { label: `${label} reroll wound`, value: debug.rerollWoundLabel },
      { label: `${label} reroll armor`, value: debug.rerollArmorLabel },
      { label: `${label} reroll ward`, value: debug.rerollWardLabel },
      { label: `${label} ASF bonus`, value: debug.asfBonusReroll ? 'Yes' : 'No' },
      { label: `${label} multiple wounds`, value: debug.multipleWoundsValue || '-' },
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
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DebugPanel
          title={`${challengerOneLabel} debug`}
          lines={buildLines(challengerOneLabel, round.challengerOne)}
        />
        <DebugPanel
          title={`${challengerTwoLabel} debug`}
          lines={buildLines(challengerTwoLabel, round.challengerTwo)}
        />
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
    const wardSaveValue = challenger.wardSave.trim() === '' ? '0' : challenger.wardSave;
    const parsed = {
      ac: Number.parseInt(challenger.ac, 10),
      strength: Number.parseInt(challenger.strength, 10),
      resistance: Number.parseInt(challenger.resistance, 10),
      wounds: Number.parseInt(challenger.wounds, 10),
      initiative: Number.parseInt(challenger.initiative, 10),
      attacks: Number.parseInt(challenger.attacks, 10),
      armorSave: Number.parseInt(challenger.armorSave, 10),
      wardSave: Number.parseInt(wardSaveValue, 10),
      predatoryFighterCount: challenger.predatoryFighter
        ? Number.parseInt(challenger.predatoryFighterCount, 10)
        : 0,
    };
    const multipleWounds = challenger.multipleWoundsEnabled
      ? parseMultipleWoundsValue(challenger.multipleWoundsValue)
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
      || Number.isNaN(parsed.predatoryFighterCount)
      || parsed.predatoryFighterCount < 0
      || (challenger.multipleWoundsEnabled && !multipleWounds)
    ) {
      return null;
    }

    return {
      ...parsed,
      poisonedAttack: challenger.poisonedAttack,
      predatoryFighterCount: Math.min(parsed.predatoryFighterCount, parsed.attacks),
      multipleWounds,
      alwaysStrikeFirst: challenger.alwaysStrikeFirst,
      alwaysStrikeLast: challenger.alwaysStrikeLast,
      rerollHit: challenger.rerollHit,
      rerollWound: challenger.rerollWound,
      rerollArmor: challenger.rerollArmor,
      rerollWard: challenger.rerollWard,
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
    const newRounds: RoundLog[] = [];
    let woundsOne = parsedOne.wounds;
    let woundsTwo = parsedTwo.wounds;
    let round = 1;
    const orderInfo = resolveOrder(parsedOne, parsedTwo);

    while (round <= MAX_ROUNDS && woundsOne > 0 && woundsTwo > 0) {
      const startWounds = { one: woundsOne, two: woundsTwo };
      let outcomeOne: AttackOutcome = buildSkippedOutcome(
        challengerOne.multipleWoundsEnabled ? challengerOne.multipleWoundsValue : '',
      );
      let outcomeTwo: AttackOutcome = buildSkippedOutcome(
        challengerTwo.multipleWoundsEnabled ? challengerTwo.multipleWoundsValue : '',
      );

      if (orderInfo.order === 'simultaneous') {
        const hitConfigOne = resolveHitRerollConfig(parsedOne, parsedTwo);
        const hitConfigTwo = resolveHitRerollConfig(parsedTwo, parsedOne);
        outcomeOne = mode === 'probability'
          ? computeProbabilityAttack(parsedOne, parsedTwo, hitConfigOne)
          : computeThrowAttack(parsedOne, parsedTwo, hitConfigOne);
        outcomeTwo = mode === 'probability'
          ? computeProbabilityAttack(parsedTwo, parsedOne, hitConfigTwo)
          : computeThrowAttack(parsedTwo, parsedOne, hitConfigTwo);
        woundsTwo = parseFloat((woundsTwo - outcomeOne.finalDamage).toFixed(2));
        woundsOne = parseFloat((woundsOne - outcomeTwo.finalDamage).toFixed(2));
      } else if (orderInfo.order === 'one') {
        const hitConfigOne = resolveHitRerollConfig(parsedOne, parsedTwo);
        outcomeOne = mode === 'probability'
          ? computeProbabilityAttack(parsedOne, parsedTwo, hitConfigOne)
          : computeThrowAttack(parsedOne, parsedTwo, hitConfigOne);
        woundsTwo = parseFloat((woundsTwo - outcomeOne.finalDamage).toFixed(2));
        if (woundsTwo > 0) {
          const hitConfigTwo = resolveHitRerollConfig(parsedTwo, parsedOne);
          outcomeTwo = mode === 'probability'
            ? computeProbabilityAttack(parsedTwo, parsedOne, hitConfigTwo)
            : computeThrowAttack(parsedTwo, parsedOne, hitConfigTwo);
          woundsOne = parseFloat((woundsOne - outcomeTwo.finalDamage).toFixed(2));
        }
      } else {
        const hitConfigTwo = resolveHitRerollConfig(parsedTwo, parsedOne);
        outcomeTwo = mode === 'probability'
          ? computeProbabilityAttack(parsedTwo, parsedOne, hitConfigTwo)
          : computeThrowAttack(parsedTwo, parsedOne, hitConfigTwo);
        woundsOne = parseFloat((woundsOne - outcomeTwo.finalDamage).toFixed(2));
        if (woundsOne > 0) {
          const hitConfigOne = resolveHitRerollConfig(parsedOne, parsedTwo);
          outcomeOne = mode === 'probability'
            ? computeProbabilityAttack(parsedOne, parsedTwo, hitConfigOne)
            : computeThrowAttack(parsedOne, parsedTwo, hitConfigOne);
          woundsTwo = parseFloat((woundsTwo - outcomeOne.finalDamage).toFixed(2));
        }
      }

      newRounds.push({
        round,
        orderLabel: orderInfo.label,
        startWounds,
        endWounds: { one: woundsOne, two: woundsTwo },
        challengerOne: outcomeOne,
        challengerTwo: outcomeTwo,
      });

      if (outcomeOne.finalDamage === 0 && outcomeTwo.finalDamage === 0) {
        setErrorMessage('No damage dealt. Duel cannot resolve.');
        break;
      }

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
    if (one <= 0 && two <= 0) {
      return 'Double KO';
    }
    if (one <= 0) {
      return 'Challenger 2';
    }
    if (two <= 0) {
      return 'Challenger 1';
    }
    return 'No winner';
  }, [hasResults, rounds]);

  return (
    <Card className="px-4 py-5 sm:px-6 sm:py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">Challenge simulator</h2>
          <button
            type="button"
            onClick={onBack}
            className="mt-2 border-2 border-zinc-900 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors hover:bg-zinc-900 hover:text-white"
          >
            Back to phases
          </button>
        </div>
        <ModeSwitch mode={mode} onModeChange={setMode} />
      </div>

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

      <button
        type="button"
        onClick={handleCalculate}
        className="mt-6 w-full border-2 border-zinc-900 py-3 text-base font-semibold uppercase tracking-[0.2em] transition-colors hover:bg-zinc-900 hover:text-white"
      >
        Calculate
      </button>

      {errorMessage ? (
        <p className="mt-4 border-2 border-zinc-900 bg-zinc-100 px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-zinc-700">
          {errorMessage}
        </p>
      ) : null}

      {hasResults ? (
        <div className="mt-6 space-y-5">
          <Card className="px-4 py-5 sm:px-6 sm:py-6">
            <h3 className="text-base font-semibold text-zinc-900">Summary</h3>
            <p className="mt-2 text-sm text-zinc-600">Winner: {winnerLabel}</p>
            <p className="mt-1 text-sm text-zinc-600">Rounds played: {rounds.length}</p>
          </Card>
          {rounds.map((round) => (
            <RoundDetails
              key={`round-${round.round}`}
              round={round}
              challengerOneLabel="Challenger 1"
              challengerTwoLabel="Challenger 2"
              isProbability={mode === 'probability'}
            />
          ))}
        </div>
      ) : null}
    </Card>
  );
}
