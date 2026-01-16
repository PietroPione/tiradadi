"use client";

import { useState } from 'react';
import CalculatorHeader from '@/components/calculator/CalculatorHeader';
import BreakMoraleCheck from '@/components/calculator/BreakMoraleCheck';
import GeneralThrowCalculator from '@/components/calculator/GeneralThrowCalculator';
import ModeSwitch from '@/components/calculator/ModeSwitch';
import ProbabilityCalculator from '@/components/calculator/ProbabilityCalculator';
import ShootingPhaseCalculator from '@/components/calculator/ShootingPhaseCalculator';
import ThrowDiceCalculator from '@/components/calculator/ThrowDiceCalculator';
import type { RerollConfig } from '@/components/calculator/ReRollOptions';
import PhaseSelector from '@/components/navigation/PhaseSelector';
import SystemSelector from '@/components/navigation/SystemSelector';
import { calculateAverages, type RerollConfig as DiceRerollConfig } from '@/lib/dice-calculator';

type GameSystem = 'wfb8';
type Phase = 'general' | 'shooting' | 'combat' | 'morale';
type RerollState = RerollConfig;

export default function Home() {
  const [diceCount, setDiceCount] = useState('10');
  const [mode, setMode] = useState<'probability' | 'throw'>('probability');
  const [attackersAc, setAttackersAc] = useState('1');
  const [defendersAc, setDefendersAc] = useState('1');
  const [throwHitStrength, setThrowHitStrength] = useState('3');
  const [targetToughness, setTargetToughness] = useState('3');
  const [throwArmorSave, setThrowArmorSave] = useState('4');
  const [throwWardSave, setThrowWardSave] = useState('0');
  const [hitValue, setHitValue] = useState('4');
  const [poisonedAttack, setPoisonedAttack] = useState(false);
  const [hitStrength, setHitStrength] = useState('3');
  const [woundValue, setWoundValue] = useState('4');
  const [armorSave, setArmorSave] = useState('4');
  const [wardSave, setWardSave] = useState('0');
  const [errorMessage, setErrorMessage] = useState('');
  const [gameSystem, setGameSystem] = useState<GameSystem | null>(null);
  const [phase, setPhase] = useState<Phase | null>(null);
  const [generalMode, setGeneralMode] = useState<'probability' | 'throw'>('probability');
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
  const [shootingMode, setShootingMode] = useState<'probability' | 'throw'>('probability');
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
    hitInitialRolls: [] as number[],
    hitRerollRolls: [] as number[],
    woundInitialRolls: [] as number[],
    woundRerollRolls: [] as number[],
    hitRolls: [] as number[],
    woundRolls: [] as number[],
    armorRolls: [] as number[],
    wardRolls: [] as number[],
  });
  const [hasThrowResults, setHasThrowResults] = useState(false);

  const systemLabel = 'Warhammer Fantasy 8th';

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

  const parseSpecificValues = (input: string) => {
    return input
      .split(',')
      .map((value) => Number.parseInt(value.trim(), 10))
      .filter((value) => Number.isFinite(value) && value >= 1 && value <= 6);
  };

  const toDiceRerollConfig = (config: RerollState): DiceRerollConfig => ({
    enabled: config.enabled,
    mode: config.mode,
    scope: config.scope,
    specificValues: parseSpecificValues(config.specificValues),
  });

  const shouldRerollValue = (
    value: number,
    isSuccess: boolean,
    config: RerollState,
    specificValues: Set<number>,
  ) => {
    if (!config.enabled) {
      return false;
    }
    if (config.mode === 'failed' && isSuccess) {
      return false;
    }
    if (config.mode === 'success' && !isSuccess) {
      return false;
    }
    if (config.scope === 'all') {
      return true;
    }
    return specificValues.has(value);
  };

  const applyRerollWithDebug = (
    rolls: number[],
    target: number,
    config: RerollState,
  ) => {
    const specificValues = new Set(parseSpecificValues(config.specificValues));
    const rerollRolls: number[] = [];
    const finalRolls = rolls.map((roll) => {
      const isSuccess = roll >= target;
      if (shouldRerollValue(roll, isSuccess, config, specificValues)) {
        const reroll = Math.floor(Math.random() * 6) + 1;
        rerollRolls.push(reroll);
        return reroll;
      }
      return roll;
    });
    return { finalRolls, rerollRolls };
  };


  const getFaceProbabilitiesWithReroll = (target: number, config?: RerollState) => {
    const specificValues = new Set(parseSpecificValues(config?.specificValues ?? ''));
    let rerollCount = 0;
    const rerollable = new Set<number>();
    for (let value = 1; value <= 6; value += 1) {
      const isSuccess = value >= target;
      if (config && shouldRerollValue(value, isSuccess, config, specificValues)) {
        rerollable.add(value);
        rerollCount += 1;
      }
    }
    const rerollChance = rerollCount / 6;
    const probabilities: number[] = [];
    for (let value = 1; value <= 6; value += 1) {
      const baseChance = rerollable.has(value) ? 0 : 1 / 6;
      probabilities[value] = baseChance + rerollChance / 6;
    }
    const successChance = probabilities
      .slice(1)
      .reduce((sum, chance, index) => sum + (index + 1 >= target ? chance : 0), 0);
    const sixChance = probabilities[6] ?? 0;
    return { successChance, sixChance, probabilities };
  };

  const getShootingSuccessChanceWithReroll = (target: number, config: RerollState) => {
    if (target <= 6) {
      return getFaceProbabilitiesWithReroll(target, config).successChance;
    }
    if (target >= 10) {
      return 0;
    }
    const followUpTarget = target - 3;
    const followUpChance = Math.max(0, (7 - followUpTarget) / 6);
    const baseSuccess = (1 / 6) * followUpChance;
    if (!config.enabled) {
      return baseSuccess;
    }
    const specificValues = new Set(parseSpecificValues(config.specificValues));
    let rerollChance = 0;
    if (config.scope === 'all') {
      rerollChance = config.mode === 'failed' ? 1 - baseSuccess : baseSuccess;
    } else {
      if (config.mode === 'failed') {
        for (let value = 1; value <= 5; value += 1) {
          if (specificValues.has(value)) {
            rerollChance += 1 / 6;
          }
        }
        if (specificValues.has(6)) {
          rerollChance += (1 / 6) * (1 - followUpChance);
        }
      } else if (specificValues.has(6)) {
        rerollChance += (1 / 6) * followUpChance;
      }
    }
    if (config.mode === 'failed') {
      return baseSuccess + rerollChance * baseSuccess;
    }
    return baseSuccess - rerollChance + rerollChance * baseSuccess;
  };

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
    let outcome = isDoubleOne || total <= target ? 'Passed' : 'Failed';
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

  const handleShootingAverageCalculate = () => {
    const parsedDiceCount = Number.parseInt(shootingDiceCount, 10);
    const parsedHitStrength = Number.parseInt(shootingHitStrength, 10);
    const parsedWoundValue = Number.parseInt(shootingWoundValue, 10);
    const parsedArmorSave = Number.parseInt(shootingArmorSave, 10);
    const parsedWardSave = Number.parseInt(shootingWardSave, 10);
    const resultNeeded = getShootingResultNeeded();

    if (
      Number.isNaN(parsedDiceCount) ||
      parsedDiceCount <= 0 ||
      Number.isNaN(parsedHitStrength) ||
      Number.isNaN(parsedWoundValue) ||
      Number.isNaN(parsedArmorSave) ||
      Number.isNaN(parsedWardSave) ||
      Number.isNaN(resultNeeded)
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
    const armorSaveChance = getFaceProbabilitiesWithReroll(effectiveArmorSave).successChance;
    const wardSaveChance = getFaceProbabilitiesWithReroll(parsedWardSave).successChance;

    const successfulHits = parsedDiceCount * hitChance;
    const autoWounds = parsedDiceCount * poisonedAutoWoundChance;
    const hitsToWound = parsedDiceCount * nonPoisonHitChance;
    const successfulWounds = autoWounds + hitsToWound * woundChance;
    const failedArmorSaves = successfulWounds * (1 - armorSaveChance);
    const failedWardSaves = failedArmorSaves * (1 - wardSaveChance);
    const finalDamage = failedWardSaves;

    setShootingProbabilityResults({
      successfulHits: parseFloat(successfulHits.toFixed(2)),
      successfulWounds: parseFloat(successfulWounds.toFixed(2)),
      poisonedAutoWounds: parseFloat(autoWounds.toFixed(2)),
      failedArmorSaves: parseFloat(failedArmorSaves.toFixed(2)),
      failedWardSaves: parseFloat(failedWardSaves.toFixed(2)),
      finalDamage: parseFloat(finalDamage.toFixed(2)),
    });
    setHasShootingProbabilityResults(true);
  };

  const handleShootingThrowCalculate = () => {
    const parsedDiceCount = Number.parseInt(shootingDiceCount, 10);
    const parsedHitStrength = Number.parseInt(shootingHitStrength, 10);
    const parsedTargetToughness = Number.parseInt(shootingTargetToughness, 10);
    const parsedArmorSave = Number.parseInt(shootingArmorSave, 10);
    const parsedWardSave = Number.parseInt(shootingWardSave, 10);
    const resultNeeded = getShootingResultNeeded();

    if (
      Number.isNaN(parsedDiceCount) ||
      parsedDiceCount <= 0 ||
      Number.isNaN(parsedHitStrength) ||
      Number.isNaN(parsedTargetToughness) ||
      Number.isNaN(parsedArmorSave) ||
      Number.isNaN(parsedWardSave) ||
      Number.isNaN(resultNeeded)
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
    if (effectiveArmorSave > 1 && effectiveArmorSave <= 6) {
      armorRolls = Array.from({ length: totalWounds }, () => Math.floor(Math.random() * 6) + 1);
      const armorSuccesses = armorRolls.filter((roll) => roll >= effectiveArmorSave).length;
      failedArmorSaves = totalWounds - armorSuccesses;
    }

    let failedWardSaves = failedArmorSaves;
    let wardRolls: number[] = [];
    if (parsedWardSave > 1 && parsedWardSave <= 6) {
      wardRolls = Array.from({ length: failedArmorSaves }, () => Math.floor(Math.random() * 6) + 1);
      const wardSuccesses = wardRolls.filter((roll) => roll >= parsedWardSave).length;
      failedWardSaves = failedArmorSaves - wardSuccesses;
    }

    setShootingThrowResults({
      successfulHits: hitSuccesses,
      successfulWounds: totalWounds,
      poisonedAutoWounds: shootingPoisonedAttack && resultNeeded <= 6 && !shootingAutoHit ? poisonedAutoWounds : 0,
      failedArmorSaves,
      failedWardSaves,
      finalDamage: failedWardSaves,
    });
    setShootingDebug({
      hitInitialRolls: rolls,
      hitRerollRolls,
      woundInitialRolls,
      woundRerollRolls: woundRerollResult.rerollRolls,
    });
    setHasShootingThrowResults(true);
  };

  const getHitTarget = (attacker: number, defender: number) => {
    if (attacker > defender) {
      return 3;
    }
    if (attacker === defender) {
      return 4;
    }
    if (attacker * 2 < defender) {
      return 5;
    }
    return 4;
  };

  const getWoundTarget = (strength: number, toughness: number) => {
    if (strength >= toughness + 2) {
      return 2;
    }
    if (strength === toughness + 1) {
      return 3;
    }
    if (strength === toughness) {
      return 4;
    }
    if (strength === toughness - 1) {
      return 5;
    }
    return 6;
  };

  const handleThrowCalculate = () => {
    const parsedDiceCount = Number.parseInt(diceCount, 10);
    const parsedAttackersAc = Number.parseInt(attackersAc, 10);
    const parsedDefendersAc = Number.parseInt(defendersAc, 10);
    const parsedHitStrength = Number.parseInt(throwHitStrength, 10);
    const parsedTargetToughness = Number.parseInt(targetToughness, 10);
    const parsedThrowArmorSave = Number.parseInt(throwArmorSave, 10);
    const parsedThrowWardSave = Number.parseInt(throwWardSave, 10);

    if (
      Number.isNaN(parsedDiceCount) ||
      parsedDiceCount <= 0 ||
      Number.isNaN(parsedAttackersAc) ||
      Number.isNaN(parsedDefendersAc) ||
      Number.isNaN(parsedHitStrength) ||
      Number.isNaN(parsedTargetToughness) ||
      Number.isNaN(parsedThrowArmorSave) ||
      Number.isNaN(parsedThrowWardSave)
    ) {
      setErrorMessage('Devi inserire un risultato di dado');
      return;
    }

    setErrorMessage('');
    const hitTarget = getHitTarget(parsedAttackersAc, parsedDefendersAc);
    const hitInitialRolls = Array.from({ length: parsedDiceCount }, () => Math.floor(Math.random() * 6) + 1);
    const hitRerollResult = applyRerollWithDebug(hitInitialRolls, hitTarget, combatRerollHit);
    const hitRolls = hitRerollResult.finalRolls;
    const poisonedAutoWounds = poisonedAttack
      ? hitRolls.filter((roll) => roll === 6).length
      : 0;
    const nonPoisonHits = poisonedAttack
      ? hitRolls.filter((roll) => roll >= hitTarget && roll !== 6).length
      : hitRolls.filter((roll) => roll >= hitTarget).length;
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
    if (effectiveArmorSave > 1 && effectiveArmorSave <= 6) {
      armorRolls = Array.from({ length: totalWounds }, () => Math.floor(Math.random() * 6) + 1);
      const armorSuccesses = armorRolls.filter((roll) => roll >= effectiveArmorSave).length;
      failedArmorSaves = totalWounds - armorSuccesses;
    }

    let failedWardSaves = failedArmorSaves;
    let wardRolls: number[] = [];
    if (parsedThrowWardSave > 1 && parsedThrowWardSave <= 6) {
      wardRolls = Array.from({ length: failedArmorSaves }, () => Math.floor(Math.random() * 6) + 1);
      const wardSuccesses = wardRolls.filter((roll) => roll >= parsedThrowWardSave).length;
      failedWardSaves = failedArmorSaves - wardSuccesses;
    }

    setThrowResults({
      successfulHits: hitSuccesses,
      successfulWounds: totalWounds,
      poisonedAutoWounds,
      nonPoisonHits,
      failedArmorSaves,
      failedWardSaves,
      finalDamage: failedWardSaves,
    });
    setThrowDebug({
      hitTarget,
      woundTarget,
      effectiveArmorSave,
      poisonedAutoWounds,
      nonPoisonHits,
      hitInitialRolls,
      hitRerollRolls: hitRerollResult.rerollRolls,
      woundInitialRolls,
      woundRerollRolls: woundRerollResult.rerollRolls,
      hitRolls,
      woundRolls,
      armorRolls,
      wardRolls,
    });
    setHasThrowResults(true);
  };

  const handleCalculate = () => {
    if (
      diceCount.trim() === '' ||
      hitValue.trim() === '' ||
      hitStrength.trim() === '' ||
      woundValue.trim() === '' ||
      armorSave.trim() === '' ||
      wardSave.trim() === ''
    ) {
      setErrorMessage('Devi inserire un risultato di dado');
      return;
    }

    const parsedDiceCount = Number.parseInt(diceCount, 10);
    const parsedHitValue = Number.parseInt(hitValue, 10);
    const parsedHitStrength = Number.parseInt(hitStrength, 10);
    const parsedWoundValue = Number.parseInt(woundValue, 10);
    const parsedArmorSave = Number.parseInt(armorSave, 10);
    const parsedWardSave = Number.parseInt(wardSave, 10);

    if (
      Number.isNaN(parsedDiceCount) ||
      Number.isNaN(parsedHitValue) ||
      Number.isNaN(parsedHitStrength) ||
      Number.isNaN(parsedWoundValue) ||
      Number.isNaN(parsedArmorSave) ||
      Number.isNaN(parsedWardSave)
    ) {
      setErrorMessage('Devi inserire un risultato di dado');
      return;
    }

    setErrorMessage('');
    const newResults = calculateAverages({
      diceCount: parsedDiceCount,
      hitValue: parsedHitValue,
      poisonedAttack,
      hitStrength: parsedHitStrength,
      woundValue: parsedWoundValue,
      armorSave: parsedArmorSave,
      wardSave: parsedWardSave,
      rerollHitConfig: toDiceRerollConfig(combatRerollHit),
      rerollWoundConfig: toDiceRerollConfig(combatRerollWound),
    });
    setResults(newResults);
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
          />

          <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
            {!gameSystem ? (
              <SystemSelector onSelect={handleSystemSelect} />
            ) : !phase ? (
              <PhaseSelector
                systemLabel={systemLabel}
                onSelect={handlePhaseSelect}
                onBack={handleSystemBack}
              />
            ) : phase === 'general' ? (
              <GeneralThrowCalculator
                diceCount={generalDiceCount}
                objective={generalObjective}
                targetValue={generalTargetValue}
                mode={generalMode}
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
                onModeChange={setGeneralMode}
                onAverageCalculate={handleGeneralAverageCalculate}
                onThrowCalculate={handleGeneralThrowCalculate}
                onRerollChange={setGeneralReroll}
              />
            ) : phase === 'shooting' ? (
              <ShootingPhaseCalculator
                diceCount={shootingDiceCount}
                mode={shootingMode}
                ballisticSkill={ballisticSkill}
                poisonedAttack={shootingPoisonedAttack}
                autoHit={shootingAutoHit}
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
                debug={shootingDebug}
                onDiceCountChange={setShootingDiceCount}
                onModeChange={setShootingMode}
                onBallisticSkillChange={setBallisticSkill}
                onPoisonedAttackChange={setShootingPoisonedAttack}
                onAutoHitChange={handleShootingAutoHitChange}
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
            ) : (
              <>
                <button
                  type="button"
                  onClick={handlePhaseBack}
                  className="border-2 border-zinc-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors hover:bg-zinc-900 hover:text-white"
                >
                  Back to phases
                </button>
                <ModeSwitch mode={mode} onModeChange={setMode} />
                {mode === 'probability' ? (
                  <ProbabilityCalculator
                    diceCount={diceCount}
                    hitValue={hitValue}
                    poisonedAttack={poisonedAttack}
                    hitStrength={hitStrength}
                    woundValue={woundValue}
                    armorSave={armorSave}
                    wardSave={wardSave}
                    errorMessage={errorMessage}
                    results={results}
                    rerollHitConfig={combatRerollHit}
                    rerollWoundConfig={combatRerollWound}
                    onDiceCountChange={setDiceCount}
                    onHitValueChange={setHitValue}
                    onPoisonedAttackChange={setPoisonedAttack}
                    onHitStrengthChange={setHitStrength}
                    onWoundValueChange={setWoundValue}
                    onArmorSaveChange={setArmorSave}
                    onWardSaveChange={setWardSave}
                    onCalculate={handleCalculate}
                    onRerollHitChange={setCombatRerollHit}
                    onRerollWoundChange={setCombatRerollWound}
                  />
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
                    errorMessage={errorMessage}
                    hasThrowResults={hasThrowResults}
                    throwResults={throwResults}
                    throwDebug={throwDebug}
                    rerollHitConfig={combatRerollHit}
                    rerollWoundConfig={combatRerollWound}
                    onDiceCountChange={setDiceCount}
                    onAttackersAcChange={setAttackersAc}
                    onDefendersAcChange={setDefendersAc}
                    onThrowHitStrengthChange={setThrowHitStrength}
                    onTargetToughnessChange={setTargetToughness}
                    onThrowArmorSaveChange={setThrowArmorSave}
                    onThrowWardSaveChange={setThrowWardSave}
                    onPoisonedAttackChange={setPoisonedAttack}
                    onCalculate={handleThrowCalculate}
                    onRerollHitChange={setCombatRerollHit}
                    onRerollWoundChange={setCombatRerollWound}
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
