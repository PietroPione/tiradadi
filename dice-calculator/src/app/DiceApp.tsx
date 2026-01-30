"use client";

import { useState } from 'react';
import CalculatorHeader from '@/components/calculator/CalculatorHeader';
import BreakMoraleCheck from '@/components/calculator/BreakMoraleCheck';
import GeneralThrowCalculator from '@/components/calculator/GeneralThrowCalculator';
import ProbabilityCalculator from '@/components/calculator/ProbabilityCalculator';
import ShootingPhaseCalculator from '@/components/calculator/ShootingPhaseCalculator';
import ThrowDiceCalculator from '@/components/calculator/ThrowDiceCalculator';
import ChallengeSimulator from '@/components/calculator/ChallengeSimulator';
import CombatCompareRange from '@/components/calculator/CombatCompareRange';
import Hh2CombatPhaseCalculator from '@/components/calculator/Hh2CombatPhaseCalculator';
import type { ProbabilityResults } from '@/components/calculator/ProbabilityResultsCard';
import type { RerollConfig } from '@/components/calculator/ReRollOptions';
import PhaseSelector from '@/components/navigation/PhaseSelector';
import SystemSelector from '@/components/navigation/SystemSelector';
import ModeSelector from '@/components/navigation/ModeSelector';
import ProbabilityTypeSelector from '@/components/navigation/ProbabilityTypeSelector';
import { calculateAverages, type RerollConfig as DiceRerollConfig } from '@/lib/games/wfb8/dice-calculator';
import TrechGenericRollCalculator from '@/components/calculator/TrechGenericRollCalculator';
import TrechInjuryRollCalculator from '@/components/calculator/TrechInjuryRollCalculator';
import TrechGenericProbabilityCalculator from '@/components/calculator/TrechGenericProbabilityCalculator';
import TrechInjuryProbabilityCalculator from '@/components/calculator/TrechInjuryProbabilityCalculator';
import TrechGenericCompareRange from '@/components/calculator/TrechGenericCompareRange';
import TrechInjuryCompareRange from '@/components/calculator/TrechInjuryCompareRange';
import {
  applyRerollWithDebug,
  getFaceProbabilitiesWithReroll,
  getHitTarget,
  getShootingSuccessChanceWithReroll,
  getWoundTarget,
  parseSpecificValues,
  shouldRerollValue,
} from '@/lib/games/wfb8/roll-utils';
import {
  calculateTrechGenericProbability,
  calculateTrechGenericRoll,
  calculateTrechInjuryProbability,
  calculateTrechInjuryRoll,
} from '@/lib/games/trech/trech-utils';
import {
  getHh2HitProfile,
  getHh2HitSuccessChance,
  getHh2WoundProfile,
  rollHh2Hit,
} from '@/lib/games/hh2/shooting-utils';

type GameSystem = 'wfb8' | 'trech' | 'hh2';
type Phase = 'general' | 'shooting' | 'combat' | 'morale' | 'challenge' | 'tc-generic' | 'tc-injury';
type RerollState = RerollConfig;

export default function DiceApp() {
  const [diceCount, setDiceCount] = useState('10');
  const [appMode, setAppMode] = useState<'probability' | 'throw' | null>(null);
  const [appProbabilityMode, setAppProbabilityMode] = useState<'single' | 'range' | null>(null);
  const [attackersAc, setAttackersAc] = useState('1');
  const [defendersAc, setDefendersAc] = useState('1');
  const [throwHitStrength, setThrowHitStrength] = useState('3');
  const [targetToughness, setTargetToughness] = useState('3');
  const [throwArmorSave, setThrowArmorSave] = useState('4');
  const [throwWardSave, setThrowWardSave] = useState('0');
  const [hitValue, setHitValue] = useState('4');
  const [poisonedAttack, setPoisonedAttack] = useState(false);
  const [predatoryFighter, setPredatoryFighter] = useState(false);
  const [predatoryFighterCount, setPredatoryFighterCount] = useState('0');
  const [multipleWoundsEnabled, setMultipleWoundsEnabled] = useState(false);
  const [multipleWoundsValue, setMultipleWoundsValue] = useState('');
  const [hitStrength, setHitStrength] = useState('3');
  const [woundValue, setWoundValue] = useState('4');
  const [armorSave, setArmorSave] = useState('4');
  const [wardSave, setWardSave] = useState('0');
  const [errorMessage, setErrorMessage] = useState('');
  const [gameSystem, setGameSystem] = useState<GameSystem | null>(null);
  const [phase, setPhase] = useState<Phase | null>(null);
  const [generalProbabilityMode, setGeneralProbabilityMode] = useState<'single' | 'range' | null>(null);
  const [generalDiceCount, setGeneralDiceCount] = useState('10');
  const [generalObjective, setGeneralObjective] = useState<'target' | 'total'>('target');
  const [generalTargetValue, setGeneralTargetValue] = useState('3');
  const [generalAverageResults, setGeneralAverageResults] = useState({
    averageSuccesses: 0,
    successChance: 0,
    averageTotal: 0,
  });
  const [generalThrowResults, setGeneralThrowResults] = useState({
    successes: 0,
    rolls: [] as number[],
    total: 0,
  });
  const [generalErrorMessage, setGeneralErrorMessage] = useState('');
  const [hasGeneralAverageResults, setHasGeneralAverageResults] = useState(false);
  const [hasGeneralThrowResults, setHasGeneralThrowResults] = useState(false);
  const [generalReroll, setGeneralReroll] = useState<RerollState>({
    enabled: false,
    mode: 'failed',
    scope: 'all',
    specificValues: '',
  });
  const [ballisticSkill, setBallisticSkill] = useState('3');
  const [shootingModifiers, setShootingModifiers] = useState({
    longRange: false,
    movement: false,
    skirmisherTarget: false,
    lightCover: false,
    hardCover: false,
  });
  const [shootingPoisonedAttack, setShootingPoisonedAttack] = useState(false);
  const [shootingAutoHit, setShootingAutoHit] = useState(false);
  const [shootingNightFighting, setShootingNightFighting] = useState(false);
  const [shootingTargetType, setShootingTargetType] = useState<'living' | 'vehicle'>('living');
  const [shootingTargetWounds, setShootingTargetWounds] = useState('1');
  const [shootingTargetArmorValue, setShootingTargetArmorValue] = useState('12');
  const [shootingLance, setShootingLance] = useState(false);
  const [shootingMelta, setShootingMelta] = useState(false);
  const [shootingInstantDeath, setShootingInstantDeath] = useState(false);
  const [shootingAtomanticShield, setShootingAtomanticShield] = useState(false);
  const [shootingMultipleWoundsEnabled, setShootingMultipleWoundsEnabled] = useState(false);
  const [shootingMultipleWoundsValue, setShootingMultipleWoundsValue] = useState('');
  const [shootingDamageMitigationRoll, setShootingDamageMitigationRoll] = useState('');
  const [shootingDamageMitigationType, setShootingDamageMitigationType] = useState<'feelNoPain' | 'shrouded' | 'other'>('feelNoPain');
  const [shootingNoCover, setShootingNoCover] = useState(false);
  const [shootingProbabilityMode, setShootingProbabilityMode] = useState<'single' | 'range' | null>(null);
  const [shootingDiceCount, setShootingDiceCount] = useState('10');
  const [shootingHitStrength, setShootingHitStrength] = useState('3');
  const [shootingTargetToughness, setShootingTargetToughness] = useState('3');
  const [shootingArmorPenetration, setShootingArmorPenetration] = useState('');
  const [shootingWoundValue, setShootingWoundValue] = useState('4');
  const [shootingArmorSave, setShootingArmorSave] = useState('4');
  const [shootingWardSave, setShootingWardSave] = useState('0');
  const [shootingDeflagrate, setShootingDeflagrate] = useState(false);
  const [shootingBreachingEnabled, setShootingBreachingEnabled] = useState(false);
  const [shootingBreachingValue, setShootingBreachingValue] = useState('');
  const [shootingRendingEnabled, setShootingRendingEnabled] = useState(false);
  const [shootingRendingValue, setShootingRendingValue] = useState('');
  const [shootingMurderousEnabled, setShootingMurderousEnabled] = useState(false);
  const [shootingMurderousValue, setShootingMurderousValue] = useState('');
  const [shootingProbabilityResults, setShootingProbabilityResults] = useState<ProbabilityResults>({
    successfulHits: 0,
    successfulWounds: 0,
    poisonedAutoWounds: 0,
    failedArmorSaves: 0,
    failedWardSaves: 0,
    finalDamage: 0,
  });
  const [shootingThrowResults, setShootingThrowResults] = useState<ProbabilityResults>({
    successfulHits: 0,
    successfulWounds: 0,
    poisonedAutoWounds: 0,
    failedArmorSaves: 0,
    failedWardSaves: 0,
    finalDamage: 0,
  });
  const [shootingErrorMessage, setShootingErrorMessage] = useState('');
  const [hasShootingProbabilityResults, setHasShootingProbabilityResults] = useState(false);
  const [hasShootingThrowResults, setHasShootingThrowResults] = useState(false);
  const [shootingRerollHit, setShootingRerollHit] = useState<RerollState>({
    enabled: false,
    mode: 'failed',
    scope: 'all',
    specificValues: '',
  });
  const [shootingRerollWound, setShootingRerollWound] = useState<RerollState>({
    enabled: false,
    mode: 'failed',
    scope: 'all',
    specificValues: '',
  });
  const [shootingRerollArmor, setShootingRerollArmor] = useState<RerollState>({
    enabled: false,
    mode: 'failed',
    scope: 'all',
    specificValues: '',
  });
  const [shootingRerollWard, setShootingRerollWard] = useState<RerollState>({
    enabled: false,
    mode: 'failed',
    scope: 'all',
    specificValues: '',
  });
  const [shootingRerollMitigation, setShootingRerollMitigation] = useState<RerollState>({
    enabled: false,
    mode: 'failed',
    scope: 'all',
    specificValues: '',
  });
  const [moraleDiscipline, setMoraleDiscipline] = useState('8');
  const [moraleBonus, setMoraleBonus] = useState('0');
  const [moraleMalus, setMoraleMalus] = useState('0');
  const [moraleStubborn, setMoraleStubborn] = useState(false);
  const [moraleWithThreeDice, setMoraleWithThreeDice] = useState(false);
  const [moraleErrorMessage, setMoraleErrorMessage] = useState('');
  const [moraleResults, setMoraleResults] = useState<{
    rolls: number[];
    usedRolls: number[];
    total: number;
    target: number;
    outcome: 'Passed' | 'Failed';
    isDoubleOne: boolean;
  } | null>(null);
  const [moraleReroll, setMoraleReroll] = useState<RerollState>({
    enabled: false,
    mode: 'failed',
    scope: 'all',
    specificValues: '',
  });
  const [trechPlusDice, setTrechPlusDice] = useState('0');
  const [trechMinusDice, setTrechMinusDice] = useState('0');
  const [trechPositiveModifier, setTrechPositiveModifier] = useState('0');
  const [trechNegativeModifier, setTrechNegativeModifier] = useState('0');
  const [trechErrorMessage, setTrechErrorMessage] = useState('');
  const [trechProbabilityResults, setTrechProbabilityResults] = useState<{
    expectedTotal: number;
    successChance: number;
    selectionMode: 'highest' | 'lowest' | 'normal';
    baseDice: number;
    totalDice: number;
    netDice: number;
  } | null>(null);
  const [trechResults, setTrechResults] = useState<{
    rolls: number[];
    selectedRolls: number[];
    baseTotal: number;
    finalTotal: number;
    success: boolean;
    selectionMode: 'highest' | 'lowest' | 'normal';
  } | null>(null);
  const [trechDebug, setTrechDebug] = useState({
    rolls: [] as number[],
    selectedRolls: [] as number[],
  });
  const [trechProbabilityDebug, setTrechProbabilityDebug] = useState({
    baseDice: 2,
    totalDice: 2,
    netDice: 0,
    expectedTotal: 0,
    successChance: 0,
  });
  const [trechInjuryPlusDice, setTrechInjuryPlusDice] = useState('0');
  const [trechInjuryMinusDice, setTrechInjuryMinusDice] = useState('0');
  const [trechInjuryPositiveModifier, setTrechInjuryPositiveModifier] = useState('0');
  const [trechInjuryNegativeModifier, setTrechInjuryNegativeModifier] = useState('0');
  const [trechInjuryWithThreeDice, setTrechInjuryWithThreeDice] = useState(false);
  const [trechInjuryTargetArmor, setTrechInjuryTargetArmor] = useState('0');
  const [trechInjuryNoArmorSave, setTrechInjuryNoArmorSave] = useState(false);
  const [trechInjuryArmorPositive, setTrechInjuryArmorPositive] = useState('0');
  const [trechInjuryArmorNegative, setTrechInjuryArmorNegative] = useState('0');
  const [trechInjuryErrorMessage, setTrechInjuryErrorMessage] = useState('');
  const [trechInjuryProbabilityResults, setTrechInjuryProbabilityResults] = useState<{
    expectedTotal: number;
    outcomeChances: {
      noEffect: number;
      minorHit: number;
      down: number;
      outOfAction: number;
    };
    selectionMode: 'highest' | 'lowest' | 'normal';
    baseDice: number;
    totalDice: number;
    netDice: number;
    armorApplied: number;
  } | null>(null);
  const [trechInjuryResults, setTrechInjuryResults] = useState<{
    rolls: number[];
    selectedRolls: number[];
    baseTotal: number;
    finalTotal: number;
    outcome: 'No effect' | 'Minor hit' | 'Down' | 'Out of action';
    selectionMode: 'highest' | 'lowest' | 'normal';
  } | null>(null);
  const [trechInjuryDebug, setTrechInjuryDebug] = useState({
    rolls: [] as number[],
    selectedRolls: [] as number[],
    baseDice: 2,
    totalDice: 2,
    netDice: 0,
    targetArmor: 0,
    armorPositive: 0,
    armorNegative: 0,
    armorApplied: 0,
    baseTotal: 0,
    finalTotal: 0,
  });
  const [trechInjuryProbabilityDebug, setTrechInjuryProbabilityDebug] = useState({
    baseDice: 2,
    totalDice: 2,
    netDice: 0,
    armorApplied: 0,
    expectedTotal: 0,
    outcomeChances: {
      noEffect: 0,
      minorHit: 0,
      down: 0,
      outOfAction: 0,
    },
  });
  const [combatRerollHit, setCombatRerollHit] = useState<RerollState>({
    enabled: false,
    mode: 'failed',
    scope: 'all',
    specificValues: '',
  });
  const [combatRerollWound, setCombatRerollWound] = useState<RerollState>({
    enabled: false,
    mode: 'failed',
    scope: 'all',
    specificValues: '',
  });
  const [combatRerollArmor, setCombatRerollArmor] = useState<RerollState>({
    enabled: false,
    mode: 'failed',
    scope: 'all',
    specificValues: '',
  });
  const [combatRerollWard, setCombatRerollWard] = useState<RerollState>({
    enabled: false,
    mode: 'failed',
    scope: 'all',
    specificValues: '',
  });
  const [combatTargetType, setCombatTargetType] = useState<'living' | 'vehicle'>('living');
  const [combatTargetWounds, setCombatTargetWounds] = useState('1');
  const [combatTargetArmorValue, setCombatTargetArmorValue] = useState('12');
  const [combatInstantDeath, setCombatInstantDeath] = useState(false);
  const [combatDeflagrate, setCombatDeflagrate] = useState(false);
  const [combatBreachingEnabled, setCombatBreachingEnabled] = useState(false);
  const [combatBreachingValue, setCombatBreachingValue] = useState('');
  const [combatRendingEnabled, setCombatRendingEnabled] = useState(false);
  const [combatRendingValue, setCombatRendingValue] = useState('');
  const [combatMurderousEnabled, setCombatMurderousEnabled] = useState(false);
  const [combatMurderousValue, setCombatMurderousValue] = useState('');
  const [generalDebug, setGeneralDebug] = useState({
    initialRolls: [] as number[],
    rerollRolls: [] as number[],
    finalRolls: [] as number[],
  });
  const [moraleDebug, setMoraleDebug] = useState({
    initialRolls: [] as number[],
    rerollRolls: [] as number[],
    finalRolls: [] as number[],
  });
  const [shootingDebug, setShootingDebug] = useState({
    hitInitialRolls: [] as number[],
    hitRerollRolls: [] as number[],
    woundInitialRolls: [] as number[],
    woundRerollRolls: [] as number[],
    penetrationTotals: [] as number[],
    penetrationMaxDice: [] as number[],
    rendingBonusRolls: [] as number[],
    armorInitialRolls: [] as number[],
    armorRerollRolls: [] as number[],
    wardInitialRolls: [] as number[],
    wardRerollRolls: [] as number[],
    multipleWoundsRolls: [] as number[],
    penetrationDamageRolls: [] as number[],
    deflagrateHits: 0,
    deflagrateExtraWounds: 0,
    rendingWounds: 0,
    breachingWounds: 0,
    murderousWounds: 0,
  });

  const [results, setResults] = useState({
    successfulHits: 0,
    successfulWounds: 0,
    poisonedAutoWounds: 0,
    failedArmorSaves: 0,
    failedWardSaves: 0,
    finalDamage: 0,
  });
  const [hasResults, setHasResults] = useState(false);
  const [throwResults, setThrowResults] = useState({
    successfulHits: 0,
    successfulWounds: 0,
    poisonedAutoWounds: 0,
    nonPoisonHits: 0,
    failedArmorSaves: 0,
    failedWardSaves: 0,
    finalDamage: 0,
  });
  const [throwDebug, setThrowDebug] = useState({
    hitTarget: 0,
    woundTarget: 0,
    effectiveArmorSave: null as number | null,
    poisonedAutoWounds: 0,
    nonPoisonHits: 0,
    predatoryCount: 0,
    predatorySixes: 0,
    totalAttacks: 0,
    hitInitialRolls: [] as number[],
    hitRerollRolls: [] as number[],
    woundInitialRolls: [] as number[],
    woundRerollRolls: [] as number[],
    hitRolls: [] as number[],
    woundRolls: [] as number[],
    armorRolls: [] as number[],
    armorRerollRolls: [] as number[],
    wardRolls: [] as number[],
    wardRerollRolls: [] as number[],
    multipleWoundsRolls: [] as number[],
  });
  const [hasThrowResults, setHasThrowResults] = useState(false);

  const systemLabel = gameSystem === 'trech'
    ? 'Trench Crusade'
    : gameSystem === 'hh2'
      ? 'Horus Heresy (second edition)'
      : 'Warhammer Fantasy 8th';

  const setProbabilityModeAll = (mode: 'single' | 'range' | null) => {
    setAppProbabilityMode(mode);
    setGeneralProbabilityMode(mode);
    setShootingProbabilityMode(mode);
  };

  const handleHome = () => {
    setGameSystem(null);
    setPhase(null);
    setAppMode(null);
    setProbabilityModeAll(null);
  };

  const handleSystemSelect = (system: GameSystem) => {
    setGameSystem(system);
    setPhase(null);
    setAppMode(null);
    setProbabilityModeAll(null);
  };

  const handleSystemBack = () => {
    setGameSystem(null);
    setPhase(null);
    setAppMode(null);
    setProbabilityModeAll(null);
  };

  const handleModeSelect = (nextMode: 'probability' | 'throw') => {
    setAppMode(nextMode);
    setProbabilityModeAll(null);
  };

  const handleModeBack = () => {
    setPhase(null);
    setAppMode(null);
    setProbabilityModeAll(null);
  };

  const handleProbabilityTypeSelect = (mode: 'single' | 'range') => {
    setProbabilityModeAll(mode);
  };

  const handlePhaseSelect = (nextPhase: Phase) => {
    setPhase(nextPhase);
  };

  const handlePhaseBack = () => {
    setPhase(null);
  };

  const handleProbabilityModeToggle = (currentMode: 'single' | 'range' | null) => (
    currentMode === 'range' ? 'single' : 'range'
  );

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

  const toDiceRerollConfig = (config: RerollState): DiceRerollConfig => ({
    enabled: config.enabled,
    mode: config.mode,
    scope: config.scope,
    specificValues: parseSpecificValues(config.specificValues),
  });

  const handleGeneralAverageCalculate = () => {
    const parsedDiceCount = Number.parseInt(generalDiceCount, 10);
    const parsedTargetValue = Number.parseInt(generalTargetValue, 10);

    if (
      Number.isNaN(parsedDiceCount) ||
      parsedDiceCount <= 0 ||
      (generalObjective === 'target' && Number.isNaN(parsedTargetValue))
    ) {
      setGeneralErrorMessage('Devi inserire un risultato di dado');
      return;
    }

    setGeneralErrorMessage('');
    if (generalObjective === 'target') {
      const chance = getFaceProbabilitiesWithReroll(parsedTargetValue, generalReroll).successChance;
      const averageSuccesses = parsedDiceCount * chance;
      setGeneralAverageResults({ averageSuccesses, successChance: chance, averageTotal: 0 });
    } else {
      const rerollTarget = 4;
      const probabilities = getFaceProbabilitiesWithReroll(rerollTarget, generalReroll).probabilities;
      const expectedDie = probabilities
        .slice(1)
        .reduce((sum, chance, index) => sum + (index + 1) * chance, 0);
      const averageTotal = parsedDiceCount * expectedDie;
      setGeneralAverageResults({ averageSuccesses: 0, successChance: 0, averageTotal });
    }
    setHasGeneralAverageResults(true);
  };

  const handleGeneralThrowCalculate = () => {
    const parsedDiceCount = Number.parseInt(generalDiceCount, 10);
    const parsedTargetValue = Number.parseInt(generalTargetValue, 10);

    if (
      Number.isNaN(parsedDiceCount) ||
      parsedDiceCount <= 0 ||
      (generalObjective === 'target' && Number.isNaN(parsedTargetValue))
    ) {
      setGeneralErrorMessage('Devi inserire un risultato di dado');
      return;
    }

    setGeneralErrorMessage('');
    const rerollTarget = generalObjective === 'target' ? parsedTargetValue : 4;
    const initialRolls = Array.from({ length: parsedDiceCount }, () => Math.floor(Math.random() * 6) + 1);
    const rerollResult = applyRerollWithDebug(initialRolls, rerollTarget, generalReroll);
    const rolls = rerollResult.finalRolls;
    const total = rolls.reduce((sum, roll) => sum + roll, 0);
    const successes = generalObjective === 'target'
      ? rolls.filter((roll) => roll >= parsedTargetValue).length
      : 0;
    setGeneralThrowResults({ successes, rolls, total });
    setGeneralDebug({
      initialRolls,
      rerollRolls: rerollResult.rerollRolls,
      finalRolls: rolls,
    });
    setHasGeneralThrowResults(true);
  };

  const getShootingResultNeeded = () => {
    const parsedBallisticSkill = Number.parseInt(ballisticSkill, 10);
    if (Number.isNaN(parsedBallisticSkill)) {
      return Number.NaN;
    }
    if (gameSystem === 'hh2') {
      return getHh2HitProfile(parsedBallisticSkill, { nightFighting: shootingNightFighting }).baseTarget;
    }
    if (shootingAutoHit) {
      return 1;
    }
    const baseResult = 7 - parsedBallisticSkill;
    const modifierCount = Object.values(shootingModifiers).filter(Boolean).length;
    const hardCoverPenalty = shootingModifiers.hardCover ? 1 : 0;
    return baseResult + modifierCount + hardCoverPenalty;
  };

  const handleShootingModifierChange = (
    key: keyof typeof shootingModifiers,
    value: boolean,
  ) => {
    setShootingModifiers((prev) => ({
      ...prev,
      lightCover: key === 'hardCover' && value ? false : prev.lightCover,
      hardCover: key === 'lightCover' && value ? false : prev.hardCover,
      [key]: value,
    }));
  };

  const handleShootingAutoHitChange = (value: boolean) => {
    setShootingAutoHit(value);
    if (value) {
      setShootingPoisonedAttack(false);
    }
  };

  const parseSpecificValuesWithMax = (input: string, maxValue: number) => {
    return input
      .split(',')
      .map((value) => Number.parseInt(value.trim(), 10))
      .filter((value) => Number.isFinite(value) && value >= 1 && value <= maxValue);
  };

  const getDiceDistribution = (diceCountValue: 1 | 2) => {
    const distribution: Record<number, number> = {};
    if (diceCountValue === 1) {
      for (let value = 1; value <= 6; value += 1) {
        distribution[value] = 1 / 6;
      }
      return distribution;
    }
    for (let dieA = 1; dieA <= 6; dieA += 1) {
      for (let dieB = 1; dieB <= 6; dieB += 1) {
        const total = dieA + dieB;
        distribution[total] = (distribution[total] ?? 0) + 1 / 36;
      }
    }
    return distribution;
  };

  const getPenetrationRollOutcomes = (diceCountValue: 1 | 2) => {
    const outcomes: { roll: number; maxDie: number; chance: number }[] = [];
    if (diceCountValue === 1) {
      for (let roll = 1; roll <= 6; roll += 1) {
        outcomes.push({ roll, maxDie: roll, chance: 1 / 6 });
      }
      return outcomes;
    }
    for (let dieA = 1; dieA <= 6; dieA += 1) {
      for (let dieB = 1; dieB <= 6; dieB += 1) {
        outcomes.push({
          roll: dieA + dieB,
          maxDie: Math.max(dieA, dieB),
          chance: 1 / 36,
        });
      }
    }
    return outcomes;
  };

  const getPenetrationTotalDistribution = (
    strengthValue: number,
    armorValue: number,
    rerollConfig: RerollState,
    diceCountValue: 1 | 2,
    rendingValue: number | null,
  ) => {
    const maxRoll = diceCountValue === 2 ? 12 : 6;
    const specificValues = new Set(parseSpecificValuesWithMax(rerollConfig.specificValues, maxRoll));
    const baseOutcomes = getPenetrationRollOutcomes(diceCountValue);
    const baseDistribution: Record<number, number> = {};
    const expandedOutcomes: { roll: number; total: number; chance: number; success: boolean }[] = [];

    baseOutcomes.forEach((outcome) => {
      const rendingTriggered = rendingValue !== null && outcome.maxDie >= rendingValue;
      if (rendingTriggered) {
        for (let bonus = 1; bonus <= 3; bonus += 1) {
          const total = outcome.roll + strengthValue + bonus;
          const chance = outcome.chance / 3;
          const success = total >= armorValue;
          expandedOutcomes.push({ roll: outcome.roll, total, chance, success });
          baseDistribution[total] = (baseDistribution[total] ?? 0) + chance;
        }
      } else {
        const total = outcome.roll + strengthValue;
        const chance = outcome.chance;
        const success = total >= armorValue;
        expandedOutcomes.push({ roll: outcome.roll, total, chance, success });
        baseDistribution[total] = (baseDistribution[total] ?? 0) + chance;
      }
    });

    if (!rerollConfig.enabled) {
      return baseDistribution;
    }

    const finalDistribution: Record<number, number> = {};
    expandedOutcomes.forEach((outcome) => {
      if (shouldRerollValue(outcome.roll, outcome.success, rerollConfig, specificValues)) {
        Object.entries(baseDistribution).forEach(([totalKey, chance]) => {
          const totalValue = Number.parseInt(totalKey, 10);
          finalDistribution[totalValue] = (finalDistribution[totalValue] ?? 0) + outcome.chance * chance;
        });
      } else {
        finalDistribution[outcome.total] = (finalDistribution[outcome.total] ?? 0) + outcome.chance;
      }
    });

    return finalDistribution;
  };

  const getPenetrationChances = (
    strengthValue: number,
    armorValue: number,
    rerollConfig: RerollState,
    meltaEnabled: boolean,
    rendingValue: number | null = null,
  ) => {
    const diceCountValue = meltaEnabled ? 2 : 1;
    const distribution = getPenetrationTotalDistribution(
      strengthValue,
      armorValue,
      rerollConfig,
      diceCountValue,
      rendingValue,
    );
    const glancingChance = distribution[armorValue] ?? 0;
    let penetratingChance = 0;
    Object.entries(distribution).forEach(([totalKey, chance]) => {
      if (Number.parseInt(totalKey, 10) > armorValue) {
        penetratingChance += chance;
      }
    });
    return { glancingChance, penetratingChance };
  };

  const getWoundCategoryChances = (
    woundTarget: number,
    rerollConfig: RerollState,
    options: {
      breachingValue: number | null;
      rendingValue: number | null;
      murderousValue: number | null;
    },
  ) => {
    if (Number.isNaN(woundTarget) || woundTarget <= 0) {
      return {
        normalChance: 0,
        normalAp2Chance: 0,
        instantChance: 0,
        instantAp2Chance: 0,
      };
    }
    const probabilities = getFaceProbabilitiesWithReroll(woundTarget, rerollConfig).probabilities;
    let normalChance = 0;
    let normalAp2Chance = 0;
    let instantChance = 0;
    let instantAp2Chance = 0;
    for (let roll = 1; roll <= 6; roll += 1) {
      const chance = probabilities[roll] ?? 0;
      const isRending = options.rendingValue !== null && roll >= options.rendingValue;
      const isSuccess = isRending || roll >= woundTarget;
      if (!isSuccess) {
        continue;
      }
      const isBreaching = options.breachingValue !== null && roll >= options.breachingValue;
      const isAp2 = isRending || isBreaching;
      const isInstant = options.murderousValue !== null && roll >= options.murderousValue;
      if (isInstant) {
        if (isAp2) {
          instantAp2Chance += chance;
        } else {
          instantChance += chance;
        }
      } else if (isAp2) {
        normalAp2Chance += chance;
      } else {
        normalChance += chance;
      }
    }
    return {
      normalChance,
      normalAp2Chance,
      instantChance,
      instantAp2Chance,
    };
  };

  const handleMoraleRoll = () => {
    const parsedDiscipline = Number.parseInt(moraleDiscipline, 10);
    const parsedBonus = Number.parseInt(moraleBonus, 10);
    const parsedMalus = Number.parseInt(moraleMalus, 10);

    if (
      Number.isNaN(parsedDiscipline) ||
      Number.isNaN(parsedBonus) ||
      Number.isNaN(parsedMalus)
    ) {
      setMoraleErrorMessage('Devi inserire un risultato di dado');
      return;
    }

    setMoraleErrorMessage('');
    const target = moraleStubborn
      ? parsedDiscipline
      : parsedDiscipline + parsedBonus - parsedMalus;
    const diceCount = moraleWithThreeDice ? 3 : 2;
    const initialRolls = Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1);
    let rolls = [...initialRolls];
    let usedRolls = [...rolls].sort((a, b) => a - b).slice(0, 2);
    let total = usedRolls.reduce((sum, roll) => sum + roll, 0);
    let isDoubleOne = usedRolls[0] === 1 && usedRolls[1] === 1;
    let outcome: 'Passed' | 'Failed' = isDoubleOne || total <= target ? 'Passed' : 'Failed';
    const rerollRolls: number[] = [];

    if (moraleReroll.enabled) {
      const shouldRerollCheck = moraleReroll.mode === 'failed'
        ? outcome === 'Failed'
        : outcome === 'Passed';
      if (shouldRerollCheck) {
        const specificValues = new Set(parseSpecificValues(moraleReroll.specificValues));
        rolls = rolls.map((roll) => {
          if (moraleReroll.scope === 'all' || specificValues.has(roll)) {
            const reroll = Math.floor(Math.random() * 6) + 1;
            rerollRolls.push(reroll);
            return reroll;
          }
          return roll;
        });
        usedRolls = [...rolls].sort((a, b) => a - b).slice(0, 2);
        total = usedRolls.reduce((sum, roll) => sum + roll, 0);
        isDoubleOne = usedRolls[0] === 1 && usedRolls[1] === 1;
        outcome = isDoubleOne || total <= target ? 'Passed' : 'Failed';
      }
    }

    setMoraleResults({
      rolls,
      usedRolls,
      total,
      target,
      outcome,
      isDoubleOne,
    });
    setMoraleDebug({
      initialRolls,
      rerollRolls,
      finalRolls: rolls,
    });
  };

  const handleTrechGenericRoll = () => {
    const parsedPlus = Number.parseInt(trechPlusDice, 10);
    const parsedMinus = Number.parseInt(trechMinusDice, 10);
    const parsedPositive = Number.parseInt(trechPositiveModifier, 10);
    const parsedNegative = Number.parseInt(trechNegativeModifier, 10);

    if (
      Number.isNaN(parsedPlus) ||
      Number.isNaN(parsedMinus) ||
      Number.isNaN(parsedPositive) ||
      Number.isNaN(parsedNegative) ||
      parsedPlus < 0 ||
      parsedMinus < 0
    ) {
      setTrechErrorMessage('Devi inserire un risultato di dado');
      return;
    }

    setTrechErrorMessage('');
    const result = calculateTrechGenericRoll({
      plusDice: parsedPlus,
      minusDice: parsedMinus,
      positiveModifier: parsedPositive,
      negativeModifier: parsedNegative,
    });

    setTrechResults({
      rolls: result.rolls,
      selectedRolls: result.selectedRolls,
      baseTotal: result.baseTotal,
      finalTotal: result.finalTotal,
      success: result.success,
      selectionMode: result.selectionMode,
    });
    setTrechDebug({ rolls: result.rolls, selectedRolls: result.selectedRolls });
  };

  const handleTrechGenericProbabilityCalculate = () => {
    const parsedPlus = Number.parseInt(trechPlusDice, 10);
    const parsedMinus = Number.parseInt(trechMinusDice, 10);
    const parsedPositive = Number.parseInt(trechPositiveModifier, 10);
    const parsedNegative = Number.parseInt(trechNegativeModifier, 10);

    if (
      Number.isNaN(parsedPlus) ||
      Number.isNaN(parsedMinus) ||
      Number.isNaN(parsedPositive) ||
      Number.isNaN(parsedNegative) ||
      parsedPlus < 0 ||
      parsedMinus < 0
    ) {
      setTrechErrorMessage('Devi inserire un risultato di dado');
      return;
    }

    setTrechErrorMessage('');
    const result = calculateTrechGenericProbability({
      plusDice: parsedPlus,
      minusDice: parsedMinus,
      positiveModifier: parsedPositive,
      negativeModifier: parsedNegative,
    });

    setTrechProbabilityResults({
      expectedTotal: result.expectedTotal,
      successChance: result.successChance,
      selectionMode: result.selectionMode,
      baseDice: result.baseDice,
      totalDice: result.totalDice,
      netDice: result.netDice,
    });
    setTrechProbabilityDebug({
      baseDice: result.baseDice,
      totalDice: result.totalDice,
      netDice: result.netDice,
      expectedTotal: result.expectedTotal,
      successChance: result.successChance,
    });
  };

  const handleTrechInjuryRoll = () => {
    const parsedPlus = Number.parseInt(trechInjuryPlusDice, 10);
    const parsedMinus = Number.parseInt(trechInjuryMinusDice, 10);
    const parsedPositive = Number.parseInt(trechInjuryPositiveModifier, 10);
    const parsedNegative = Number.parseInt(trechInjuryNegativeModifier, 10);
    const parsedTargetArmor = Number.parseInt(trechInjuryTargetArmor, 10);
    const parsedArmorPositive = Number.parseInt(trechInjuryArmorPositive, 10);
    const parsedArmorNegative = Number.parseInt(trechInjuryArmorNegative, 10);

    if (
      Number.isNaN(parsedPlus) ||
      Number.isNaN(parsedMinus) ||
      Number.isNaN(parsedPositive) ||
      Number.isNaN(parsedNegative) ||
      Number.isNaN(parsedTargetArmor) ||
      Number.isNaN(parsedArmorPositive) ||
      Number.isNaN(parsedArmorNegative) ||
      parsedPlus < 0 ||
      parsedMinus < 0
    ) {
      setTrechInjuryErrorMessage('Devi inserire un risultato di dado');
      return;
    }

    setTrechInjuryErrorMessage('');
    const result = calculateTrechInjuryRoll({
      plusDice: parsedPlus,
      minusDice: parsedMinus,
      positiveModifier: parsedPositive,
      negativeModifier: parsedNegative,
      withThreeDice: trechInjuryWithThreeDice,
      targetArmor: parsedTargetArmor,
      noArmorSave: trechInjuryNoArmorSave,
      armorPositiveModifier: parsedArmorPositive,
      armorNegativeModifier: parsedArmorNegative,
    });

    setTrechInjuryResults({
      rolls: result.rolls,
      selectedRolls: result.selectedRolls,
      baseTotal: result.baseTotal,
      finalTotal: result.finalTotal,
      outcome: result.outcome,
      selectionMode: result.selectionMode,
    });
    setTrechInjuryDebug({
      rolls: result.rolls,
      selectedRolls: result.selectedRolls,
      baseDice: result.baseDice,
      totalDice: result.totalDice,
      netDice: result.netDice,
      targetArmor: parsedTargetArmor,
      armorPositive: parsedArmorPositive,
      armorNegative: parsedArmorNegative,
      armorApplied: result.armorApplied,
      baseTotal: result.baseTotal,
      finalTotal: result.finalTotal,
    });
  };

  const handleTrechInjuryProbabilityCalculate = () => {
    const parsedPlus = Number.parseInt(trechInjuryPlusDice, 10);
    const parsedMinus = Number.parseInt(trechInjuryMinusDice, 10);
    const parsedPositive = Number.parseInt(trechInjuryPositiveModifier, 10);
    const parsedNegative = Number.parseInt(trechInjuryNegativeModifier, 10);
    const parsedTargetArmor = Number.parseInt(trechInjuryTargetArmor, 10);
    const parsedArmorPositive = Number.parseInt(trechInjuryArmorPositive, 10);
    const parsedArmorNegative = Number.parseInt(trechInjuryArmorNegative, 10);

    if (
      Number.isNaN(parsedPlus) ||
      Number.isNaN(parsedMinus) ||
      Number.isNaN(parsedPositive) ||
      Number.isNaN(parsedNegative) ||
      Number.isNaN(parsedTargetArmor) ||
      Number.isNaN(parsedArmorPositive) ||
      Number.isNaN(parsedArmorNegative) ||
      parsedPlus < 0 ||
      parsedMinus < 0
    ) {
      setTrechInjuryErrorMessage('Devi inserire un risultato di dado');
      return;
    }

    setTrechInjuryErrorMessage('');
    const result = calculateTrechInjuryProbability({
      plusDice: parsedPlus,
      minusDice: parsedMinus,
      positiveModifier: parsedPositive,
      negativeModifier: parsedNegative,
      withThreeDice: trechInjuryWithThreeDice,
      targetArmor: parsedTargetArmor,
      noArmorSave: trechInjuryNoArmorSave,
      armorPositiveModifier: parsedArmorPositive,
      armorNegativeModifier: parsedArmorNegative,
    });

    setTrechInjuryProbabilityResults({
      expectedTotal: result.expectedTotal,
      outcomeChances: result.outcomeChances,
      selectionMode: result.selectionMode,
      baseDice: result.baseDice,
      totalDice: result.totalDice,
      netDice: result.netDice,
      armorApplied: result.armorApplied,
    });
    setTrechInjuryProbabilityDebug({
      baseDice: result.baseDice,
      totalDice: result.totalDice,
      netDice: result.netDice,
      armorApplied: result.armorApplied,
      expectedTotal: result.expectedTotal,
      outcomeChances: result.outcomeChances,
    });
  };

  const handleShootingAverageCalculate = () => {
    const parsedDiceCount = Number.parseInt(shootingDiceCount, 10);
    const parsedBallisticSkill = Number.parseInt(ballisticSkill, 10);
    const parsedHitStrength = Number.parseInt(shootingHitStrength, 10);
    const parsedTargetToughness = Number.parseInt(shootingTargetToughness, 10);
    const parsedTargetWounds = Number.parseInt(shootingTargetWounds, 10);
    const parsedTargetArmorValue = shootingTargetArmorValue.trim() === ''
      ? 0
      : Number.parseInt(shootingTargetArmorValue, 10);
    const parsedArmorPenetration = shootingArmorPenetration.trim() === ''
      ? Number.NaN
      : Number.parseInt(shootingArmorPenetration, 10);
    const parsedWoundValue = Number.parseInt(shootingWoundValue, 10);
    const parsedArmorSave = shootingArmorSave.trim() === ''
      ? 0
      : Number.parseInt(shootingArmorSave, 10);
    const parsedWardSave = shootingWardSave.trim() === ''
      ? 0
      : Number.parseInt(shootingWardSave, 10);
    const parsedMitigationRoll = shootingDamageMitigationRoll.trim() === ''
      ? 0
      : Number.parseInt(shootingDamageMitigationRoll, 10);
    const resultNeeded = getShootingResultNeeded();
    const parsedMultipleWounds = shootingMultipleWoundsEnabled
      ? parseMultipleWoundsValue(shootingMultipleWoundsValue)
      : null;

    setShootingErrorMessage('');
    if (gameSystem === 'hh2') {
      if (
        Number.isNaN(parsedDiceCount) ||
        parsedDiceCount <= 0 ||
        Number.isNaN(parsedBallisticSkill)
      ) {
        setShootingErrorMessage('Devi inserire un risultato di dado');
        return;
      }
      if (
        shootingTargetType === 'living' &&
        (Number.isNaN(parsedHitStrength) ||
          Number.isNaN(parsedTargetToughness) ||
          Number.isNaN(parsedTargetWounds) ||
          parsedTargetWounds <= 0)
      ) {
        setShootingErrorMessage('Devi inserire un risultato di dado');
        return;
      }
      if (
        shootingTargetType === 'vehicle' &&
        (Number.isNaN(parsedHitStrength) ||
          Number.isNaN(parsedTargetArmorValue))
      ) {
        setShootingErrorMessage('Devi inserire un risultato di dado');
        return;
      }
      if (
        shootingTargetType === 'vehicle' &&
        (Number.isNaN(parsedHitStrength) ||
          Number.isNaN(parsedTargetArmorValue))
      ) {
        setShootingErrorMessage('Devi inserire un risultato di dado');
        return;
      }
      const hitChance = getHh2HitSuccessChance(parsedBallisticSkill, shootingRerollHit, {
        nightFighting: shootingNightFighting,
      });
      const successfulHits = parsedDiceCount * hitChance;
      if (shootingTargetType === 'vehicle') {
        const rendingValue = shootingRendingEnabled
          ? Number.parseInt(shootingRendingValue, 10)
          : null;
        if (shootingRendingEnabled && (!Number.isFinite(rendingValue) || rendingValue! < 1 || rendingValue! > 6)) {
          setShootingErrorMessage('Devi inserire un risultato di dado');
          return;
        }
        const effectiveArmorValue = shootingLance
          ? Math.min(parsedTargetArmorValue, 12)
          : parsedTargetArmorValue;
        const { glancingChance, penetratingChance } = getPenetrationChances(
          parsedHitStrength,
          effectiveArmorValue,
          shootingRerollWound,
          shootingMelta,
          shootingRendingEnabled ? rendingValue : null,
        );
        const glancingHits = successfulHits * glancingChance;
        const penetratingHits = successfulHits * penetratingChance;
        const penetrationModifier = parsedArmorPenetration === 1
          ? 2
          : parsedArmorPenetration === 2
            ? 1
            : 0;
        let crewShaken = 0;
        let crewStunned = 0;
        let weaponDestroyed = 0;
        let immobilised = 0;
        let explodes = 0;
        for (let roll = 1; roll <= 6; roll += 1) {
          const total = roll + penetrationModifier;
          const chance = 1 / 6;
          if (total <= 3) {
            crewShaken += chance;
          } else if (total === 4) {
            crewStunned += chance;
          } else if (total === 5) {
            weaponDestroyed += chance;
          } else if (total === 6) {
            immobilised += chance;
          } else {
            explodes += chance;
          }
        }
        setShootingProbabilityResults({
          successfulHits: parseFloat(successfulHits.toFixed(2)),
          successfulWounds: parseFloat((glancingHits + penetratingHits).toFixed(2)),
          poisonedAutoWounds: 0,
          failedArmorSaves: 0,
          failedWardSaves: 0,
          finalDamage: parseFloat((glancingHits + penetratingHits).toFixed(2)),
          glancingHits: parseFloat(glancingHits.toFixed(2)),
          penetratingHits: parseFloat(penetratingHits.toFixed(2)),
          crewShaken: parseFloat((penetratingHits * crewShaken).toFixed(2)),
          crewStunned: parseFloat((penetratingHits * crewStunned).toFixed(2)),
          weaponDestroyed: parseFloat((penetratingHits * weaponDestroyed).toFixed(2)),
          immobilised: parseFloat((penetratingHits * immobilised).toFixed(2)),
          explodes: parseFloat((penetratingHits * explodes).toFixed(2)),
        });
        setShootingDebug({
          hitInitialRolls: [],
          hitRerollRolls: [],
          woundInitialRolls: [],
          woundRerollRolls: [],
          penetrationTotals: [],
          penetrationMaxDice: [],
          rendingBonusRolls: [],
          armorInitialRolls: [],
          armorRerollRolls: [],
          wardInitialRolls: [],
          wardRerollRolls: [],
          multipleWoundsRolls: [],
          penetrationDamageRolls: [],
          deflagrateHits: 0,
          deflagrateExtraWounds: 0,
          rendingWounds: 0,
          breachingWounds: 0,
          murderousWounds: 0,
        });
        setHasShootingProbabilityResults(true);
        return;
      }
      const breachingValue = shootingBreachingEnabled
        ? Number.parseInt(shootingBreachingValue, 10)
        : null;
      const rendingValue = shootingRendingEnabled
        ? Number.parseInt(shootingRendingValue, 10)
        : null;
      const murderousValue = shootingMurderousEnabled
        ? Number.parseInt(shootingMurderousValue, 10)
        : null;
      if (
        (shootingBreachingEnabled && (!Number.isFinite(breachingValue) || breachingValue! < 1 || breachingValue! > 6)) ||
        (shootingRendingEnabled && (!Number.isFinite(rendingValue) || rendingValue! < 1 || rendingValue! > 6)) ||
        (shootingMurderousEnabled && (!Number.isFinite(murderousValue) || murderousValue! < 1 || murderousValue! > 6))
      ) {
        setShootingErrorMessage('Devi inserire un risultato di dado');
        return;
      }
      const woundProfile = getHh2WoundProfile(parsedHitStrength, parsedTargetToughness);
      const woundTarget = woundProfile.target ?? 0;
      const woundChances = woundProfile.impossible || woundTarget === 0
        ? { normalChance: 0, normalAp2Chance: 0, instantChance: 0, instantAp2Chance: 0 }
        : getWoundCategoryChances(woundTarget, shootingRerollWound, {
          breachingValue,
          rendingValue,
          murderousValue,
        });
      const instantDeathActive = shootingInstantDeath || parsedHitStrength >= parsedTargetToughness * 2;
      const effectiveChances = instantDeathActive
        ? {
          normalChance: 0,
          normalAp2Chance: 0,
          instantChance: woundChances.normalChance + woundChances.instantChance,
          instantAp2Chance: woundChances.normalAp2Chance + woundChances.instantAp2Chance,
        }
        : woundChances;
      const normalWounds = successfulHits * (effectiveChances.normalChance + effectiveChances.normalAp2Chance);
      const successfulWounds = successfulHits * (
        effectiveChances.normalChance
        + effectiveChances.normalAp2Chance
        + effectiveChances.instantChance
        + effectiveChances.instantAp2Chance
      );
      const armorBlocked = Number.isFinite(parsedArmorPenetration) &&
        parsedArmorPenetration > 0 &&
        parsedArmorPenetration <= parsedArmorSave;
      const hasArmorSave = shootingArmorSave.trim() !== '';
      const armorSaveChance = hasArmorSave && !armorBlocked && parsedArmorSave > 1 && parsedArmorSave <= 6
        ? getFaceProbabilitiesWithReroll(parsedArmorSave, shootingRerollArmor).successChance
        : 0;
      const mitigationAllowed = parsedMitigationRoll > 1 &&
        parsedMitigationRoll <= 6 &&
        !(shootingDamageMitigationType === 'feelNoPain' && instantDeathActive) &&
        !(shootingDamageMitigationType === 'shrouded' && shootingNoCover);
      const invulnerableSaveChance = parsedWardSave > 1 && parsedWardSave <= 6
        ? getFaceProbabilitiesWithReroll(parsedWardSave, shootingRerollWard).successChance
        : 0;
      const mitigationSaveChance = mitigationAllowed
        ? getFaceProbabilitiesWithReroll(parsedMitigationRoll, shootingRerollMitigation).successChance
        : 0;
      const effectiveSaveChance = Math.max(invulnerableSaveChance, mitigationSaveChance);
      const normalAp2Wounds = successfulHits * effectiveChances.normalAp2Chance;
      const instantAp2Wounds = successfulHits * effectiveChances.instantAp2Chance;
      const instantWounds = successfulHits * effectiveChances.instantChance;
      const failedArmorNormal = normalWounds * (1 - armorSaveChance);
      const failedArmorNormalAp2 = normalAp2Wounds;
      const failedArmorInstant = instantWounds * (1 - armorSaveChance);
      const failedArmorInstantAp2 = instantAp2Wounds;
      const failedArmorSaves = failedArmorNormal + failedArmorNormalAp2 + failedArmorInstant + failedArmorInstantAp2;
      const failedInvulnerableSaves = failedArmorSaves * (1 - effectiveSaveChance);
      const failedInstantSaves = (failedArmorInstant + failedArmorInstantAp2) * (1 - effectiveSaveChance);
      const failedNormalSaves = (failedArmorNormal + failedArmorNormalAp2) * (1 - effectiveSaveChance);
      let finalDamage = failedInvulnerableSaves;
      let modelsRemoved = 0;
      let deflagrateHits = 0;
      let deflagrateExtraWounds = 0;
      let rendingWounds = 0;
      let breachingWounds = 0;
      let murderousWounds = 0;
      const woundProbabilities = woundProfile.impossible || woundTarget === 0
        ? null
        : getFaceProbabilitiesWithReroll(woundTarget, shootingRerollWound).probabilities;
      if (woundProbabilities) {
        for (let roll = 1; roll <= 6; roll += 1) {
          const chance = woundProbabilities[roll] ?? 0;
          const isRending = shootingRendingEnabled && rendingValue !== null && roll >= rendingValue;
          const isSuccess = isRending || roll >= woundTarget;
          if (!isSuccess) {
            continue;
          }
          if (isRending) {
            rendingWounds += successfulHits * chance;
          }
          if (shootingBreachingEnabled && breachingValue !== null && roll >= breachingValue) {
            breachingWounds += successfulHits * chance;
          }
          if (shootingMurderousEnabled && murderousValue !== null && roll >= murderousValue) {
            murderousWounds += successfulHits * chance;
          }
        }
      }
      if (instantDeathActive || shootingMurderousEnabled) {
        if (shootingAtomanticShield) {
          finalDamage = failedNormalSaves + failedInstantSaves * 2;
          modelsRemoved = finalDamage / parsedTargetWounds;
        } else {
          finalDamage = failedNormalSaves + failedInstantSaves * parsedTargetWounds;
          modelsRemoved = failedNormalSaves / parsedTargetWounds + failedInstantSaves;
        }
      } else {
        finalDamage = failedInvulnerableSaves;
        modelsRemoved = finalDamage / parsedTargetWounds;
      }
      if (shootingDeflagrate && failedInvulnerableSaves > 0) {
        deflagrateHits = failedInvulnerableSaves;
        const deflagrateNormal = deflagrateHits * (effectiveChances.normalChance + effectiveChances.normalAp2Chance);
        const deflagrateInstant = deflagrateHits * (effectiveChances.instantChance + effectiveChances.instantAp2Chance);
        const deflagrateNormalAp2 = deflagrateHits * effectiveChances.normalAp2Chance;
        const deflagrateInstantAp2 = deflagrateHits * effectiveChances.instantAp2Chance;
        const deflagrateFailedArmorNormal = (deflagrateNormal - deflagrateNormalAp2) * (1 - armorSaveChance)
          + deflagrateNormalAp2;
        const deflagrateFailedArmorInstant = (deflagrateInstant - deflagrateInstantAp2) * (1 - armorSaveChance)
          + deflagrateInstantAp2;
        const deflagrateFailedNormal = deflagrateFailedArmorNormal * (1 - effectiveSaveChance);
        const deflagrateFailedInstant = deflagrateFailedArmorInstant * (1 - effectiveSaveChance);
        deflagrateExtraWounds = deflagrateFailedNormal + deflagrateFailedInstant;
        if (instantDeathActive || shootingMurderousEnabled) {
          if (shootingAtomanticShield) {
            finalDamage += deflagrateFailedNormal + deflagrateFailedInstant * 2;
          } else {
            finalDamage += deflagrateFailedNormal + deflagrateFailedInstant * parsedTargetWounds;
          }
        } else {
          finalDamage += deflagrateFailedNormal + deflagrateFailedInstant;
        }
      }
      setShootingProbabilityResults({
        successfulHits: parseFloat(successfulHits.toFixed(2)),
        successfulWounds: parseFloat(successfulWounds.toFixed(2)),
        poisonedAutoWounds: 0,
        failedArmorSaves: parseFloat(failedArmorSaves.toFixed(2)),
        failedWardSaves: parseFloat(failedInvulnerableSaves.toFixed(2)),
        finalDamage: parseFloat(finalDamage.toFixed(2)),
        modelsRemoved: parseFloat(modelsRemoved.toFixed(2)),
      });
      setShootingDebug({
        hitInitialRolls: [],
        hitRerollRolls: [],
        woundInitialRolls: [],
        woundRerollRolls: [],
        penetrationTotals: [],
        penetrationMaxDice: [],
        rendingBonusRolls: [],
        armorInitialRolls: [],
        armorRerollRolls: [],
        wardInitialRolls: [],
        wardRerollRolls: [],
        multipleWoundsRolls: [],
        penetrationDamageRolls: [],
        deflagrateHits: parseFloat(deflagrateHits.toFixed(2)),
        deflagrateExtraWounds: parseFloat(deflagrateExtraWounds.toFixed(2)),
        rendingWounds: parseFloat(rendingWounds.toFixed(2)),
        breachingWounds: parseFloat(breachingWounds.toFixed(2)),
        murderousWounds: parseFloat(murderousWounds.toFixed(2)),
      });
      setHasShootingProbabilityResults(true);
      return;
    }

    if (
      Number.isNaN(parsedDiceCount) ||
      parsedDiceCount <= 0 ||
      Number.isNaN(parsedHitStrength) ||
      Number.isNaN(parsedWoundValue) ||
      Number.isNaN(parsedArmorSave) ||
      Number.isNaN(parsedWardSave) ||
      Number.isNaN(resultNeeded) ||
      (shootingMultipleWoundsEnabled && !parsedMultipleWounds)
    ) {
      setShootingErrorMessage('Devi inserire un risultato di dado');
      return;
    }
    const hitChance = shootingAutoHit
      ? 1
      : getShootingSuccessChanceWithReroll(resultNeeded, shootingRerollHit);
    const hitProbabilities = resultNeeded <= 6 && !shootingAutoHit
      ? getFaceProbabilitiesWithReroll(resultNeeded, shootingRerollHit)
      : null;
    const poisonedAutoWoundChance = shootingPoisonedAttack && resultNeeded <= 6 && !shootingAutoHit
      ? hitProbabilities?.sixChance ?? 0
      : 0;
    const nonPoisonHitChance = poisonedAutoWoundChance > 0
      ? Math.max(0, hitChance - poisonedAutoWoundChance)
      : hitChance;
    const woundChance = getFaceProbabilitiesWithReroll(parsedWoundValue, shootingRerollWound).successChance;
    const armorSaveModifier = parsedHitStrength - 3;
    const hasArmorSave = shootingArmorSave.trim() !== '';
    const effectiveArmorSave = parsedArmorSave + armorSaveModifier;
    const armorSaveChance = hasArmorSave && effectiveArmorSave > 1
      ? getFaceProbabilitiesWithReroll(effectiveArmorSave, shootingRerollArmor).successChance
      : 0;
    const wardSaveChance = parsedWardSave > 1
      ? getFaceProbabilitiesWithReroll(parsedWardSave, shootingRerollWard).successChance
      : 0;

    const successfulHits = parsedDiceCount * hitChance;
    const autoWounds = parsedDiceCount * poisonedAutoWoundChance;
    const hitsToWound = parsedDiceCount * nonPoisonHitChance;
    const successfulWounds = autoWounds + hitsToWound * woundChance;
    const failedArmorSaves = successfulWounds * (1 - armorSaveChance);
    const mitigationAllowed = parsedMitigationRoll > 1 &&
      parsedMitigationRoll <= 6 &&
      !(shootingDamageMitigationType === 'feelNoPain'
        && parsedTargetToughness > 0
        && parsedHitStrength >= parsedTargetToughness * 2) &&
      !(shootingDamageMitigationType === 'shrouded' && shootingNoCover);
    const mitigationChance = mitigationAllowed
      ? getFaceProbabilitiesWithReroll(parsedMitigationRoll, shootingRerollMitigation).successChance
      : 0;
    const effectiveSaveChance = Math.max(wardSaveChance, mitigationChance);
    const failedWardSaves = failedArmorSaves * (1 - effectiveSaveChance);
    const multipleWoundsMultiplier = parsedMultipleWounds
      ? (parsedMultipleWounds.type === 'dice'
        ? (parsedMultipleWounds.sides + 1) / 2
        : parsedMultipleWounds.value)
      : 1;
    const finalDamage = failedWardSaves * multipleWoundsMultiplier;

    setShootingProbabilityResults({
      successfulHits: parseFloat(successfulHits.toFixed(2)),
      successfulWounds: parseFloat(successfulWounds.toFixed(2)),
      poisonedAutoWounds: parseFloat(autoWounds.toFixed(2)),
      failedArmorSaves: parseFloat(failedArmorSaves.toFixed(2)),
      failedWardSaves: parseFloat(failedWardSaves.toFixed(2)),
      finalDamage: parseFloat(finalDamage.toFixed(2)),
    });
    setShootingDebug({
      hitInitialRolls: [],
      hitRerollRolls: [],
      woundInitialRolls: [],
      woundRerollRolls: [],
      penetrationTotals: [],
      penetrationMaxDice: [],
      rendingBonusRolls: [],
      armorInitialRolls: [],
      armorRerollRolls: [],
      wardInitialRolls: [],
      wardRerollRolls: [],
      multipleWoundsRolls: [],
      penetrationDamageRolls: [],
      deflagrateHits: 0,
      deflagrateExtraWounds: 0,
      rendingWounds: 0,
      breachingWounds: 0,
      murderousWounds: 0,
    });
    setHasShootingProbabilityResults(true);
  };

  const handleShootingThrowCalculate = () => {
    const parsedDiceCount = Number.parseInt(shootingDiceCount, 10);
    const parsedBallisticSkill = Number.parseInt(ballisticSkill, 10);
    const parsedHitStrength = Number.parseInt(shootingHitStrength, 10);
    const parsedTargetToughness = Number.parseInt(shootingTargetToughness, 10);
    const parsedTargetWounds = Number.parseInt(shootingTargetWounds, 10);
    const parsedTargetArmorValue = shootingTargetArmorValue.trim() === ''
      ? 0
      : Number.parseInt(shootingTargetArmorValue, 10);
    const parsedArmorPenetration = shootingArmorPenetration.trim() === ''
      ? Number.NaN
      : Number.parseInt(shootingArmorPenetration, 10);
    const parsedArmorSave = shootingArmorSave.trim() === ''
      ? 0
      : Number.parseInt(shootingArmorSave, 10);
    const parsedWardSave = shootingWardSave.trim() === ''
      ? 0
      : Number.parseInt(shootingWardSave, 10);
    const parsedMitigationRoll = shootingDamageMitigationRoll.trim() === ''
      ? 0
      : Number.parseInt(shootingDamageMitigationRoll, 10);
    const resultNeeded = getShootingResultNeeded();
    const parsedMultipleWounds = shootingMultipleWoundsEnabled
      ? parseMultipleWoundsValue(shootingMultipleWoundsValue)
      : null;

    setShootingErrorMessage('');
    if (gameSystem === 'hh2') {
      if (
        Number.isNaN(parsedDiceCount) ||
        parsedDiceCount <= 0 ||
        Number.isNaN(parsedBallisticSkill)
      ) {
        setShootingErrorMessage('Devi inserire un risultato di dado');
        return;
      }
      if (
        shootingTargetType === 'living' &&
        (Number.isNaN(parsedHitStrength) ||
          Number.isNaN(parsedTargetToughness) ||
          Number.isNaN(parsedTargetWounds) ||
          parsedTargetWounds <= 0)
      ) {
        setShootingErrorMessage('Devi inserire un risultato di dado');
        return;
      }
      const hitInitialRolls: number[] = [];
      const hitRerollRolls: number[] = [];
      let hitSuccesses = 0;
      for (let i = 0; i < parsedDiceCount; i += 1) {
        const result = rollHh2Hit(parsedBallisticSkill, shootingRerollHit, {
          nightFighting: shootingNightFighting,
        });
        hitInitialRolls.push(result.roll);
        if (result.reroll !== null) {
          hitRerollRolls.push(result.reroll);
        }
        if (result.success) {
          hitSuccesses += 1;
        }
      }
      if (shootingTargetType === 'vehicle') {
        const woundInitialRolls: number[] = [];
        const woundRerollRolls: number[] = [];
        const penetrationTotals: number[] = [];
        const penetrationMaxDice: number[] = [];
        const rendingBonusRolls: number[] = [];
        let glancingHits = 0;
        let penetratingHits = 0;
        let crewShaken = 0;
        let crewStunned = 0;
        let weaponDestroyed = 0;
        let immobilised = 0;
        let explodes = 0;
        let rendingWounds = 0;
        const penetrationDamageRolls: number[] = [];
        const penetrationModifier = parsedArmorPenetration === 1
          ? 2
          : parsedArmorPenetration === 2
            ? 1
            : 0;
        const effectiveArmorValue = shootingLance
          ? Math.min(parsedTargetArmorValue, 12)
          : parsedTargetArmorValue;
        const maxPenetrationRoll = shootingMelta ? 12 : 6;
        const woundSpecificValues = new Set(
          parseSpecificValuesWithMax(shootingRerollWound.specificValues, maxPenetrationRoll),
        );
        const rendingValue = shootingRendingEnabled
          ? Number.parseInt(shootingRendingValue, 10)
          : null;
        if (shootingRendingEnabled && (!Number.isFinite(rendingValue) || rendingValue! < 1 || rendingValue! > 6)) {
          setShootingErrorMessage('Devi inserire un risultato di dado');
          return;
        }
        const rollPenetrationDice = () => {
          if (shootingMelta) {
            const dieA = Math.floor(Math.random() * 6) + 1;
            const dieB = Math.floor(Math.random() * 6) + 1;
            return { roll: dieA + dieB, maxDie: Math.max(dieA, dieB) };
          }
          const die = Math.floor(Math.random() * 6) + 1;
          return { roll: die, maxDie: die };
        };
        for (let i = 0; i < hitSuccesses; i += 1) {
          let rollResult = rollPenetrationDice();
          woundInitialRolls.push(rollResult.roll);
          penetrationMaxDice.push(rollResult.maxDie);
          let rendingTriggered = shootingRendingEnabled &&
            rendingValue !== null &&
            rollResult.maxDie >= rendingValue;
          let rendingBonus = rendingTriggered ? Math.floor(Math.random() * 3) + 1 : 0;
          let finalSum = rollResult.roll + parsedHitStrength + rendingBonus;
          let isSuccess = finalSum >= effectiveArmorValue;
          if (shouldRerollValue(rollResult.roll, isSuccess, shootingRerollWound, woundSpecificValues)) {
            rollResult = rollPenetrationDice();
            woundRerollRolls.push(rollResult.roll);
            penetrationMaxDice[penetrationMaxDice.length - 1] = rollResult.maxDie;
            rendingTriggered = shootingRendingEnabled &&
              rendingValue !== null &&
              rollResult.maxDie >= rendingValue;
            rendingBonus = rendingTriggered ? Math.floor(Math.random() * 3) + 1 : 0;
            finalSum = rollResult.roll + parsedHitStrength + rendingBonus;
          }
          rendingBonusRolls.push(rendingBonus);
          if (finalSum === effectiveArmorValue) {
            glancingHits += 1;
          } else if (finalSum > effectiveArmorValue) {
            penetratingHits += 1;
            const damageRoll = Math.floor(Math.random() * 6) + 1;
            penetrationDamageRolls.push(damageRoll);
            const total = damageRoll + penetrationModifier;
            if (total <= 3) {
              crewShaken += 1;
            } else if (total === 4) {
              crewStunned += 1;
            } else if (total === 5) {
              weaponDestroyed += 1;
            } else if (total === 6) {
              immobilised += 1;
            } else {
              explodes += 1;
            }
          }
          if (rendingTriggered) {
            rendingWounds += 1;
          }
          penetrationTotals.push(finalSum);
        }
        const totalHits = glancingHits + penetratingHits;
        setShootingThrowResults({
          successfulHits: hitSuccesses,
          successfulWounds: totalHits,
          poisonedAutoWounds: 0,
          failedArmorSaves: 0,
          failedWardSaves: 0,
          finalDamage: totalHits,
          glancingHits,
          penetratingHits,
          crewShaken,
          crewStunned,
          weaponDestroyed,
          immobilised,
          explodes,
        });
        setShootingDebug({
          hitInitialRolls,
          hitRerollRolls,
          woundInitialRolls,
          woundRerollRolls,
          penetrationTotals,
          penetrationMaxDice,
          rendingBonusRolls,
          armorInitialRolls: [],
          armorRerollRolls: [],
          wardInitialRolls: [],
          wardRerollRolls: [],
          multipleWoundsRolls: [],
          penetrationDamageRolls,
          deflagrateHits: 0,
          deflagrateExtraWounds: 0,
          rendingWounds,
          breachingWounds: 0,
          murderousWounds: 0,
        });
        setHasShootingThrowResults(true);
        return;
      }
      const breachingValue = shootingBreachingEnabled
        ? Number.parseInt(shootingBreachingValue, 10)
        : null;
      const rendingValue = shootingRendingEnabled
        ? Number.parseInt(shootingRendingValue, 10)
        : null;
      const murderousValue = shootingMurderousEnabled
        ? Number.parseInt(shootingMurderousValue, 10)
        : null;
      if (
        (shootingBreachingEnabled && (!Number.isFinite(breachingValue) || breachingValue! < 1 || breachingValue! > 6)) ||
        (shootingRendingEnabled && (!Number.isFinite(rendingValue) || rendingValue! < 1 || rendingValue! > 6)) ||
        (shootingMurderousEnabled && (!Number.isFinite(murderousValue) || murderousValue! < 1 || murderousValue! > 6))
      ) {
        setShootingErrorMessage('Devi inserire un risultato di dado');
        return;
      }
      const woundInitialRolls: number[] = [];
      const woundRerollRolls: number[] = [];
      const armorInitialRolls: number[] = [];
      const armorRerollRolls: number[] = [];
      const wardInitialRolls: number[] = [];
      const wardRerollRolls: number[] = [];
      const woundProfile = getHh2WoundProfile(parsedHitStrength, parsedTargetToughness);
      const woundTarget = woundProfile.target ?? 0;
      const woundSpecificValues = new Set(parseSpecificValues(shootingRerollWound.specificValues));
      const armorSpecificValues = new Set(parseSpecificValues(shootingRerollArmor.specificValues));
      const wardSpecificValues = new Set(parseSpecificValues(shootingRerollWard.specificValues));
      const hasArmorSave = shootingArmorSave.trim() !== '';
      const armorBlocked = Number.isFinite(parsedArmorPenetration) &&
        parsedArmorPenetration > 0 &&
        parsedArmorPenetration <= parsedArmorSave;
      let failedArmorSaves = 0;
      let failedInvulnerableSaves = 0;
      let normalUnsaved = 0;
      let instantUnsaved = 0;
      let successfulWounds = 0;
      let rendingWounds = 0;
      let breachingWounds = 0;
      let murderousWounds = 0;
      const instantDeathActive = shootingInstantDeath || parsedHitStrength >= parsedTargetToughness * 2;
      const resolveSave = (isInstant: boolean, isAp2: boolean) => {
        let armorFailed = true;
        if (hasArmorSave && !isAp2 && !armorBlocked && parsedArmorSave > 1 && parsedArmorSave <= 6) {
          let roll = Math.floor(Math.random() * 6) + 1;
          armorInitialRolls.push(roll);
          let isSuccess = roll >= parsedArmorSave;
          if (shouldRerollValue(roll, isSuccess, shootingRerollArmor, armorSpecificValues)) {
            roll = Math.floor(Math.random() * 6) + 1;
            armorRerollRolls.push(roll);
            isSuccess = roll >= parsedArmorSave;
          }
          armorFailed = !isSuccess;
        }
        if (armorFailed) {
          failedArmorSaves += 1;
          const invulnerableAllowed = parsedWardSave > 1 && parsedWardSave <= 6;
          const mitigationAllowed = parsedMitigationRoll > 1 &&
            parsedMitigationRoll <= 6 &&
            !(shootingDamageMitigationType === 'feelNoPain' && isInstant) &&
            !(shootingDamageMitigationType === 'shrouded' && shootingNoCover);
          const effectiveSaveTarget = invulnerableAllowed && mitigationAllowed
            ? Math.min(parsedWardSave, parsedMitigationRoll)
            : (invulnerableAllowed ? parsedWardSave : (mitigationAllowed ? parsedMitigationRoll : null));
          const useWardReroll = invulnerableAllowed && (!mitigationAllowed || parsedWardSave <= parsedMitigationRoll);
          if (effectiveSaveTarget !== null) {
            let roll = Math.floor(Math.random() * 6) + 1;
            wardInitialRolls.push(roll);
            let isSuccess = roll >= effectiveSaveTarget;
            const rerollConfig = useWardReroll ? shootingRerollWard : shootingRerollMitigation;
            const rerollSpecificValues = useWardReroll
              ? wardSpecificValues
              : new Set(parseSpecificValues(shootingRerollMitigation.specificValues));
            if (shouldRerollValue(roll, isSuccess, rerollConfig, rerollSpecificValues)) {
              roll = Math.floor(Math.random() * 6) + 1;
              wardRerollRolls.push(roll);
              isSuccess = roll >= effectiveSaveTarget;
            }
            if (!isSuccess) {
              failedInvulnerableSaves += 1;
              if (isInstant) {
                instantUnsaved += 1;
              } else {
                normalUnsaved += 1;
              }
            }
          } else {
            failedInvulnerableSaves += 1;
            if (isInstant) {
              instantUnsaved += 1;
            } else {
              normalUnsaved += 1;
            }
          }
        }
      };
      if (!woundProfile.impossible && woundTarget > 0) {
        for (let i = 0; i < hitSuccesses; i += 1) {
          let roll = Math.floor(Math.random() * 6) + 1;
          woundInitialRolls.push(roll);
          let isRending = shootingRendingEnabled && rendingValue !== null && roll >= rendingValue;
          let isSuccess = isRending || roll >= woundTarget;
          if (shouldRerollValue(roll, isSuccess, shootingRerollWound, woundSpecificValues)) {
            roll = Math.floor(Math.random() * 6) + 1;
            woundRerollRolls.push(roll);
            isRending = shootingRendingEnabled && rendingValue !== null && roll >= rendingValue;
            isSuccess = isRending || roll >= woundTarget;
          }
          if (!isSuccess) {
            continue;
          }
          successfulWounds += 1;
          const isBreaching = shootingBreachingEnabled && breachingValue !== null && roll >= breachingValue;
          const isAp2 = isRending || isBreaching;
          const isInstant = instantDeathActive
            || (shootingMurderousEnabled && murderousValue !== null && roll >= murderousValue);
          if (isRending) {
            rendingWounds += 1;
          }
          if (isBreaching) {
            breachingWounds += 1;
          }
          if (shootingMurderousEnabled && murderousValue !== null && roll >= murderousValue) {
            murderousWounds += 1;
          }
          resolveSave(isInstant, isAp2);
        }
      }
      let deflagrateHits = 0;
      let deflagrateExtraWounds = 0;
      if (shootingDeflagrate) {
        const baseUnsaved = normalUnsaved + instantUnsaved;
        deflagrateHits = baseUnsaved;
        for (let i = 0; i < deflagrateHits; i += 1) {
          let roll = Math.floor(Math.random() * 6) + 1;
          let isRending = shootingRendingEnabled && rendingValue !== null && roll >= rendingValue;
          let isSuccess = isRending || roll >= woundTarget;
          if (shouldRerollValue(roll, isSuccess, shootingRerollWound, woundSpecificValues)) {
            roll = Math.floor(Math.random() * 6) + 1;
            isRending = shootingRendingEnabled && rendingValue !== null && roll >= rendingValue;
            isSuccess = isRending || roll >= woundTarget;
          }
          if (!isSuccess) {
            continue;
          }
          const isBreaching = shootingBreachingEnabled && breachingValue !== null && roll >= breachingValue;
          const isAp2 = isRending || isBreaching;
          const isInstant = instantDeathActive
            || (shootingMurderousEnabled && murderousValue !== null && roll >= murderousValue);
          resolveSave(isInstant, isAp2);
        }
        deflagrateExtraWounds = (normalUnsaved + instantUnsaved) - baseUnsaved;
      }
      const totalUnsaved = normalUnsaved + instantUnsaved;
      let finalDamage = totalUnsaved;
      let modelsRemoved = 0;
      if (instantDeathActive || shootingMurderousEnabled) {
        if (shootingAtomanticShield) {
          finalDamage = normalUnsaved;
          for (let i = 0; i < instantUnsaved; i += 1) {
            finalDamage += Math.floor(Math.random() * 3) + 1;
          }
          modelsRemoved = Math.floor(finalDamage / parsedTargetWounds);
        } else {
          finalDamage = normalUnsaved + instantUnsaved * parsedTargetWounds;
          modelsRemoved = normalUnsaved / parsedTargetWounds + instantUnsaved;
        }
      } else {
        finalDamage = totalUnsaved;
        modelsRemoved = Math.floor(finalDamage / parsedTargetWounds);
      }
      setShootingThrowResults({
        successfulHits: hitSuccesses,
        successfulWounds: successfulWounds,
        poisonedAutoWounds: 0,
        failedArmorSaves,
        failedWardSaves: failedInvulnerableSaves,
        finalDamage,
        modelsRemoved,
      });
      setShootingDebug({
        hitInitialRolls,
        hitRerollRolls,
        woundInitialRolls,
        woundRerollRolls,
        penetrationTotals: [],
        penetrationMaxDice: [],
        rendingBonusRolls: [],
        armorInitialRolls,
        armorRerollRolls,
        wardInitialRolls,
        wardRerollRolls,
        multipleWoundsRolls: [],
        penetrationDamageRolls: [],
        deflagrateHits,
        deflagrateExtraWounds,
        rendingWounds,
        breachingWounds,
        murderousWounds,
      });
      setHasShootingThrowResults(true);
      return;
    }

    if (
      Number.isNaN(parsedDiceCount) ||
      parsedDiceCount <= 0 ||
      Number.isNaN(parsedHitStrength) ||
      Number.isNaN(parsedTargetToughness) ||
      Number.isNaN(parsedArmorSave) ||
      Number.isNaN(parsedWardSave) ||
      Number.isNaN(resultNeeded) ||
      (shootingMultipleWoundsEnabled && !parsedMultipleWounds)
    ) {
      setShootingErrorMessage('Devi inserire un risultato di dado');
      return;
    }
    const rolls = Array.from({ length: parsedDiceCount }, () => Math.floor(Math.random() * 6) + 1);
    let hitSuccesses = 0;
    let poisonedAutoWounds = 0;
    let nonPoisonHits = 0;
    let hitRerollRolls: number[] = [];

    if (resultNeeded >= 10) {
      setShootingThrowResults({
        successfulHits: 0,
        successfulWounds: 0,
        poisonedAutoWounds: 0,
        failedArmorSaves: 0,
        failedWardSaves: 0,
        finalDamage: 0,
      });
      setShootingDebug({
        hitInitialRolls: rolls,
        hitRerollRolls: [],
        woundInitialRolls: [],
        woundRerollRolls: [],
        penetrationTotals: [],
        penetrationMaxDice: [],
        rendingBonusRolls: [],
        armorInitialRolls: [],
        armorRerollRolls: [],
        wardInitialRolls: [],
        wardRerollRolls: [],
        multipleWoundsRolls: [],
        penetrationDamageRolls: [],
        deflagrateHits: 0,
        deflagrateExtraWounds: 0,
        rendingWounds: 0,
        breachingWounds: 0,
        murderousWounds: 0,
      });
      setHasShootingThrowResults(true);
      return;
    }

    if (shootingAutoHit) {
      hitSuccesses = parsedDiceCount;
    } else if (resultNeeded <= 6) {
      const hitRerollResult = applyRerollWithDebug(rolls, resultNeeded, shootingRerollHit);
      const rerolledHits = hitRerollResult.finalRolls;
      hitRerollRolls = hitRerollResult.rerollRolls;
      poisonedAutoWounds = shootingPoisonedAttack
        ? rerolledHits.filter((roll) => roll === 6).length
        : 0;
      nonPoisonHits = shootingPoisonedAttack
        ? rerolledHits.filter((roll) => roll >= resultNeeded && roll !== 6).length
        : rerolledHits.filter((roll) => roll >= resultNeeded).length;
      hitSuccesses = poisonedAutoWounds + nonPoisonHits;
    } else {
      const followUpTarget = resultNeeded - 3;
      const specificValues = new Set(parseSpecificValues(shootingRerollHit.specificValues));
      rolls.forEach((roll) => {
        let initialRoll = roll;
        let followUpRoll = 0;
        if (initialRoll === 6) {
          followUpRoll = Math.floor(Math.random() * 6) + 1;
        }
        let attemptSuccess = initialRoll === 6 && followUpRoll >= followUpTarget;
        const shouldReroll = shouldRerollValue(
          initialRoll,
          attemptSuccess,
          shootingRerollHit,
          specificValues,
        );
        if (shouldReroll) {
          initialRoll = Math.floor(Math.random() * 6) + 1;
          hitRerollRolls.push(initialRoll);
          followUpRoll = initialRoll === 6 ? Math.floor(Math.random() * 6) + 1 : 0;
          attemptSuccess = initialRoll === 6 && followUpRoll >= followUpTarget;
        }
        if (attemptSuccess) {
          hitSuccesses += 1;
        }
      });
    }

    const woundTarget = getWoundTarget(parsedHitStrength, parsedTargetToughness);
    const woundInitialRolls = Array.from({ length: nonPoisonHits || hitSuccesses }, () => Math.floor(Math.random() * 6) + 1);
    const woundRerollResult = applyRerollWithDebug(woundInitialRolls, woundTarget, shootingRerollWound);
    const woundRolls = woundRerollResult.finalRolls;
    const woundSuccesses = woundRolls.filter((roll) => roll >= woundTarget).length;
    const totalWounds = shootingPoisonedAttack && resultNeeded <= 6 && !shootingAutoHit
      ? poisonedAutoWounds + woundSuccesses
      : woundSuccesses;

    const hasArmorSave = shootingArmorSave.trim() !== '';
    const effectiveArmorSave = parsedArmorSave + (parsedHitStrength - 3);
    let failedArmorSaves = totalWounds;
    let armorRolls: number[] = [];
    let armorInitialRolls: number[] = [];
    let armorRerollRolls: number[] = [];
    if (hasArmorSave && effectiveArmorSave > 1 && effectiveArmorSave <= 6) {
      armorInitialRolls = Array.from({ length: totalWounds }, () => Math.floor(Math.random() * 6) + 1);
      const armorRerollResult = applyRerollWithDebug(armorInitialRolls, effectiveArmorSave, shootingRerollArmor);
      armorRerollRolls = armorRerollResult.rerollRolls;
      armorRolls = armorRerollResult.finalRolls;
      const armorSuccesses = armorRolls.filter((roll) => roll >= effectiveArmorSave).length;
      failedArmorSaves = totalWounds - armorSuccesses;
    }

    let failedWardSaves = failedArmorSaves;
    let wardRolls: number[] = [];
    let wardInitialRolls: number[] = [];
    let wardRerollRolls: number[] = [];
    const mitigationAllowed = parsedMitigationRoll > 1 &&
      parsedMitigationRoll <= 6 &&
      !(shootingDamageMitigationType === 'feelNoPain'
        && parsedTargetToughness > 0
        && parsedHitStrength >= parsedTargetToughness * 2) &&
      !(shootingDamageMitigationType === 'shrouded' && shootingNoCover);
    const mitigationTarget = mitigationAllowed ? parsedMitigationRoll : null;
    const wardTarget = parsedWardSave > 1 && parsedWardSave <= 6 ? parsedWardSave : null;
    const effectiveSaveTarget = wardTarget !== null && mitigationTarget !== null
      ? Math.min(wardTarget, mitigationTarget)
      : (wardTarget ?? mitigationTarget);
    const useWardReroll = wardTarget !== null && (mitigationTarget === null || wardTarget <= mitigationTarget);
    if (effectiveSaveTarget !== null) {
      wardInitialRolls = Array.from({ length: failedArmorSaves }, () => Math.floor(Math.random() * 6) + 1);
      const wardRerollResult = applyRerollWithDebug(
        wardInitialRolls,
        effectiveSaveTarget,
        useWardReroll ? shootingRerollWard : shootingRerollMitigation,
      );
      wardRerollRolls = wardRerollResult.rerollRolls;
      wardRolls = wardRerollResult.finalRolls;
      const wardSuccesses = wardRolls.filter((roll) => roll >= effectiveSaveTarget).length;
      failedWardSaves = failedArmorSaves - wardSuccesses;
    }

    let finalDamage = failedWardSaves;
    let multipleWoundsRolls: number[] = [];
    if (parsedMultipleWounds) {
      if (parsedMultipleWounds.type === 'fixed') {
        finalDamage = failedWardSaves * parsedMultipleWounds.value;
      } else {
        multipleWoundsRolls = Array.from({ length: failedWardSaves }, () => Math.floor(Math.random() * parsedMultipleWounds.sides) + 1);
        finalDamage = multipleWoundsRolls.reduce((sum, roll) => sum + roll, 0);
      }
    }

    setShootingThrowResults({
      successfulHits: hitSuccesses,
      successfulWounds: totalWounds,
      poisonedAutoWounds: shootingPoisonedAttack && resultNeeded <= 6 && !shootingAutoHit ? poisonedAutoWounds : 0,
      failedArmorSaves,
      failedWardSaves,
      finalDamage,
    });
    setShootingDebug({
      hitInitialRolls: rolls,
      hitRerollRolls,
      woundInitialRolls,
      woundRerollRolls: woundRerollResult.rerollRolls,
      penetrationTotals: [],
      penetrationMaxDice: [],
      rendingBonusRolls: [],
      armorInitialRolls,
      armorRerollRolls,
      wardInitialRolls,
      wardRerollRolls,
      multipleWoundsRolls,
      penetrationDamageRolls: [],
      deflagrateHits: 0,
      deflagrateExtraWounds: 0,
      rendingWounds: 0,
      breachingWounds: 0,
      murderousWounds: 0,
    });
    setHasShootingThrowResults(true);
  };

  const handleHh2CombatAverageCalculate = () => {
    const parsedDiceCount = Number.parseInt(diceCount, 10);
    const parsedAttackersAc = Number.parseInt(attackersAc, 10);
    const parsedDefendersAc = Number.parseInt(defendersAc, 10);
    const parsedHitStrength = Number.parseInt(throwHitStrength, 10);
    const parsedTargetToughness = Number.parseInt(targetToughness, 10);
    const parsedTargetWounds = Number.parseInt(combatTargetWounds, 10);
    const parsedTargetArmorValue = combatTargetArmorValue.trim() === ''
      ? 0
      : Number.parseInt(combatTargetArmorValue, 10);
    const parsedArmorSave = throwArmorSave.trim() === ''
      ? 0
      : Number.parseInt(throwArmorSave, 10);
    const parsedWardSave = throwWardSave.trim() === ''
      ? 0
      : Number.parseInt(throwWardSave, 10);

    setErrorMessage('');
    if (
      Number.isNaN(parsedDiceCount) ||
      parsedDiceCount <= 0 ||
      Number.isNaN(parsedAttackersAc) ||
      Number.isNaN(parsedDefendersAc) ||
      Number.isNaN(parsedHitStrength)
    ) {
      setErrorMessage('Devi inserire un risultato di dado');
      return;
    }
    if (
      combatTargetType === 'living' &&
      (Number.isNaN(parsedTargetToughness) ||
        Number.isNaN(parsedTargetWounds) ||
        parsedTargetWounds <= 0)
    ) {
      setErrorMessage('Devi inserire un risultato di dado');
      return;
    }
    if (combatTargetType === 'vehicle' && Number.isNaN(parsedTargetArmorValue)) {
      setErrorMessage('Devi inserire un risultato di dado');
      return;
    }

    const hitTarget = getHitTarget(parsedAttackersAc, parsedDefendersAc);
    const hitChance = getFaceProbabilitiesWithReroll(hitTarget, combatRerollHit).successChance;
    const successfulHits = parsedDiceCount * hitChance;

      if (combatTargetType === 'vehicle') {
        const { glancingChance, penetratingChance } = getPenetrationChances(
          parsedHitStrength,
          parsedTargetArmorValue,
          combatRerollWound,
          false,
          null,
        );
      const glancingHits = successfulHits * glancingChance;
      const penetratingHits = successfulHits * penetratingChance;
      const totalHits = glancingHits + penetratingHits;
      setResults({
        successfulHits: parseFloat(successfulHits.toFixed(2)),
        successfulWounds: parseFloat(totalHits.toFixed(2)),
        poisonedAutoWounds: 0,
        failedArmorSaves: 0,
        failedWardSaves: 0,
        finalDamage: parseFloat(totalHits.toFixed(2)),
        glancingHits: parseFloat(glancingHits.toFixed(2)),
        penetratingHits: parseFloat(penetratingHits.toFixed(2)),
      });
      setHasResults(true);
      return;
    }

    const breachingValue = combatBreachingEnabled
      ? Number.parseInt(combatBreachingValue, 10)
      : null;
    const rendingValue = combatRendingEnabled
      ? Number.parseInt(combatRendingValue, 10)
      : null;
    const murderousValue = combatMurderousEnabled
      ? Number.parseInt(combatMurderousValue, 10)
      : null;
    if (
      (combatBreachingEnabled && (!Number.isFinite(breachingValue) || breachingValue! < 1 || breachingValue! > 6)) ||
      (combatRendingEnabled && (!Number.isFinite(rendingValue) || rendingValue! < 1 || rendingValue! > 6)) ||
      (combatMurderousEnabled && (!Number.isFinite(murderousValue) || murderousValue! < 1 || murderousValue! > 6))
    ) {
      setErrorMessage('Devi inserire un risultato di dado');
      return;
    }
    const woundTarget = getWoundTarget(parsedHitStrength, parsedTargetToughness);
    const woundChances = getWoundCategoryChances(woundTarget, combatRerollWound, {
      breachingValue,
      rendingValue,
      murderousValue,
    });
    const instantDeathActive = combatInstantDeath || parsedHitStrength >= parsedTargetToughness * 2;
    const effectiveChances = instantDeathActive
      ? {
        normalChance: 0,
        normalAp2Chance: 0,
        instantChance: woundChances.normalChance + woundChances.instantChance,
        instantAp2Chance: woundChances.normalAp2Chance + woundChances.instantAp2Chance,
      }
      : woundChances;
    const normalWounds = successfulHits * (effectiveChances.normalChance + effectiveChances.normalAp2Chance);
    const normalAp2Wounds = successfulHits * effectiveChances.normalAp2Chance;
    const instantWounds = successfulHits * effectiveChances.instantChance;
    const instantAp2Wounds = successfulHits * effectiveChances.instantAp2Chance;
    const successfulWounds = successfulHits * (
      effectiveChances.normalChance
      + effectiveChances.normalAp2Chance
      + effectiveChances.instantChance
      + effectiveChances.instantAp2Chance
    );
    const hasArmorSave = throwArmorSave.trim() !== '';
    const armorSaveChance = hasArmorSave && parsedArmorSave > 1 && parsedArmorSave <= 6
      ? getFaceProbabilitiesWithReroll(parsedArmorSave, combatRerollArmor).successChance
      : 0;
    const wardSaveChance = parsedWardSave > 1 && parsedWardSave <= 6
      ? getFaceProbabilitiesWithReroll(parsedWardSave, combatRerollWard).successChance
      : 0;
    const failedArmorNormal = (normalWounds - normalAp2Wounds) * (1 - armorSaveChance) + normalAp2Wounds;
    const failedArmorInstant = (instantWounds - instantAp2Wounds) * (1 - armorSaveChance) + instantAp2Wounds;
    const failedNormal = failedArmorNormal * (1 - wardSaveChance);
    const failedInstant = failedArmorInstant * (1 - wardSaveChance);
    const failedArmorSaves = failedArmorNormal + failedArmorInstant;
    const failedWardSaves = failedNormal + failedInstant;
    let finalDamage = failedWardSaves;
    let modelsRemoved = 0;
    if (instantDeathActive || combatMurderousEnabled) {
      if (parsedTargetWounds > 0) {
        finalDamage = failedNormal + failedInstant * parsedTargetWounds;
        modelsRemoved = failedNormal / parsedTargetWounds + failedInstant;
      }
    } else if (parsedTargetWounds > 0) {
      modelsRemoved = finalDamage / parsedTargetWounds;
    }
    if (combatDeflagrate && failedWardSaves > 0) {
      const deflagrateHits = failedWardSaves;
      const deflagrateNormal = deflagrateHits * (effectiveChances.normalChance + effectiveChances.normalAp2Chance);
      const deflagrateNormalAp2 = deflagrateHits * effectiveChances.normalAp2Chance;
      const deflagrateInstant = deflagrateHits * (effectiveChances.instantChance + effectiveChances.instantAp2Chance);
      const deflagrateInstantAp2 = deflagrateHits * effectiveChances.instantAp2Chance;
      const deflagrateFailedNormal = (deflagrateNormal - deflagrateNormalAp2) * (1 - armorSaveChance) + deflagrateNormalAp2;
      const deflagrateFailedInstant = (deflagrateInstant - deflagrateInstantAp2) * (1 - armorSaveChance) + deflagrateInstantAp2;
      const deflagrateNormalFinal = deflagrateFailedNormal * (1 - wardSaveChance);
      const deflagrateInstantFinal = deflagrateFailedInstant * (1 - wardSaveChance);
      if (instantDeathActive || combatMurderousEnabled) {
        if (parsedTargetWounds > 0) {
          finalDamage += deflagrateNormalFinal + deflagrateInstantFinal * parsedTargetWounds;
        }
      } else {
        finalDamage += deflagrateNormalFinal + deflagrateInstantFinal;
      }
    }

    setResults({
      successfulHits: parseFloat(successfulHits.toFixed(2)),
      successfulWounds: parseFloat(successfulWounds.toFixed(2)),
      poisonedAutoWounds: 0,
      failedArmorSaves: parseFloat(failedArmorSaves.toFixed(2)),
      failedWardSaves: parseFloat(failedWardSaves.toFixed(2)),
      finalDamage: parseFloat(finalDamage.toFixed(2)),
      modelsRemoved: parseFloat(modelsRemoved.toFixed(2)),
    });
    setHasResults(true);
  };

  const handleHh2CombatThrowCalculate = () => {
    const parsedDiceCount = Number.parseInt(diceCount, 10);
    const parsedAttackersAc = Number.parseInt(attackersAc, 10);
    const parsedDefendersAc = Number.parseInt(defendersAc, 10);
    const parsedHitStrength = Number.parseInt(throwHitStrength, 10);
    const parsedTargetToughness = Number.parseInt(targetToughness, 10);
    const parsedTargetWounds = Number.parseInt(combatTargetWounds, 10);
    const parsedTargetArmorValue = combatTargetArmorValue.trim() === ''
      ? 0
      : Number.parseInt(combatTargetArmorValue, 10);
    const parsedArmorSave = throwArmorSave.trim() === ''
      ? 0
      : Number.parseInt(throwArmorSave, 10);
    const parsedWardSave = throwWardSave.trim() === ''
      ? 0
      : Number.parseInt(throwWardSave, 10);

    setErrorMessage('');
    if (
      Number.isNaN(parsedDiceCount) ||
      parsedDiceCount <= 0 ||
      Number.isNaN(parsedAttackersAc) ||
      Number.isNaN(parsedDefendersAc) ||
      Number.isNaN(parsedHitStrength)
    ) {
      setErrorMessage('Devi inserire un risultato di dado');
      return;
    }
    if (
      combatTargetType === 'living' &&
      (Number.isNaN(parsedTargetToughness) ||
        Number.isNaN(parsedTargetWounds) ||
        parsedTargetWounds <= 0)
    ) {
      setErrorMessage('Devi inserire un risultato di dado');
      return;
    }
    if (combatTargetType === 'vehicle' && Number.isNaN(parsedTargetArmorValue)) {
      setErrorMessage('Devi inserire un risultato di dado');
      return;
    }

    const hitTarget = getHitTarget(parsedAttackersAc, parsedDefendersAc);
    const hitInitialRolls = Array.from({ length: parsedDiceCount }, () => Math.floor(Math.random() * 6) + 1);
    const hitRerollResult = applyRerollWithDebug(hitInitialRolls, hitTarget, combatRerollHit);
    const hitRolls = hitRerollResult.finalRolls;
    const hitSuccesses = hitRolls.filter((roll) => roll >= hitTarget).length;

    if (combatTargetType === 'vehicle') {
      const woundInitialRolls: number[] = [];
      const woundRerollRolls: number[] = [];
      let glancingHits = 0;
      let penetratingHits = 0;
      const maxPenetrationRoll = 6;
      const woundSpecificValues = new Set(
        parseSpecificValuesWithMax(combatRerollWound.specificValues, maxPenetrationRoll),
      );
      const rollPenetrationDie = () => Math.floor(Math.random() * 6) + 1;
      for (let i = 0; i < hitSuccesses; i += 1) {
        let roll = rollPenetrationDie();
        woundInitialRolls.push(roll);
        const sum = roll + parsedHitStrength;
        let isSuccess = sum >= parsedTargetArmorValue;
        if (shouldRerollValue(roll, isSuccess, combatRerollWound, woundSpecificValues)) {
          roll = rollPenetrationDie();
          woundRerollRolls.push(roll);
        }
        const finalSum = roll + parsedHitStrength;
        if (finalSum === parsedTargetArmorValue) {
          glancingHits += 1;
        } else if (finalSum > parsedTargetArmorValue) {
          penetratingHits += 1;
        }
      }
      const totalHits = glancingHits + penetratingHits;
      setThrowResults({
        successfulHits: hitSuccesses,
        successfulWounds: totalHits,
        poisonedAutoWounds: 0,
        failedArmorSaves: 0,
        failedWardSaves: 0,
        finalDamage: totalHits,
        glancingHits,
        penetratingHits,
      });
      setHasThrowResults(true);
      return;
    }

    const breachingValue = combatBreachingEnabled
      ? Number.parseInt(combatBreachingValue, 10)
      : null;
    const rendingValue = combatRendingEnabled
      ? Number.parseInt(combatRendingValue, 10)
      : null;
    const murderousValue = combatMurderousEnabled
      ? Number.parseInt(combatMurderousValue, 10)
      : null;
    if (
      (combatBreachingEnabled && (!Number.isFinite(breachingValue) || breachingValue! < 1 || breachingValue! > 6)) ||
      (combatRendingEnabled && (!Number.isFinite(rendingValue) || rendingValue! < 1 || rendingValue! > 6)) ||
      (combatMurderousEnabled && (!Number.isFinite(murderousValue) || murderousValue! < 1 || murderousValue! > 6))
    ) {
      setErrorMessage('Devi inserire un risultato di dado');
      return;
    }
    const woundTarget = getWoundTarget(parsedHitStrength, parsedTargetToughness);
    const woundSpecificValues = new Set(parseSpecificValues(combatRerollWound.specificValues));
    const armorSpecificValues = new Set(parseSpecificValues(combatRerollArmor.specificValues));
    const wardSpecificValues = new Set(parseSpecificValues(combatRerollWard.specificValues));
    const hasArmorSave = throwArmorSave.trim() !== '';
    let failedArmorSaves = 0;
    let failedWardSaves = 0;
    let normalUnsaved = 0;
    let instantUnsaved = 0;
    let successfulWounds = 0;
    const instantDeathActive = combatInstantDeath || parsedHitStrength >= parsedTargetToughness * 2;
    const resolveSave = (isInstant: boolean, isAp2: boolean) => {
      let armorFailed = true;
      if (hasArmorSave && !isAp2 && parsedArmorSave > 1 && parsedArmorSave <= 6) {
        let roll = Math.floor(Math.random() * 6) + 1;
        let isSuccess = roll >= parsedArmorSave;
        if (shouldRerollValue(roll, isSuccess, combatRerollArmor, armorSpecificValues)) {
          roll = Math.floor(Math.random() * 6) + 1;
          isSuccess = roll >= parsedArmorSave;
        }
        armorFailed = !isSuccess;
      }
      if (armorFailed) {
        failedArmorSaves += 1;
        if (parsedWardSave > 1 && parsedWardSave <= 6) {
          let roll = Math.floor(Math.random() * 6) + 1;
          let isSuccess = roll >= parsedWardSave;
          if (shouldRerollValue(roll, isSuccess, combatRerollWard, wardSpecificValues)) {
            roll = Math.floor(Math.random() * 6) + 1;
            isSuccess = roll >= parsedWardSave;
          }
          if (!isSuccess) {
            failedWardSaves += 1;
            if (isInstant) {
              instantUnsaved += 1;
            } else {
              normalUnsaved += 1;
            }
          }
        } else {
          failedWardSaves += 1;
          if (isInstant) {
            instantUnsaved += 1;
          } else {
            normalUnsaved += 1;
          }
        }
      }
    };
    for (let i = 0; i < hitSuccesses; i += 1) {
      let roll = Math.floor(Math.random() * 6) + 1;
      let isRending = combatRendingEnabled && rendingValue !== null && roll >= rendingValue;
      let isSuccess = isRending || roll >= woundTarget;
      if (shouldRerollValue(roll, isSuccess, combatRerollWound, woundSpecificValues)) {
        roll = Math.floor(Math.random() * 6) + 1;
        isRending = combatRendingEnabled && rendingValue !== null && roll >= rendingValue;
        isSuccess = isRending || roll >= woundTarget;
      }
      if (!isSuccess) {
        continue;
      }
      successfulWounds += 1;
      const isBreaching = combatBreachingEnabled && breachingValue !== null && roll >= breachingValue;
      const isAp2 = isRending || isBreaching;
      const isInstant = instantDeathActive
        || (combatMurderousEnabled && murderousValue !== null && roll >= murderousValue);
      resolveSave(isInstant, isAp2);
    }
    if (combatDeflagrate && normalUnsaved + instantUnsaved > 0) {
      const deflagrateHits = normalUnsaved + instantUnsaved;
      for (let i = 0; i < deflagrateHits; i += 1) {
        let roll = Math.floor(Math.random() * 6) + 1;
        let isRending = combatRendingEnabled && rendingValue !== null && roll >= rendingValue;
        let isSuccess = isRending || roll >= woundTarget;
        if (shouldRerollValue(roll, isSuccess, combatRerollWound, woundSpecificValues)) {
          roll = Math.floor(Math.random() * 6) + 1;
          isRending = combatRendingEnabled && rendingValue !== null && roll >= rendingValue;
          isSuccess = isRending || roll >= woundTarget;
        }
        if (!isSuccess) {
          continue;
        }
        const isBreaching = combatBreachingEnabled && breachingValue !== null && roll >= breachingValue;
        const isAp2 = isRending || isBreaching;
        const isInstant = instantDeathActive
          || (combatMurderousEnabled && murderousValue !== null && roll >= murderousValue);
        resolveSave(isInstant, isAp2);
      }
    }
    let finalDamage = normalUnsaved + instantUnsaved;
    let modelsRemoved = 0;
    if (instantDeathActive || combatMurderousEnabled) {
      if (parsedTargetWounds > 0) {
        finalDamage = normalUnsaved + instantUnsaved * parsedTargetWounds;
        modelsRemoved = normalUnsaved / parsedTargetWounds + instantUnsaved;
      }
    } else if (parsedTargetWounds > 0) {
      modelsRemoved = finalDamage / parsedTargetWounds;
    }

    setThrowResults({
      successfulHits: hitSuccesses,
      successfulWounds: successfulWounds,
      poisonedAutoWounds: 0,
      failedArmorSaves,
      failedWardSaves,
      finalDamage,
      modelsRemoved,
    });
    setHasThrowResults(true);
  };

  const handleThrowCalculate = () => {
    const parsedDiceCount = Number.parseInt(diceCount, 10);
    const parsedAttackersAc = Number.parseInt(attackersAc, 10);
    const parsedDefendersAc = Number.parseInt(defendersAc, 10);
    const parsedHitStrength = Number.parseInt(throwHitStrength, 10);
    const parsedTargetToughness = Number.parseInt(targetToughness, 10);
    const parsedThrowArmorSave = throwArmorSave.trim() === ''
      ? 0
      : Number.parseInt(throwArmorSave, 10);
    const parsedThrowWardSave = throwWardSave.trim() === ''
      ? 0
      : Number.parseInt(throwWardSave, 10);
    const parsedPredatoryCount = predatoryFighter
      ? Number.parseInt(predatoryFighterCount, 10)
      : 0;
    const parsedMultipleWounds = multipleWoundsEnabled
      ? parseMultipleWoundsValue(multipleWoundsValue)
      : null;

    if (
      Number.isNaN(parsedDiceCount) ||
      parsedDiceCount <= 0 ||
      Number.isNaN(parsedAttackersAc) ||
      Number.isNaN(parsedDefendersAc) ||
      Number.isNaN(parsedHitStrength) ||
      Number.isNaN(parsedTargetToughness) ||
      Number.isNaN(parsedThrowArmorSave) ||
      Number.isNaN(parsedThrowWardSave) ||
      Number.isNaN(parsedPredatoryCount) ||
      parsedPredatoryCount < 0 ||
      (multipleWoundsEnabled && !parsedMultipleWounds)
    ) {
      setErrorMessage('Devi inserire un risultato di dado');
      return;
    }

    setErrorMessage('');
    const hitTarget = getHitTarget(parsedAttackersAc, parsedDefendersAc);
    const hitInitialRolls = Array.from({ length: parsedDiceCount }, () => Math.floor(Math.random() * 6) + 1);
    const hitRerollResult = applyRerollWithDebug(hitInitialRolls, hitTarget, combatRerollHit);
    const hitRolls = hitRerollResult.finalRolls;
    const predatoryCount = predatoryFighter
      ? Math.min(parsedPredatoryCount, parsedDiceCount)
      : 0;
    const predatorySixes = predatoryCount
      ? hitRolls.slice(0, predatoryCount).filter((roll) => roll === 6).length
      : 0;
    let extraHitInitialRolls: number[] = [];
    let extraHitRerolls: number[] = [];
    let extraHitRolls: number[] = [];
    if (predatorySixes > 0) {
      extraHitInitialRolls = Array.from({ length: predatorySixes }, () => Math.floor(Math.random() * 6) + 1);
      const extraHitRerollResult = applyRerollWithDebug(extraHitInitialRolls, hitTarget, combatRerollHit);
      extraHitRerolls = extraHitRerollResult.rerollRolls;
      extraHitRolls = extraHitRerollResult.finalRolls;
    }
    const combinedHitInitialRolls = hitInitialRolls.concat(extraHitInitialRolls);
    const combinedHitRerollRolls = hitRerollResult.rerollRolls.concat(extraHitRerolls);
    const combinedHitRolls = hitRolls.concat(extraHitRolls);
    const totalAttacks = parsedDiceCount + predatorySixes;
    const poisonedAutoWounds = poisonedAttack
      ? combinedHitRolls.filter((roll) => roll === 6).length
      : 0;
    const nonPoisonHits = poisonedAttack
      ? combinedHitRolls.filter((roll) => roll >= hitTarget && roll !== 6).length
      : combinedHitRolls.filter((roll) => roll >= hitTarget).length;
    const hitSuccesses = poisonedAutoWounds + nonPoisonHits;

    const woundTarget = getWoundTarget(parsedHitStrength, parsedTargetToughness);
    const woundInitialRolls = Array.from({ length: nonPoisonHits }, () => Math.floor(Math.random() * 6) + 1);
    const woundRerollResult = applyRerollWithDebug(woundInitialRolls, woundTarget, combatRerollWound);
    const woundRolls = woundRerollResult.finalRolls;
    const woundSuccesses = woundRolls.filter((roll) => roll >= woundTarget).length;
    const totalWounds = poisonedAttack ? poisonedAutoWounds + woundSuccesses : woundSuccesses;

    const hasThrowArmorSave = throwArmorSave.trim() !== '';
    const effectiveArmorSave = hasThrowArmorSave
      ? parsedThrowArmorSave + (parsedHitStrength - 3)
      : null;
    let failedArmorSaves = totalWounds;
    let armorRolls: number[] = [];
    let armorRerollRolls: number[] = [];
    if (effectiveArmorSave !== null && effectiveArmorSave > 1 && effectiveArmorSave <= 6) {
      const armorInitialRolls = Array.from({ length: totalWounds }, () => Math.floor(Math.random() * 6) + 1);
      const armorRerollResult = applyRerollWithDebug(armorInitialRolls, effectiveArmorSave, combatRerollArmor);
      armorRerollRolls = armorRerollResult.rerollRolls;
      armorRolls = armorRerollResult.finalRolls;
      const armorSuccesses = armorRolls.filter((roll) => roll >= effectiveArmorSave).length;
      failedArmorSaves = totalWounds - armorSuccesses;
    }

    let failedWardSaves = failedArmorSaves;
    let wardRolls: number[] = [];
    let wardRerollRolls: number[] = [];
    if (parsedThrowWardSave > 1 && parsedThrowWardSave <= 6) {
      const wardInitialRolls = Array.from({ length: failedArmorSaves }, () => Math.floor(Math.random() * 6) + 1);
      const wardRerollResult = applyRerollWithDebug(wardInitialRolls, parsedThrowWardSave, combatRerollWard);
      wardRerollRolls = wardRerollResult.rerollRolls;
      wardRolls = wardRerollResult.finalRolls;
      const wardSuccesses = wardRolls.filter((roll) => roll >= parsedThrowWardSave).length;
      failedWardSaves = failedArmorSaves - wardSuccesses;
    }

    let finalDamage = failedWardSaves;
    let multipleWoundsRolls: number[] = [];
    if (parsedMultipleWounds) {
      if (parsedMultipleWounds.type === 'fixed') {
        finalDamage = failedWardSaves * parsedMultipleWounds.value;
      } else {
        multipleWoundsRolls = Array.from({ length: failedWardSaves }, () => Math.floor(Math.random() * parsedMultipleWounds.sides) + 1);
        finalDamage = multipleWoundsRolls.reduce((sum, roll) => sum + roll, 0);
      }
    }

    setThrowResults({
      successfulHits: hitSuccesses,
      successfulWounds: totalWounds,
      poisonedAutoWounds,
      nonPoisonHits,
      failedArmorSaves,
      failedWardSaves,
      finalDamage,
    });
    setThrowDebug({
      hitTarget,
      woundTarget,
      effectiveArmorSave,
      poisonedAutoWounds,
      nonPoisonHits,
      predatoryCount,
      predatorySixes,
      totalAttacks,
      hitInitialRolls: combinedHitInitialRolls,
      hitRerollRolls: combinedHitRerollRolls,
      woundInitialRolls,
      woundRerollRolls: woundRerollResult.rerollRolls,
      hitRolls: combinedHitRolls,
      woundRolls,
      armorRolls,
      armorRerollRolls,
      wardRolls,
      wardRerollRolls,
      multipleWoundsRolls,
    });
    setHasThrowResults(true);
  };

  const handleCalculate = () => {
    if (
      diceCount.trim() === '' ||
      hitValue.trim() === '' ||
      hitStrength.trim() === '' ||
      woundValue.trim() === ''
    ) {
      setErrorMessage('Devi inserire un risultato di dado');
      return;
    }

    const parsedDiceCount = Number.parseInt(diceCount, 10);
    const parsedHitValue = Number.parseInt(hitValue, 10);
    const parsedHitStrength = Number.parseInt(hitStrength, 10);
    const parsedWoundValue = Number.parseInt(woundValue, 10);
    const parsedArmorSave = armorSave.trim() === ''
      ? 0
      : Number.parseInt(armorSave, 10);
    const parsedWardSave = wardSave.trim() === ''
      ? 0
      : Number.parseInt(wardSave, 10);
    const parsedPredatoryCount = predatoryFighter
      ? Number.parseInt(predatoryFighterCount, 10)
      : 0;
    const parsedMultipleWounds = multipleWoundsEnabled
      ? parseMultipleWoundsValue(multipleWoundsValue)
      : null;

    if (
      Number.isNaN(parsedDiceCount) ||
      Number.isNaN(parsedHitValue) ||
      Number.isNaN(parsedHitStrength) ||
      Number.isNaN(parsedWoundValue) ||
      Number.isNaN(parsedArmorSave) ||
      Number.isNaN(parsedWardSave) ||
      Number.isNaN(parsedPredatoryCount) ||
      parsedPredatoryCount < 0 ||
      (multipleWoundsEnabled && !parsedMultipleWounds)
    ) {
      setErrorMessage('Devi inserire un risultato di dado');
      return;
    }

    setErrorMessage('');
    const newResults = calculateAverages({
      diceCount: parsedDiceCount,
      hitValue: parsedHitValue,
      poisonedAttack,
      predatoryFighterCount: predatoryFighter ? parsedPredatoryCount : 0,
      hitStrength: parsedHitStrength,
      woundValue: parsedWoundValue,
      armorSave: parsedArmorSave,
      wardSave: parsedWardSave,
      rerollHitConfig: toDiceRerollConfig(combatRerollHit),
      rerollWoundConfig: toDiceRerollConfig(combatRerollWound),
      rerollArmorConfig: toDiceRerollConfig(combatRerollArmor),
      rerollWardConfig: toDiceRerollConfig(combatRerollWard),
    });
    if (parsedMultipleWounds) {
      const multiplier = parsedMultipleWounds.type === 'dice'
        ? (parsedMultipleWounds.sides + 1) / 2
        : parsedMultipleWounds.value;
      const finalDamage = parseFloat((newResults.finalDamage * multiplier).toFixed(2));
      setResults({ ...newResults, finalDamage });
    } else {
      setResults(newResults);
    }
    setHasResults(true);
  };

  return (
    <div className="min-h-screen w-full px-4 py-10 sm:px-8">
      <div className="mx-auto w-full max-w-3xl">
        <div className="w-full border-2 border-zinc-900 bg-white shadow-[6px_6px_0_0_rgba(0,0,0,0.15)]">
          <CalculatorHeader
            mode={appMode ?? 'probability'}
            hasResults={hasResults}
            finalDamage={results.finalDamage}
            onHome={handleHome}
          />

          <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
            {!gameSystem ? (
              <SystemSelector onSelect={handleSystemSelect} />
            ) : !appMode ? (
              <ModeSelector onSelect={handleModeSelect} onBack={handleSystemBack} />
            ) : appMode === 'probability' && !appProbabilityMode ? (
              <ProbabilityTypeSelector onSelect={handleProbabilityTypeSelect} onBack={handleModeBack} />
            ) : !phase ? (
              <PhaseSelector
                systemLabel={systemLabel}
                systemKey={gameSystem}
                onSelect={handlePhaseSelect}
                onBack={handleModeBack}
              />
            ) : phase === 'general' ? (
              <GeneralThrowCalculator
                diceCount={generalDiceCount}
                objective={generalObjective}
                targetValue={generalTargetValue}
                mode={appMode}
                probabilityMode={generalProbabilityMode}
                errorMessage={generalErrorMessage}
                averageResults={generalAverageResults}
                throwResults={generalThrowResults}
                hasAverageResults={hasGeneralAverageResults}
                hasThrowResults={hasGeneralThrowResults}
                rerollConfig={generalReroll}
                debug={generalDebug}
                onBack={handlePhaseBack}
                onDiceCountChange={setGeneralDiceCount}
                onObjectiveChange={setGeneralObjective}
                onTargetValueChange={setGeneralTargetValue}
                onProbabilityModeChange={setProbabilityModeAll}
                onAverageCalculate={handleGeneralAverageCalculate}
                onThrowCalculate={handleGeneralThrowCalculate}
                onRerollChange={setGeneralReroll}
              />
            ) : phase === 'shooting' ? (
              <ShootingPhaseCalculator
                systemKey={gameSystem}
                diceCount={shootingDiceCount}
                mode={appMode}
                probabilityMode={shootingProbabilityMode}
                ballisticSkill={ballisticSkill}
                nightFighting={shootingNightFighting}
                poisonedAttack={shootingPoisonedAttack}
                autoHit={shootingAutoHit}
                targetType={shootingTargetType}
                targetWounds={shootingTargetWounds}
                targetArmorValue={shootingTargetArmorValue}
                lance={shootingLance}
                melta={shootingMelta}
                instantDeath={shootingInstantDeath}
                atomanticShield={shootingAtomanticShield}
                multipleWoundsEnabled={shootingMultipleWoundsEnabled}
                multipleWoundsValue={shootingMultipleWoundsValue}
                damageMitigationRoll={shootingDamageMitigationRoll}
                damageMitigationType={shootingDamageMitigationType}
                noCover={shootingNoCover}
                hitStrength={shootingHitStrength}
                targetToughness={shootingTargetToughness}
                armorPenetration={shootingArmorPenetration}
                woundValue={shootingWoundValue}
                armorSave={shootingArmorSave}
                wardSave={shootingWardSave}
                deflagrate={shootingDeflagrate}
                breachingEnabled={shootingBreachingEnabled}
                breachingValue={shootingBreachingValue}
                rendingEnabled={shootingRendingEnabled}
                rendingValue={shootingRendingValue}
                murderousEnabled={shootingMurderousEnabled}
                murderousValue={shootingMurderousValue}
                resultNeeded={getShootingResultNeeded()}
                modifiers={shootingModifiers}
                errorMessage={shootingErrorMessage}
                probabilityResults={shootingProbabilityResults}
                throwResults={shootingThrowResults}
                hasProbabilityResults={hasShootingProbabilityResults}
                hasThrowResults={hasShootingThrowResults}
                rerollHitConfig={shootingRerollHit}
                rerollWoundConfig={shootingRerollWound}
                rerollArmorConfig={shootingRerollArmor}
                rerollWardConfig={shootingRerollWard}
                rerollMitigationConfig={shootingRerollMitigation}
                debug={shootingDebug}
                onDiceCountChange={setShootingDiceCount}
                onProbabilityModeChange={setProbabilityModeAll}
                onBallisticSkillChange={setBallisticSkill}
                onNightFightingChange={setShootingNightFighting}
                onPoisonedAttackChange={setShootingPoisonedAttack}
                onAutoHitChange={handleShootingAutoHitChange}
                onTargetTypeChange={setShootingTargetType}
                onTargetWoundsChange={setShootingTargetWounds}
                onTargetArmorValueChange={setShootingTargetArmorValue}
                onLanceChange={setShootingLance}
                onMeltaChange={setShootingMelta}
                onInstantDeathChange={setShootingInstantDeath}
                onAtomanticShieldChange={setShootingAtomanticShield}
                onMultipleWoundsChange={setShootingMultipleWoundsEnabled}
                onMultipleWoundsValueChange={setShootingMultipleWoundsValue}
                onDamageMitigationRollChange={setShootingDamageMitigationRoll}
                onDamageMitigationTypeChange={setShootingDamageMitigationType}
                onNoCoverChange={setShootingNoCover}
                onHitStrengthChange={setShootingHitStrength}
                onTargetToughnessChange={setShootingTargetToughness}
                onArmorPenetrationChange={setShootingArmorPenetration}
                onWoundValueChange={setShootingWoundValue}
                onArmorSaveChange={setShootingArmorSave}
                onWardSaveChange={setShootingWardSave}
                onDeflagrateChange={setShootingDeflagrate}
                onBreachingEnabledChange={setShootingBreachingEnabled}
                onBreachingValueChange={setShootingBreachingValue}
                onRendingEnabledChange={setShootingRendingEnabled}
                onRendingValueChange={setShootingRendingValue}
                onMurderousEnabledChange={setShootingMurderousEnabled}
                onMurderousValueChange={setShootingMurderousValue}
                onModifierChange={handleShootingModifierChange}
                onAverageCalculate={handleShootingAverageCalculate}
                onThrowCalculate={handleShootingThrowCalculate}
                onBack={handlePhaseBack}
                onRerollHitChange={setShootingRerollHit}
                onRerollWoundChange={setShootingRerollWound}
                onRerollArmorChange={setShootingRerollArmor}
                onRerollWardChange={setShootingRerollWard}
                onRerollMitigationChange={setShootingRerollMitigation}
              />
            ) : phase === 'morale' ? (
              <BreakMoraleCheck
                discipline={moraleDiscipline}
                bonus={moraleBonus}
                malus={moraleMalus}
                stubborn={moraleStubborn}
                withThreeDice={moraleWithThreeDice}
                errorMessage={moraleErrorMessage}
                results={moraleResults}
                rerollConfig={moraleReroll}
                debug={moraleDebug}
                onDisciplineChange={setMoraleDiscipline}
                onBonusChange={setMoraleBonus}
                onMalusChange={setMoraleMalus}
                onStubbornChange={setMoraleStubborn}
                onWithThreeDiceChange={setMoraleWithThreeDice}
                onRoll={handleMoraleRoll}
                onBack={handlePhaseBack}
                onRerollChange={setMoraleReroll}
              />
            ) : phase === 'challenge' ? (
              <ChallengeSimulator mode={appMode ?? 'probability'} onBack={handlePhaseBack} />
            ) : phase === 'tc-generic' ? (
              appMode === 'probability' ? (
                appProbabilityMode === 'range' ? (
                  <TrechGenericCompareRange
                    plusDice={trechPlusDice}
                    minusDice={trechMinusDice}
                    positiveModifier={trechPositiveModifier}
                    negativeModifier={trechNegativeModifier}
                    onBack={handlePhaseBack}
                    backLabel="Back to phases"
                    rightSlot={(
                      <button
                        type="button"
                        onClick={() => setProbabilityModeAll('single')}
                        className="border-2 border-zinc-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors hover:bg-zinc-900 hover:text-white"
                      >
                        Single value
                      </button>
                    )}
                    onPlusDiceChange={setTrechPlusDice}
                    onMinusDiceChange={setTrechMinusDice}
                    onPositiveModifierChange={setTrechPositiveModifier}
                    onNegativeModifierChange={setTrechNegativeModifier}
                  />
                ) : (
                  <TrechGenericProbabilityCalculator
                    plusDice={trechPlusDice}
                    minusDice={trechMinusDice}
                    positiveModifier={trechPositiveModifier}
                    negativeModifier={trechNegativeModifier}
                    errorMessage={trechErrorMessage}
                    results={trechProbabilityResults}
                    debug={trechProbabilityDebug}
                    onPlusDiceChange={setTrechPlusDice}
                    onMinusDiceChange={setTrechMinusDice}
                    onPositiveModifierChange={setTrechPositiveModifier}
                    onNegativeModifierChange={setTrechNegativeModifier}
                    onCalculate={handleTrechGenericProbabilityCalculate}
                    onBack={handlePhaseBack}
                    rightSlot={(
                      <button
                        type="button"
                        onClick={() => setProbabilityModeAll('range')}
                        className="border-2 border-zinc-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors hover:bg-zinc-900 hover:text-white"
                      >
                        Comparation
                      </button>
                    )}
                  />
                )
              ) : (
                <TrechGenericRollCalculator
                  plusDice={trechPlusDice}
                  minusDice={trechMinusDice}
                  positiveModifier={trechPositiveModifier}
                  negativeModifier={trechNegativeModifier}
                  errorMessage={trechErrorMessage}
                  results={trechResults}
                  debug={trechDebug}
                  onPlusDiceChange={setTrechPlusDice}
                  onMinusDiceChange={setTrechMinusDice}
                  onPositiveModifierChange={setTrechPositiveModifier}
                  onNegativeModifierChange={setTrechNegativeModifier}
                  onRoll={handleTrechGenericRoll}
                  onBack={handlePhaseBack}
                />
              )
            ) : phase === 'tc-injury' ? (
              appMode === 'probability' ? (
                appProbabilityMode === 'range' ? (
                  <TrechInjuryCompareRange
                    plusDice={trechInjuryPlusDice}
                    minusDice={trechInjuryMinusDice}
                    positiveModifier={trechInjuryPositiveModifier}
                    negativeModifier={trechInjuryNegativeModifier}
                    withThreeDice={trechInjuryWithThreeDice}
                    targetArmor={trechInjuryTargetArmor}
                    noArmorSave={trechInjuryNoArmorSave}
                    armorPositiveModifier={trechInjuryArmorPositive}
                    armorNegativeModifier={trechInjuryArmorNegative}
                    onBack={handlePhaseBack}
                    backLabel="Back to phases"
                    rightSlot={(
                      <button
                        type="button"
                        onClick={() => setProbabilityModeAll('single')}
                        className="border-2 border-zinc-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors hover:bg-zinc-900 hover:text-white"
                      >
                        Single value
                      </button>
                    )}
                    onPlusDiceChange={setTrechInjuryPlusDice}
                    onMinusDiceChange={setTrechInjuryMinusDice}
                    onPositiveModifierChange={setTrechInjuryPositiveModifier}
                    onNegativeModifierChange={setTrechInjuryNegativeModifier}
                    onWithThreeDiceChange={setTrechInjuryWithThreeDice}
                    onTargetArmorChange={setTrechInjuryTargetArmor}
                    onNoArmorSaveChange={setTrechInjuryNoArmorSave}
                    onArmorPositiveModifierChange={setTrechInjuryArmorPositive}
                    onArmorNegativeModifierChange={setTrechInjuryArmorNegative}
                  />
                ) : (
                  <TrechInjuryProbabilityCalculator
                    plusDice={trechInjuryPlusDice}
                    minusDice={trechInjuryMinusDice}
                    positiveModifier={trechInjuryPositiveModifier}
                    negativeModifier={trechInjuryNegativeModifier}
                    withThreeDice={trechInjuryWithThreeDice}
                    targetArmor={trechInjuryTargetArmor}
                    noArmorSave={trechInjuryNoArmorSave}
                    armorPositiveModifier={trechInjuryArmorPositive}
                    armorNegativeModifier={trechInjuryArmorNegative}
                    errorMessage={trechInjuryErrorMessage}
                    results={trechInjuryProbabilityResults}
                    debug={trechInjuryProbabilityDebug}
                    onPlusDiceChange={setTrechInjuryPlusDice}
                    onMinusDiceChange={setTrechInjuryMinusDice}
                    onPositiveModifierChange={setTrechInjuryPositiveModifier}
                    onNegativeModifierChange={setTrechInjuryNegativeModifier}
                    onWithThreeDiceChange={setTrechInjuryWithThreeDice}
                    onTargetArmorChange={setTrechInjuryTargetArmor}
                    onNoArmorSaveChange={setTrechInjuryNoArmorSave}
                    onArmorPositiveModifierChange={setTrechInjuryArmorPositive}
                    onArmorNegativeModifierChange={setTrechInjuryArmorNegative}
                    onCalculate={handleTrechInjuryProbabilityCalculate}
                    onBack={handlePhaseBack}
                    rightSlot={(
                      <button
                        type="button"
                        onClick={() => setProbabilityModeAll('range')}
                        className="border-2 border-zinc-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors hover:bg-zinc-900 hover:text-white"
                      >
                        Comparation
                      </button>
                    )}
                  />
                )
              ) : (
                <TrechInjuryRollCalculator
                  plusDice={trechInjuryPlusDice}
                  minusDice={trechInjuryMinusDice}
                  positiveModifier={trechInjuryPositiveModifier}
                  negativeModifier={trechInjuryNegativeModifier}
                  withThreeDice={trechInjuryWithThreeDice}
                  targetArmor={trechInjuryTargetArmor}
                  noArmorSave={trechInjuryNoArmorSave}
                  armorPositiveModifier={trechInjuryArmorPositive}
                  armorNegativeModifier={trechInjuryArmorNegative}
                  errorMessage={trechInjuryErrorMessage}
                  results={trechInjuryResults}
                  debug={trechInjuryDebug}
                  onPlusDiceChange={setTrechInjuryPlusDice}
                  onMinusDiceChange={setTrechInjuryMinusDice}
                  onPositiveModifierChange={setTrechInjuryPositiveModifier}
                  onNegativeModifierChange={setTrechInjuryNegativeModifier}
                  onWithThreeDiceChange={setTrechInjuryWithThreeDice}
                  onTargetArmorChange={setTrechInjuryTargetArmor}
                  onNoArmorSaveChange={setTrechInjuryNoArmorSave}
                  onArmorPositiveModifierChange={setTrechInjuryArmorPositive}
                  onArmorNegativeModifierChange={setTrechInjuryArmorNegative}
                  onRoll={handleTrechInjuryRoll}
                  onBack={handlePhaseBack}
                />
              )
            ) : (
              <>
                {appMode === 'probability' && appProbabilityMode === 'range' ? null : (
                  <button
                    type="button"
                    onClick={handlePhaseBack}
                    className="border-2 border-zinc-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors hover:bg-zinc-900 hover:text-white"
                  >
                    Back to phases
                  </button>
                )}
                {gameSystem === 'hh2' ? (
                  appMode === 'probability' && appProbabilityMode === 'range' ? (
                    <div className="border-2 border-zinc-900 bg-zinc-100 px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-zinc-700">
                      Range comparison is not available yet for Horus Heresy combat.
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={() => setProbabilityModeAll('single')}
                          className="border-2 border-zinc-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors hover:bg-zinc-900 hover:text-white"
                        >
                          Back to single
                        </button>
                      </div>
                    </div>
                  ) : (
                    <Hh2CombatPhaseCalculator
                      diceCount={diceCount}
                      mode={appMode}
                      attackersAc={attackersAc}
                      defendersAc={defendersAc}
                      hitStrength={throwHitStrength}
                      targetToughness={targetToughness}
                      targetWounds={combatTargetWounds}
                      targetType={combatTargetType}
                      targetArmorValue={combatTargetArmorValue}
                      armorSave={throwArmorSave}
                      wardSave={throwWardSave}
                      instantDeath={combatInstantDeath}
                      deflagrate={combatDeflagrate}
                      breachingEnabled={combatBreachingEnabled}
                      breachingValue={combatBreachingValue}
                      rendingEnabled={combatRendingEnabled}
                      rendingValue={combatRendingValue}
                      murderousEnabled={combatMurderousEnabled}
                      murderousValue={combatMurderousValue}
                      errorMessage={errorMessage}
                      probabilityResults={results}
                      throwResults={throwResults}
                      hasProbabilityResults={hasResults}
                      hasThrowResults={hasThrowResults}
                      rerollHitConfig={combatRerollHit}
                      rerollWoundConfig={combatRerollWound}
                      rerollArmorConfig={combatRerollArmor}
                      rerollWardConfig={combatRerollWard}
                      onDiceCountChange={setDiceCount}
                      onAttackersAcChange={setAttackersAc}
                      onDefendersAcChange={setDefendersAc}
                      onHitStrengthChange={setThrowHitStrength}
                      onTargetToughnessChange={setTargetToughness}
                      onTargetWoundsChange={setCombatTargetWounds}
                      onTargetTypeChange={setCombatTargetType}
                      onTargetArmorValueChange={setCombatTargetArmorValue}
                      onArmorSaveChange={setThrowArmorSave}
                      onWardSaveChange={setThrowWardSave}
                      onInstantDeathChange={setCombatInstantDeath}
                      onDeflagrateChange={setCombatDeflagrate}
                      onBreachingEnabledChange={setCombatBreachingEnabled}
                      onBreachingValueChange={setCombatBreachingValue}
                      onRendingEnabledChange={setCombatRendingEnabled}
                      onRendingValueChange={setCombatRendingValue}
                      onMurderousEnabledChange={setCombatMurderousEnabled}
                      onMurderousValueChange={setCombatMurderousValue}
                      onAverageCalculate={handleHh2CombatAverageCalculate}
                      onThrowCalculate={handleHh2CombatThrowCalculate}
                      onRerollHitChange={setCombatRerollHit}
                      onRerollWoundChange={setCombatRerollWound}
                      onRerollArmorChange={setCombatRerollArmor}
                      onRerollWardChange={setCombatRerollWard}
                    />
                  )
                ) : appMode === 'probability' ? (
                  <div className="space-y-4">
                    {appProbabilityMode === 'range' ? null : (
                      <button
                        type="button"
                        onClick={() => setProbabilityModeAll(handleProbabilityModeToggle(appProbabilityMode))}
                        className="border-2 border-zinc-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors hover:bg-zinc-900 hover:text-white"
                      >
                        Comparation
                      </button>
                    )}
                    {appProbabilityMode === 'range' ? (
                      <CombatCompareRange
                        diceCount={diceCount}
                        hitValue={hitValue}
                        poisonedAttack={poisonedAttack}
                        predatoryFighter={predatoryFighter}
                        predatoryFighterCount={predatoryFighterCount}
                        multipleWoundsEnabled={multipleWoundsEnabled}
                        multipleWoundsValue={multipleWoundsValue}
                        hitStrength={hitStrength}
                        woundValue={woundValue}
                        armorSave={armorSave}
                        wardSave={wardSave}
                        rerollHitConfig={combatRerollHit}
                        rerollWoundConfig={combatRerollWound}
                        rerollArmorConfig={combatRerollArmor}
                        rerollWardConfig={combatRerollWard}
                        onBack={handlePhaseBack}
                        backLabel="Back to phases"
                        rightSlot={(
                          <button
                            type="button"
                            onClick={() => setProbabilityModeAll(handleProbabilityModeToggle(appProbabilityMode))}
                            className="border-2 border-zinc-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors hover:bg-zinc-900 hover:text-white"
                          >
                            Single value
                          </button>
                        )}
                        onDiceCountChange={setDiceCount}
                        onHitValueChange={setHitValue}
                        onPoisonedAttackChange={setPoisonedAttack}
                        onPredatoryFighterChange={setPredatoryFighter}
                        onPredatoryFighterCountChange={setPredatoryFighterCount}
                        onMultipleWoundsChange={setMultipleWoundsEnabled}
                        onMultipleWoundsValueChange={setMultipleWoundsValue}
                        onHitStrengthChange={setHitStrength}
                        onWoundValueChange={setWoundValue}
                        onArmorSaveChange={setArmorSave}
                        onWardSaveChange={setWardSave}
                        onRerollHitChange={setCombatRerollHit}
                        onRerollWoundChange={setCombatRerollWound}
                        onRerollArmorChange={setCombatRerollArmor}
                        onRerollWardChange={setCombatRerollWard}
                      />
                    ) : (
                      <ProbabilityCalculator
                        diceCount={diceCount}
                        hitValue={hitValue}
                        poisonedAttack={poisonedAttack}
                        predatoryFighter={predatoryFighter}
                        predatoryFighterCount={predatoryFighterCount}
                        multipleWoundsEnabled={multipleWoundsEnabled}
                        multipleWoundsValue={multipleWoundsValue}
                        hitStrength={hitStrength}
                        woundValue={woundValue}
                        armorSave={armorSave}
                        wardSave={wardSave}
                        errorMessage={errorMessage}
                        results={results}
                        rerollHitConfig={combatRerollHit}
                        rerollWoundConfig={combatRerollWound}
                        rerollArmorConfig={combatRerollArmor}
                        rerollWardConfig={combatRerollWard}
                        onDiceCountChange={setDiceCount}
                        onHitValueChange={setHitValue}
                        onPoisonedAttackChange={setPoisonedAttack}
                        onPredatoryFighterChange={setPredatoryFighter}
                        onPredatoryFighterCountChange={setPredatoryFighterCount}
                        onMultipleWoundsChange={setMultipleWoundsEnabled}
                        onMultipleWoundsValueChange={setMultipleWoundsValue}
                        onHitStrengthChange={setHitStrength}
                        onWoundValueChange={setWoundValue}
                        onArmorSaveChange={setArmorSave}
                        onWardSaveChange={setWardSave}
                        onCalculate={handleCalculate}
                        onRerollHitChange={setCombatRerollHit}
                        onRerollWoundChange={setCombatRerollWound}
                        onRerollArmorChange={setCombatRerollArmor}
                        onRerollWardChange={setCombatRerollWard}
                      />
                    )}
                  </div>
                ) : (
                  <ThrowDiceCalculator
                    diceCount={diceCount}
                    attackersAc={attackersAc}
                    defendersAc={defendersAc}
                    throwHitStrength={throwHitStrength}
                    targetToughness={targetToughness}
                    throwArmorSave={throwArmorSave}
                    throwWardSave={throwWardSave}
                    poisonedAttack={poisonedAttack}
                    predatoryFighter={predatoryFighter}
                    predatoryFighterCount={predatoryFighterCount}
                    multipleWoundsEnabled={multipleWoundsEnabled}
                    multipleWoundsValue={multipleWoundsValue}
                    errorMessage={errorMessage}
                    hasThrowResults={hasThrowResults}
                    throwResults={throwResults}
                    throwDebug={throwDebug}
                    rerollHitConfig={combatRerollHit}
                    rerollWoundConfig={combatRerollWound}
                    rerollArmorConfig={combatRerollArmor}
                    rerollWardConfig={combatRerollWard}
                    onDiceCountChange={setDiceCount}
                    onAttackersAcChange={setAttackersAc}
                    onDefendersAcChange={setDefendersAc}
                    onThrowHitStrengthChange={setThrowHitStrength}
                    onTargetToughnessChange={setTargetToughness}
                    onThrowArmorSaveChange={setThrowArmorSave}
                    onThrowWardSaveChange={setThrowWardSave}
                    onPoisonedAttackChange={setPoisonedAttack}
                    onPredatoryFighterChange={setPredatoryFighter}
                    onPredatoryFighterCountChange={setPredatoryFighterCount}
                    onMultipleWoundsChange={setMultipleWoundsEnabled}
                    onMultipleWoundsValueChange={setMultipleWoundsValue}
                    onCalculate={handleThrowCalculate}
                    onRerollHitChange={setCombatRerollHit}
                    onRerollWoundChange={setCombatRerollWound}
                    onRerollArmorChange={setCombatRerollArmor}
                    onRerollWardChange={setCombatRerollWard}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
