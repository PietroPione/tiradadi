"use client";

import { useState } from 'react';
import CalculatorHeader from '@/components/calculator/CalculatorHeader';
import BreakMoraleCheck from '@/components/calculator/BreakMoraleCheck';
import GeneralThrowCalculator from '@/components/calculator/GeneralThrowCalculator';
import ModeSwitch from '@/components/calculator/ModeSwitch';
import ProbabilityCalculator from '@/components/calculator/ProbabilityCalculator';
import ShootingPhaseCalculator from '@/components/calculator/ShootingPhaseCalculator';
import ThrowDiceCalculator from '@/components/calculator/ThrowDiceCalculator';
import ChallengeSimulator from '@/components/calculator/ChallengeSimulator';
import ProbabilityModeSelector from '@/components/calculator/ProbabilityModeSelector';
import CombatCompareRange from '@/components/calculator/CombatCompareRange';
import type { RerollConfig } from '@/components/calculator/ReRollOptions';
import PhaseSelector from '@/components/navigation/PhaseSelector';
import SystemSelector from '@/components/navigation/SystemSelector';
import { calculateAverages, type RerollConfig as DiceRerollConfig } from '@/lib/dice-calculator';
import TrechGenericRollCalculator from '@/components/calculator/TrechGenericRollCalculator';
import TrechInjuryRollCalculator from '@/components/calculator/TrechInjuryRollCalculator';
import {
  applyRerollWithDebug,
  getFaceProbabilitiesWithReroll,
  getHitTarget,
  getShootingSuccessChanceWithReroll,
  getWoundTarget,
  parseSpecificValues,
  shouldRerollValue,
} from '@/lib/roll-utils';

type GameSystem = 'wfb8' | 'trech';
type Phase = 'general' | 'shooting' | 'combat' | 'morale' | 'challenge' | 'tc-generic' | 'tc-injury';
type RerollState = RerollConfig;

export default function DiceApp() {
  const [diceCount, setDiceCount] = useState('10');
  const [mode, setMode] = useState<'probability' | 'throw'>('probability');
  const [combatProbabilityMode, setCombatProbabilityMode] = useState<'single' | 'range' | null>(null);
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
  const [generalMode, setGeneralMode] = useState<'probability' | 'throw'>('probability');
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
  const [shootingMultipleWoundsEnabled, setShootingMultipleWoundsEnabled] = useState(false);
  const [shootingMultipleWoundsValue, setShootingMultipleWoundsValue] = useState('');
  const [shootingMode, setShootingMode] = useState<'probability' | 'throw'>('probability');
  const [shootingProbabilityMode, setShootingProbabilityMode] = useState<'single' | 'range' | null>(null);
  const [shootingDiceCount, setShootingDiceCount] = useState('10');
  const [shootingHitStrength, setShootingHitStrength] = useState('3');
  const [shootingTargetToughness, setShootingTargetToughness] = useState('3');
  const [shootingWoundValue, setShootingWoundValue] = useState('4');
  const [shootingArmorSave, setShootingArmorSave] = useState('4');
  const [shootingWardSave, setShootingWardSave] = useState('0');
  const [shootingProbabilityResults, setShootingProbabilityResults] = useState({
    successfulHits: 0,
    successfulWounds: 0,
    poisonedAutoWounds: 0,
    failedArmorSaves: 0,
    failedWardSaves: 0,
    finalDamage: 0,
  });
  const [shootingThrowResults, setShootingThrowResults] = useState({
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
  const [trechInjuryPlusDice, setTrechInjuryPlusDice] = useState('0');
  const [trechInjuryMinusDice, setTrechInjuryMinusDice] = useState('0');
  const [trechInjuryPositiveModifier, setTrechInjuryPositiveModifier] = useState('0');
  const [trechInjuryNegativeModifier, setTrechInjuryNegativeModifier] = useState('0');
  const [trechInjuryErrorMessage, setTrechInjuryErrorMessage] = useState('');
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
    armorInitialRolls: [] as number[],
    armorRerollRolls: [] as number[],
    wardInitialRolls: [] as number[],
    wardRerollRolls: [] as number[],
    multipleWoundsRolls: [] as number[],
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
    effectiveArmorSave: 0,
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

  const systemLabel = gameSystem === 'trech' ? 'Trench Crusade' : 'Warhammer Fantasy 8th';

  const handleHome = () => {
    setGameSystem(null);
    setPhase(null);
  };

  const handleSystemSelect = (system: GameSystem) => {
    setGameSystem(system);
    setPhase(null);
  };

  const handleSystemBack = () => {
    setGameSystem(null);
    setPhase(null);
  };

  const handlePhaseSelect = (nextPhase: Phase) => {
    setPhase(nextPhase);
  };

  const handlePhaseBack = () => {
    setPhase(null);
  };

  const handleCombatModeChange = (nextMode: 'probability' | 'throw') => {
    setMode(nextMode);
    if (nextMode === 'probability') {
      setCombatProbabilityMode(null);
    }
  };

  const handleGeneralModeChange = (nextMode: 'probability' | 'throw') => {
    setGeneralMode(nextMode);
    if (nextMode === 'probability') {
      setGeneralProbabilityMode(null);
    }
  };

  const handleShootingModeChange = (nextMode: 'probability' | 'throw') => {
    setShootingMode(nextMode);
    if (nextMode === 'probability') {
      setShootingProbabilityMode(null);
    }
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
    const netDice = parsedPlus - parsedMinus;
    const extraDice = Math.abs(netDice);
    const totalDice = 2 + extraDice;
    const rolls = Array.from({ length: totalDice }, () => Math.floor(Math.random() * 6) + 1);
    const sortedRolls = [...rolls].sort((a, b) => a - b);
    let selectedRolls: number[] = [];
    let selectionMode: 'highest' | 'lowest' | 'normal' = 'normal';

    if (netDice > 0) {
      selectedRolls = sortedRolls.slice(-2);
      selectionMode = 'highest';
    } else if (netDice < 0) {
      selectedRolls = sortedRolls.slice(0, 2);
      selectionMode = 'lowest';
    } else {
      selectedRolls = sortedRolls;
    }

    const baseTotal = selectedRolls.reduce((sum, roll) => sum + roll, 0);
    const finalTotal = baseTotal + parsedPositive - parsedNegative;
    const success = finalTotal >= 7;

    setTrechResults({
      rolls,
      selectedRolls,
      baseTotal,
      finalTotal,
      success,
      selectionMode,
    });
    setTrechDebug({ rolls, selectedRolls });
  };

  const handleTrechInjuryRoll = () => {
    const parsedPlus = Number.parseInt(trechInjuryPlusDice, 10);
    const parsedMinus = Number.parseInt(trechInjuryMinusDice, 10);
    const parsedPositive = Number.parseInt(trechInjuryPositiveModifier, 10);
    const parsedNegative = Number.parseInt(trechInjuryNegativeModifier, 10);

    if (
      Number.isNaN(parsedPlus) ||
      Number.isNaN(parsedMinus) ||
      Number.isNaN(parsedPositive) ||
      Number.isNaN(parsedNegative) ||
      parsedPlus < 0 ||
      parsedMinus < 0
    ) {
      setTrechInjuryErrorMessage('Devi inserire un risultato di dado');
      return;
    }

    setTrechInjuryErrorMessage('');
    const netDice = parsedPlus - parsedMinus;
    const extraDice = Math.abs(netDice);
    const totalDice = 2 + extraDice;
    const rolls = Array.from({ length: totalDice }, () => Math.floor(Math.random() * 6) + 1);
    const sortedRolls = [...rolls].sort((a, b) => a - b);
    let selectedRolls: number[] = [];
    let selectionMode: 'highest' | 'lowest' | 'normal' = 'normal';

    if (netDice > 0) {
      selectedRolls = sortedRolls.slice(-2);
      selectionMode = 'highest';
    } else if (netDice < 0) {
      selectedRolls = sortedRolls.slice(0, 2);
      selectionMode = 'lowest';
    } else {
      selectedRolls = sortedRolls;
    }

    const baseTotal = selectedRolls.reduce((sum, roll) => sum + roll, 0);
    const finalTotal = baseTotal + parsedPositive - parsedNegative;
    let outcome: 'No effect' | 'Minor hit' | 'Down' | 'Out of action' = 'Minor hit';
    if (finalTotal <= 1) {
      outcome = 'No effect';
    } else if (finalTotal <= 6) {
      outcome = 'Minor hit';
    } else if (finalTotal <= 8) {
      outcome = 'Down';
    } else {
      outcome = 'Out of action';
    }

    setTrechInjuryResults({
      rolls,
      selectedRolls,
      baseTotal,
      finalTotal,
      outcome,
      selectionMode,
    });
    setTrechInjuryDebug({ rolls, selectedRolls });
  };

  const handleShootingAverageCalculate = () => {
    const parsedDiceCount = Number.parseInt(shootingDiceCount, 10);
    const parsedHitStrength = Number.parseInt(shootingHitStrength, 10);
    const parsedWoundValue = Number.parseInt(shootingWoundValue, 10);
    const parsedArmorSave = Number.parseInt(shootingArmorSave, 10);
    const parsedWardSave = shootingWardSave.trim() === ''
      ? 0
      : Number.parseInt(shootingWardSave, 10);
    const resultNeeded = getShootingResultNeeded();
    const parsedMultipleWounds = shootingMultipleWoundsEnabled
      ? parseMultipleWoundsValue(shootingMultipleWoundsValue)
      : null;

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

    setShootingErrorMessage('');
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
    const effectiveArmorSave = parsedArmorSave + armorSaveModifier;
    const armorSaveChance = effectiveArmorSave > 1
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
    const failedWardSaves = failedArmorSaves * (1 - wardSaveChance);
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
      armorInitialRolls: [],
      armorRerollRolls: [],
      wardInitialRolls: [],
      wardRerollRolls: [],
      multipleWoundsRolls: [],
    });
    setHasShootingProbabilityResults(true);
  };

  const handleShootingThrowCalculate = () => {
    const parsedDiceCount = Number.parseInt(shootingDiceCount, 10);
    const parsedHitStrength = Number.parseInt(shootingHitStrength, 10);
    const parsedTargetToughness = Number.parseInt(shootingTargetToughness, 10);
    const parsedArmorSave = Number.parseInt(shootingArmorSave, 10);
    const parsedWardSave = shootingWardSave.trim() === ''
      ? 0
      : Number.parseInt(shootingWardSave, 10);
    const resultNeeded = getShootingResultNeeded();
    const parsedMultipleWounds = shootingMultipleWoundsEnabled
      ? parseMultipleWoundsValue(shootingMultipleWoundsValue)
      : null;

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

    setShootingErrorMessage('');
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
        armorInitialRolls: [],
        armorRerollRolls: [],
        wardInitialRolls: [],
        wardRerollRolls: [],
        multipleWoundsRolls: [],
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

    const effectiveArmorSave = parsedArmorSave + (parsedHitStrength - 3);
    let failedArmorSaves = totalWounds;
    let armorRolls: number[] = [];
    let armorInitialRolls: number[] = [];
    let armorRerollRolls: number[] = [];
    if (effectiveArmorSave > 1 && effectiveArmorSave <= 6) {
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
    if (parsedWardSave > 1 && parsedWardSave <= 6) {
      wardInitialRolls = Array.from({ length: failedArmorSaves }, () => Math.floor(Math.random() * 6) + 1);
      const wardRerollResult = applyRerollWithDebug(wardInitialRolls, parsedWardSave, shootingRerollWard);
      wardRerollRolls = wardRerollResult.rerollRolls;
      wardRolls = wardRerollResult.finalRolls;
      const wardSuccesses = wardRolls.filter((roll) => roll >= parsedWardSave).length;
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
      armorInitialRolls,
      armorRerollRolls,
      wardInitialRolls,
      wardRerollRolls,
      multipleWoundsRolls,
    });
    setHasShootingThrowResults(true);
  };

  const handleThrowCalculate = () => {
    const parsedDiceCount = Number.parseInt(diceCount, 10);
    const parsedAttackersAc = Number.parseInt(attackersAc, 10);
    const parsedDefendersAc = Number.parseInt(defendersAc, 10);
    const parsedHitStrength = Number.parseInt(throwHitStrength, 10);
    const parsedTargetToughness = Number.parseInt(targetToughness, 10);
    const parsedThrowArmorSave = Number.parseInt(throwArmorSave, 10);
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

    const effectiveArmorSave = parsedThrowArmorSave + (parsedHitStrength - 3);
    let failedArmorSaves = totalWounds;
    let armorRolls: number[] = [];
    let armorRerollRolls: number[] = [];
    if (effectiveArmorSave > 1 && effectiveArmorSave <= 6) {
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
      woundValue.trim() === '' ||
      armorSave.trim() === ''
    ) {
      setErrorMessage('Devi inserire un risultato di dado');
      return;
    }

    const parsedDiceCount = Number.parseInt(diceCount, 10);
    const parsedHitValue = Number.parseInt(hitValue, 10);
    const parsedHitStrength = Number.parseInt(hitStrength, 10);
    const parsedWoundValue = Number.parseInt(woundValue, 10);
    const parsedArmorSave = Number.parseInt(armorSave, 10);
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
            mode={mode}
            hasResults={hasResults}
            finalDamage={results.finalDamage}
            onHome={handleHome}
          />

          <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
            {!gameSystem ? (
              <SystemSelector onSelect={handleSystemSelect} />
            ) : !phase ? (
              <PhaseSelector
                systemLabel={systemLabel}
                systemKey={gameSystem}
                onSelect={handlePhaseSelect}
                onBack={handleSystemBack}
              />
            ) : phase === 'general' ? (
              <GeneralThrowCalculator
                diceCount={generalDiceCount}
                objective={generalObjective}
                targetValue={generalTargetValue}
                mode={generalMode}
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
                onModeChange={handleGeneralModeChange}
                onProbabilityModeChange={setGeneralProbabilityMode}
                onAverageCalculate={handleGeneralAverageCalculate}
                onThrowCalculate={handleGeneralThrowCalculate}
                onRerollChange={setGeneralReroll}
              />
            ) : phase === 'shooting' ? (
              <ShootingPhaseCalculator
                diceCount={shootingDiceCount}
                mode={shootingMode}
                probabilityMode={shootingProbabilityMode}
                ballisticSkill={ballisticSkill}
                poisonedAttack={shootingPoisonedAttack}
                autoHit={shootingAutoHit}
                multipleWoundsEnabled={shootingMultipleWoundsEnabled}
                multipleWoundsValue={shootingMultipleWoundsValue}
                hitStrength={shootingHitStrength}
                targetToughness={shootingTargetToughness}
                woundValue={shootingWoundValue}
                armorSave={shootingArmorSave}
                wardSave={shootingWardSave}
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
                debug={shootingDebug}
                onDiceCountChange={setShootingDiceCount}
                onModeChange={handleShootingModeChange}
                onProbabilityModeChange={setShootingProbabilityMode}
                onBallisticSkillChange={setBallisticSkill}
                onPoisonedAttackChange={setShootingPoisonedAttack}
                onAutoHitChange={handleShootingAutoHitChange}
                onMultipleWoundsChange={setShootingMultipleWoundsEnabled}
                onMultipleWoundsValueChange={setShootingMultipleWoundsValue}
                onHitStrengthChange={setShootingHitStrength}
                onTargetToughnessChange={setShootingTargetToughness}
                onWoundValueChange={setShootingWoundValue}
                onArmorSaveChange={setShootingArmorSave}
                onWardSaveChange={setShootingWardSave}
                onModifierChange={handleShootingModifierChange}
                onAverageCalculate={handleShootingAverageCalculate}
                onThrowCalculate={handleShootingThrowCalculate}
                onBack={handlePhaseBack}
                onRerollHitChange={setShootingRerollHit}
                onRerollWoundChange={setShootingRerollWound}
                onRerollArmorChange={setShootingRerollArmor}
                onRerollWardChange={setShootingRerollWard}
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
              <ChallengeSimulator onBack={handlePhaseBack} />
            ) : phase === 'tc-generic' ? (
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
            ) : phase === 'tc-injury' ? (
              <TrechInjuryRollCalculator
                plusDice={trechInjuryPlusDice}
                minusDice={trechInjuryMinusDice}
                positiveModifier={trechInjuryPositiveModifier}
                negativeModifier={trechInjuryNegativeModifier}
                errorMessage={trechInjuryErrorMessage}
                results={trechInjuryResults}
                debug={trechInjuryDebug}
                onPlusDiceChange={setTrechInjuryPlusDice}
                onMinusDiceChange={setTrechInjuryMinusDice}
                onPositiveModifierChange={setTrechInjuryPositiveModifier}
                onNegativeModifierChange={setTrechInjuryNegativeModifier}
                onRoll={handleTrechInjuryRoll}
                onBack={handlePhaseBack}
              />
            ) : (
              <>
                <button
                  type="button"
                  onClick={handlePhaseBack}
                  className="border-2 border-zinc-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors hover:bg-zinc-900 hover:text-white"
                >
                  Back to phases
                </button>
                <ModeSwitch mode={mode} onModeChange={handleCombatModeChange} />
                {mode === 'probability' ? (
                  combatProbabilityMode === null ? (
                    <ProbabilityModeSelector
                      title="Combat phase"
                      subtitle="Choose probability mode"
                      onSelect={setCombatProbabilityMode}
                    />
                  ) : combatProbabilityMode === 'range' ? (
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
                  )
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
