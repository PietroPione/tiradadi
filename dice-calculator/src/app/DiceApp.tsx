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
import ProbabilityResultsCard from '@/components/calculator/ProbabilityResultsCard';
import ThrowResultsCard from '@/components/calculator/ThrowResultsCard';
import Card from '@/components/ui/Card';
import NewUiCombatWizard from '@/components/new-ui/NewUiCombatWizard';
import NewUiGeneralWizard from '@/components/new-ui/NewUiGeneralWizard';
import NewUiMoraleWizard from '@/components/new-ui/NewUiMoraleWizard';
import NewUiShootingWizard from '@/components/new-ui/NewUiShootingWizard';
import NewUiSummary from '@/components/new-ui/NewUiSummary';
import NewUiModeSelector from '@/components/new-ui/NewUiModeSelector';
import NewUiPhaseSelector from '@/components/navigation/NewUiPhaseSelector';
import PhaseSelector from '@/components/navigation/PhaseSelector';
import SystemSelector from '@/components/navigation/SystemSelector';
import UiModeSelector from '@/components/navigation/UiModeSelector';
import { calculateAverages, type RerollConfig as DiceRerollConfig } from '@/lib/dice-calculator';
import TrechGenericRollCalculator from '@/components/calculator/TrechGenericRollCalculator';
import NewUiTrechGenericWizard from '@/components/new-ui/NewUiTrechGenericWizard';
import TrechInjuryRollCalculator from '@/components/calculator/TrechInjuryRollCalculator';
import NewUiTrechInjuryWizard from '@/components/new-ui/NewUiTrechInjuryWizard';
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
type Phase = 'general' | 'shooting' | 'combat' | 'morale' | 'tc-generic' | 'tc-injury';
type RerollState = RerollConfig;
type UiMode = 'classic' | 'new';
type NewUiPhase = 'general' | 'shooting' | 'combat' | 'morale' | 'tc-generic' | 'tc-injury';

export default function DiceApp() {
  const [uiMode, setUiMode] = useState<UiMode | null>(null);
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
  const [newUiPhase, setNewUiPhase] = useState<NewUiPhase | null>(null);
  const [newUiStep, setNewUiStep] = useState(0);
  const [newUiView, setNewUiView] = useState<'mode' | 'wizard' | 'summary'>('mode');
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

  const systemLabel = gameSystem === 'trech' ? 'Trench Crusade' : 'Warhammer Fantasy 8th';

  const phaseUsesModeSelect = (phaseValue: NewUiPhase | null) => {
    return phaseValue === 'general' || phaseValue === 'combat' || phaseValue === 'shooting';
  };

  const handleHome = () => {
    setUiMode(null);
    setGameSystem(null);
    setPhase(null);
    setNewUiPhase(null);
    setNewUiStep(0);
    setNewUiView('mode');
  };

  const handleUiModeSelect = (selected: UiMode) => {
    setUiMode(selected);
    setGameSystem(null);
    setPhase(null);
    setNewUiPhase(null);
    setNewUiStep(0);
    setNewUiView('mode');
  };

  const handleSystemSelect = (system: GameSystem) => {
    setGameSystem(system);
    setPhase(null);
    setNewUiPhase(null);
    setNewUiStep(0);
    setNewUiView('mode');
  };

  const handleSystemBack = () => {
    setGameSystem(null);
    setPhase(null);
    setNewUiPhase(null);
    setNewUiStep(0);
    setNewUiView('mode');
  };

  const handlePhaseSelect = (nextPhase: Phase) => {
    setPhase(nextPhase);
  };

  const handlePhaseBack = () => {
    setPhase(null);
  };

  const handleNewUiPhaseSelect = (nextPhase: NewUiPhase) => {
    setNewUiPhase(nextPhase);
    setNewUiStep(0);
    setNewUiView(phaseUsesModeSelect(nextPhase) ? 'mode' : 'wizard');
  };

  const handleNewUiBack = () => {
    if (newUiView === 'summary') {
      setNewUiView('wizard');
      setNewUiStep(0);
      return;
    }
    if (newUiView === 'mode') {
      setNewUiPhase(null);
      return;
    }
    if (newUiStep === 0) {
      if (phaseUsesModeSelect(newUiPhase)) {
        setNewUiView('mode');
      } else {
        setNewUiPhase(null);
      }
      return;
    }
    setNewUiStep((prev) => Math.max(0, prev - 1));
  };

  const handleNewUiNext = () => {
    setNewUiStep((prev) => Math.min(4, prev + 1));
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

  const formatRerollLabel = (config: RerollState) => {
    if (!config.enabled) {
      return 'Off';
    }
    const base = `${config.mode} / ${config.scope}`;
    if (config.scope === 'specific' && config.specificValues.trim()) {
      return `${base} (${config.specificValues})`;
    }
    return base;
  };

  const handleNewUiCalculate = () => {
    if (newUiPhase === 'combat') {
      if (mode === 'probability') {
        handleCalculate();
      } else {
        handleThrowCalculate();
      }
    } else if (newUiPhase === 'general') {
      if (generalMode === 'probability') {
        handleGeneralAverageCalculate();
      } else {
        handleGeneralThrowCalculate();
      }
    } else if (newUiPhase === 'shooting') {
      if (shootingMode === 'probability') {
        handleShootingAverageCalculate();
      } else {
        handleShootingThrowCalculate();
      }
    } else if (newUiPhase === 'morale') {
      handleMoraleRoll();
    } else if (newUiPhase === 'tc-generic') {
      handleTrechGenericRoll();
    } else if (newUiPhase === 'tc-injury') {
      handleTrechInjuryRoll();
    }
    setNewUiView('summary');
  };

  const handleNewUiModeSelect = (selected: 'probability' | 'throw') => {
    if (newUiPhase === 'combat') {
      setMode(selected);
    } else if (newUiPhase === 'shooting') {
      setShootingMode(selected);
    } else if (newUiPhase === 'general') {
      setGeneralMode(selected);
    }
    setNewUiStep(0);
    setNewUiView('wizard');
  };

  const handleNewUiBackToStart = () => {
    setNewUiStep(0);
    setNewUiView('wizard');
  };

  const handleNewUiReroll = () => {
    handleNewUiCalculate();
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

  const shootingModifiersLabel = () => {
    const labels: string[] = [];
    if (shootingModifiers.longRange) labels.push('Long range');
    if (shootingModifiers.movement) labels.push('Movement');
    if (shootingModifiers.skirmisherTarget) labels.push('Skirmisher target');
    return labels.length ? labels.join(', ') : '-';
  };

  const shootingCoverLabel = () => {
    const labels: string[] = [];
    if (shootingModifiers.lightCover) labels.push('Light cover');
    if (shootingModifiers.hardCover) labels.push('Hard cover');
    return labels.length ? labels.join(', ') : '-';
  };

  const combatSummarySections = mode === 'probability'
    ? [
      {
        title: 'To hit',
        items: [
          { label: 'Mode', value: 'Probability' },
          { label: 'Dice count', value: diceCount },
          { label: 'To Hit', value: `${hitValue}+` },
          { label: 'Poisoned Attack', value: poisonedAttack ? 'Yes' : 'No' },
          { label: 'Re-roll to hit', value: formatRerollLabel(combatRerollHit) },
        ],
      },
      {
        title: 'To wound',
        items: [
          { label: 'Hit Strength', value: hitStrength },
          { label: 'To Wound', value: `${woundValue}+` },
          { label: 'Re-roll to wound', value: formatRerollLabel(combatRerollWound) },
        ],
      },
      {
        title: 'Savings',
        items: [
          { label: 'Armor Save', value: `${armorSave}+` },
          { label: 'Ward Save', value: `${wardSave}+` },
        ],
      },
    ]
    : [
      {
        title: 'To hit',
        items: [
          { label: 'Mode', value: 'Throw' },
          { label: 'Dice count', value: diceCount },
          { label: 'Attackers AC', value: attackersAc },
          { label: 'Defenders AC', value: defendersAc },
          { label: 'Poisoned Attack', value: poisonedAttack ? 'Yes' : 'No' },
          { label: 'Re-roll to hit', value: formatRerollLabel(combatRerollHit) },
        ],
      },
      {
        title: 'To wound',
        items: [
          { label: 'Hit Strength', value: throwHitStrength },
          { label: 'Target Toughness', value: targetToughness },
          { label: 'Re-roll to wound', value: formatRerollLabel(combatRerollWound) },
        ],
      },
      {
        title: 'Savings',
        items: [
          { label: 'Armor Save', value: `${throwArmorSave}+` },
          { label: 'Ward Save', value: `${throwWardSave}+` },
        ],
      },
    ];

  const shootingSummarySections = shootingMode === 'probability'
    ? [
      {
        title: 'To hit',
        items: [
          { label: 'Mode', value: 'Probability' },
          { label: 'Dice count', value: shootingDiceCount },
          { label: 'Balistic Skill', value: shootingAutoHit ? '-' : ballisticSkill },
          { label: 'Modifiers', value: shootingAutoHit ? '-' : shootingModifiersLabel() },
          { label: 'Cover', value: shootingAutoHit ? '-' : shootingCoverLabel() },
          { label: 'Auto-hit', value: shootingAutoHit ? 'Yes' : 'No' },
          { label: 'Poisoned Attack', value: shootingPoisonedAttack ? 'Yes' : 'No' },
          { label: 'Re-roll to hit', value: formatRerollLabel(shootingRerollHit) },
        ],
      },
      {
        title: 'To wound',
        items: [
          { label: 'Hit Strength', value: shootingHitStrength },
          { label: 'To Wound', value: `${shootingWoundValue}+` },
          { label: 'Re-roll to wound', value: formatRerollLabel(shootingRerollWound) },
        ],
      },
      {
        title: 'Savings',
        items: [
          { label: 'Armor Save', value: `${shootingArmorSave}+` },
          { label: 'Ward Save', value: `${shootingWardSave}+` },
        ],
      },
    ]
    : [
      {
        title: 'To hit',
        items: [
          { label: 'Mode', value: 'Throw' },
          { label: 'Dice count', value: shootingDiceCount },
          { label: 'Balistic Skill', value: shootingAutoHit ? '-' : ballisticSkill },
          { label: 'Modifiers', value: shootingAutoHit ? '-' : shootingModifiersLabel() },
          { label: 'Cover', value: shootingAutoHit ? '-' : shootingCoverLabel() },
          { label: 'Auto-hit', value: shootingAutoHit ? 'Yes' : 'No' },
          { label: 'Poisoned Attack', value: shootingPoisonedAttack ? 'Yes' : 'No' },
          { label: 'Re-roll to hit', value: formatRerollLabel(shootingRerollHit) },
        ],
      },
      {
        title: 'To wound',
        items: [
          { label: 'Hit Strength', value: shootingHitStrength },
          { label: 'Target Toughness', value: shootingTargetToughness },
          { label: 'Re-roll to wound', value: formatRerollLabel(shootingRerollWound) },
        ],
      },
      {
        title: 'Savings',
        items: [
          { label: 'Armor Save', value: `${shootingArmorSave}+` },
          { label: 'Ward Save', value: `${shootingWardSave}+` },
        ],
      },
    ];

  const generalSummarySections = [
    {
      title: 'General throw',
      items: [
        { label: 'Mode', value: generalMode === 'probability' ? 'Probability' : 'Throw' },
        { label: 'Dice count', value: generalDiceCount },
        { label: 'Objective', value: generalObjective === 'target' ? 'Target value' : 'Total throw' },
        { label: 'Target value', value: generalObjective === 'target' ? `${generalTargetValue}+` : '-' },
        { label: 'Re-roll', value: formatRerollLabel(generalReroll) },
      ],
    },
  ];

  const moraleSummarySections = [
    {
      title: 'Break / Morale check',
      items: [
        { label: 'Discipline', value: moraleDiscipline },
        { label: 'Bonus', value: moraleBonus },
        { label: 'Malus', value: moraleMalus },
        { label: 'Stubborn', value: moraleStubborn ? 'Yes' : 'No' },
        { label: 'With three dice', value: moraleWithThreeDice ? 'Yes' : 'No' },
        { label: 'Re-roll', value: formatRerollLabel(moraleReroll) },
      ],
    },
  ];

  const trechSummarySections = [
    {
      title: 'Generic roll',
      items: [
        { label: '+Dice', value: trechPlusDice },
        { label: '-Dice', value: trechMinusDice },
        { label: 'Positive modifier', value: trechPositiveModifier },
        { label: 'Negative modifier', value: trechNegativeModifier },
        { label: 'Success target', value: '7+' },
      ],
    },
  ];

  const trechInjurySummarySections = [
    {
      title: 'Injury roll',
      items: [
        { label: '+Dice', value: trechInjuryPlusDice },
        { label: '-Dice', value: trechInjuryMinusDice },
        { label: 'Positive modifier', value: trechInjuryPositiveModifier },
        { label: 'Negative modifier', value: trechInjuryNegativeModifier },
      ],
    },
  ];

  const trechInjuryResultsNode = trechInjuryResults ? (
    <Card className="mt-5 bg-stone-50 px-4 py-4 sm:px-6 sm:py-5">
      <h3 className="text-lg font-semibold text-zinc-900">Results</h3>
      <div className="mt-4 space-y-2 text-sm">
        <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2">
          <span className="text-zinc-600">Selected dice</span>
          <span className="font-mono text-lg text-zinc-900">{trechInjuryResults.selectedRolls.join(' + ')}</span>
        </p>
        <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2">
          <span className="text-zinc-600">Base total</span>
          <span className="font-mono text-lg text-zinc-900">{trechInjuryResults.baseTotal}</span>
        </p>
        <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2">
          <span className="text-zinc-600">Final total</span>
          <span className="font-mono text-lg text-zinc-900">{trechInjuryResults.finalTotal}</span>
        </p>
        <div className="w-full flex items-center justify-between border-2 border-zinc-900 bg-zinc-900 px-4 py-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-200">
              Outcome
            </span>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-300">
              Injury table
            </p>
          </div>
          <span className="font-mono text-2xl font-bold text-white sm:text-3xl">
            {trechInjuryResults.outcome}
          </span>
        </div>
        <p className="text-xs text-zinc-600">
          Rolls: <span className="font-mono text-zinc-900">{trechInjuryResults.rolls.join(', ') || '-'}</span>
        </p>
      </div>
    </Card>
  ) : (
    <Card className="mt-5 bg-stone-50 px-4 py-4 sm:px-6 sm:py-5">
      <h3 className="text-lg font-semibold text-zinc-900">Results</h3>
      <p className="mt-3 text-sm text-zinc-600">No results yet.</p>
    </Card>
  );

  const trechResultsNode = trechResults ? (
    <Card className="mt-5 bg-stone-50 px-4 py-4 sm:px-6 sm:py-5">
      <h3 className="text-lg font-semibold text-zinc-900">Results</h3>
      <div className="mt-4 space-y-2 text-sm">
        <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2">
          <span className="text-zinc-600">Selected dice</span>
          <span className="font-mono text-lg text-zinc-900">{trechResults.selectedRolls.join(' + ')}</span>
        </p>
        <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2">
          <span className="text-zinc-600">Base total</span>
          <span className="font-mono text-lg text-zinc-900">{trechResults.baseTotal}</span>
        </p>
        <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2">
          <span className="text-zinc-600">Final total</span>
          <span className="font-mono text-lg text-zinc-900">{trechResults.finalTotal}</span>
        </p>
        <div className="w-full flex items-center justify-between border-2 border-zinc-900 bg-zinc-900 px-4 py-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-200">
              Outcome
            </span>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-300">
              Success on 7+
            </p>
          </div>
          <span className="font-mono text-2xl font-bold text-white sm:text-3xl">
            {trechResults.success ? 'Success' : 'Failed'}
          </span>
        </div>
        <p className="text-xs text-zinc-600">
          Rolls: <span className="font-mono text-zinc-900">{trechResults.rolls.join(', ') || '-'}</span>
        </p>
      </div>
    </Card>
  ) : (
    <Card className="mt-5 bg-stone-50 px-4 py-4 sm:px-6 sm:py-5">
      <h3 className="text-lg font-semibold text-zinc-900">Results</h3>
      <p className="mt-3 text-sm text-zinc-600">No results yet.</p>
    </Card>
  );

  const generalResultsNode = generalMode === 'probability'
    ? (
      <Card className="mt-5 bg-stone-50 px-4 py-4 sm:px-6 sm:py-5">
        <h3 className="text-lg font-semibold text-zinc-900">Results</h3>
        <div className="mt-4 space-y-3 text-sm">
          {generalObjective === 'target' ? (
            <>
              <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2">
                <span className="text-zinc-600">Average successes</span>
                <span className="font-mono text-lg text-zinc-900">
                  {generalAverageResults.averageSuccesses.toFixed(2)}
                </span>
              </p>
              <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2">
                <span className="text-zinc-600">Success chance</span>
                <span className="font-mono text-lg text-zinc-900">
                  {(generalAverageResults.successChance * 100).toFixed(2)}%
                </span>
              </p>
            </>
          ) : (
            <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2">
              <span className="text-zinc-600">Average total</span>
              <span className="font-mono text-lg text-zinc-900">
                {generalAverageResults.averageTotal.toFixed(2)}
              </span>
            </p>
          )}
          <div className="w-full flex items-center justify-between border-2 border-zinc-900 bg-zinc-900 px-4 py-3">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-200">
                {generalObjective === 'target' ? 'Average successes' : 'Average total'}
              </span>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-300">
                Real value: {generalObjective === 'target'
                  ? generalAverageResults.averageSuccesses.toFixed(2)
                  : generalAverageResults.averageTotal.toFixed(2)}
              </p>
            </div>
            <span className="font-mono text-2xl font-bold text-white sm:text-3xl">
              {Math.round(generalObjective === 'target'
                ? generalAverageResults.averageSuccesses
                : generalAverageResults.averageTotal)}
            </span>
          </div>
        </div>
      </Card>
    )
    : (
      <Card className="mt-5 bg-stone-50 px-4 py-4 sm:px-6 sm:py-5">
        <h3 className="text-lg font-semibold text-zinc-900">Results</h3>
        <div className="mt-4 space-y-2 text-sm">
          {generalObjective === 'target' ? (
            <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2">
              <span className="text-zinc-600">Number of successes</span>
              <span className="font-mono text-lg text-zinc-900">{generalThrowResults.successes}</span>
            </p>
          ) : (
            <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2">
              <span className="text-zinc-600">Total throw</span>
              <span className="font-mono text-lg text-zinc-900">{generalThrowResults.total}</span>
            </p>
          )}
          <div className="w-full flex items-center justify-between border-2 border-zinc-900 bg-zinc-900 px-4 py-3">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-200">
                {generalObjective === 'target' ? 'Successes' : 'Total'}
              </span>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-300">
                {generalObjective === 'target'
                  ? `Out of ${generalDiceCount} dice`
                  : `From ${generalDiceCount} dice`}
              </p>
            </div>
            <span className="font-mono text-2xl font-bold text-white sm:text-3xl">
              {generalObjective === 'target' ? generalThrowResults.successes : generalThrowResults.total}
            </span>
          </div>
          <p className="text-xs text-zinc-600">
            Rolls: <span className="font-mono text-zinc-900">{generalThrowResults.rolls.join(', ') || '-'}</span>
          </p>
        </div>
      </Card>
    );

  const moraleResultsNode = moraleResults ? (
    <Card className="mt-5 bg-stone-50 px-4 py-4 sm:px-6 sm:py-5">
      <h3 className="text-lg font-semibold text-zinc-900">Results</h3>
      <div className="mt-4 space-y-2 text-sm">
        <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2">
          <span className="text-zinc-600">Target value</span>
          <span className="font-mono text-lg text-zinc-900">{moraleResults.target}</span>
        </p>
        <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2">
          <span className="text-zinc-600">Total</span>
          <span className="font-mono text-lg text-zinc-900">{moraleResults.total}</span>
        </p>
        <div className="w-full flex items-center justify-between border-2 border-zinc-900 bg-zinc-900 px-4 py-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-200">
              Outcome
            </span>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-300">
              Double one always passes
            </p>
          </div>
          <span className="font-mono text-2xl font-bold text-white sm:text-3xl">
            {moraleResults.outcome}
          </span>
        </div>
        <p className="text-xs text-zinc-600">
          Rolls: <span className="font-mono text-zinc-900">{moraleResults.rolls.join(', ') || '-'}</span>
        </p>
        <p className="text-xs text-zinc-600">
          Used rolls: <span className="font-mono text-zinc-900">{moraleResults.usedRolls.join(', ') || '-'}</span>
        </p>
      </div>
    </Card>
  ) : (
    <Card className="mt-5 bg-stone-50 px-4 py-4 sm:px-6 sm:py-5">
      <h3 className="text-lg font-semibold text-zinc-900">Results</h3>
      <p className="mt-3 text-sm text-zinc-600">No results yet.</p>
    </Card>
  );

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
            {!uiMode ? (
              <UiModeSelector onSelect={handleUiModeSelect} />
            ) : uiMode === 'classic' ? (
              !gameSystem ? (
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
              )
            ) : !gameSystem ? (
              <SystemSelector onSelect={handleSystemSelect} />
            ) : !newUiPhase ? (
              <NewUiPhaseSelector
                systemLabel={systemLabel}
                systemKey={gameSystem}
                onSelect={handleNewUiPhaseSelect}
                onBack={handleSystemBack}
              />
            ) : newUiView === 'mode' ? (
              <NewUiModeSelector onSelect={handleNewUiModeSelect} onBack={handleNewUiBack} />
            ) : newUiView === 'wizard' ? (
              newUiPhase === 'combat' ? (
                <NewUiCombatWizard
                  step={newUiStep}
                  mode={mode}
                  diceCount={diceCount}
                  hitValue={hitValue}
                  attackersAc={attackersAc}
                  defendersAc={defendersAc}
                  poisonedAttack={poisonedAttack}
                  hitStrength={hitStrength}
                  woundValue={woundValue}
                  targetToughness={targetToughness}
                  armorSave={armorSave}
                  wardSave={wardSave}
                  rerollHitConfig={combatRerollHit}
                  rerollWoundConfig={combatRerollWound}
                  onNext={handleNewUiNext}
                  onBack={handleNewUiBack}
                  onCalculate={handleNewUiCalculate}
                  onDiceCountChange={setDiceCount}
                  onHitValueChange={setHitValue}
                  onAttackersAcChange={setAttackersAc}
                  onDefendersAcChange={setDefendersAc}
                  onPoisonedAttackChange={setPoisonedAttack}
                  onHitStrengthChange={setHitStrength}
                  onWoundValueChange={setWoundValue}
                  onTargetToughnessChange={setTargetToughness}
                  onArmorSaveChange={setArmorSave}
                  onWardSaveChange={setWardSave}
                  onRerollHitChange={setCombatRerollHit}
                  onRerollWoundChange={setCombatRerollWound}
                />
              ) : newUiPhase === 'shooting' ? (
                <NewUiShootingWizard
                  step={newUiStep}
                  mode={shootingMode}
                  diceCount={shootingDiceCount}
                  ballisticSkill={ballisticSkill}
                  resultNeeded={getShootingResultNeeded()}
                  modifiers={shootingModifiers}
                  poisonedAttack={shootingPoisonedAttack}
                  autoHit={shootingAutoHit}
                  hitStrength={shootingHitStrength}
                  woundValue={shootingWoundValue}
                  targetToughness={shootingTargetToughness}
                  armorSave={shootingArmorSave}
                  wardSave={shootingWardSave}
                  rerollHitConfig={shootingRerollHit}
                  rerollWoundConfig={shootingRerollWound}
                  onNext={handleNewUiNext}
                  onBack={handleNewUiBack}
                  onCalculate={handleNewUiCalculate}
                  onDiceCountChange={setShootingDiceCount}
                  onBallisticSkillChange={setBallisticSkill}
                  onModifierChange={handleShootingModifierChange}
                  onPoisonedAttackChange={setShootingPoisonedAttack}
                  onAutoHitChange={handleShootingAutoHitChange}
                  onHitStrengthChange={setShootingHitStrength}
                  onWoundValueChange={setShootingWoundValue}
                  onTargetToughnessChange={setShootingTargetToughness}
                  onArmorSaveChange={setShootingArmorSave}
                  onWardSaveChange={setShootingWardSave}
                  onRerollHitChange={setShootingRerollHit}
                  onRerollWoundChange={setShootingRerollWound}
                />
              ) : newUiPhase === 'general' ? (
                <NewUiGeneralWizard
                  step={newUiStep}
                  mode={generalMode}
                  diceCount={generalDiceCount}
                  objective={generalObjective}
                  targetValue={generalTargetValue}
                  rerollConfig={generalReroll}
                  onNext={handleNewUiNext}
                  onBack={handleNewUiBack}
                  onCalculate={handleNewUiCalculate}
                  onDiceCountChange={setGeneralDiceCount}
                  onObjectiveChange={setGeneralObjective}
                  onTargetValueChange={setGeneralTargetValue}
                  onRerollChange={setGeneralReroll}
                />
              ) : newUiPhase === 'morale' ? (
                <NewUiMoraleWizard
                  step={newUiStep}
                  discipline={moraleDiscipline}
                  bonus={moraleBonus}
                  malus={moraleMalus}
                  stubborn={moraleStubborn}
                  withThreeDice={moraleWithThreeDice}
                  rerollConfig={moraleReroll}
                  onNext={handleNewUiNext}
                  onBack={handleNewUiBack}
                  onCalculate={handleNewUiCalculate}
                  onDisciplineChange={setMoraleDiscipline}
                  onBonusChange={setMoraleBonus}
                  onMalusChange={setMoraleMalus}
                  onStubbornChange={setMoraleStubborn}
                  onWithThreeDiceChange={setMoraleWithThreeDice}
                  onRerollChange={setMoraleReroll}
                />
              ) : newUiPhase === 'tc-generic' ? (
                <NewUiTrechGenericWizard
                  step={newUiStep}
                  plusDice={trechPlusDice}
                  minusDice={trechMinusDice}
                  positiveModifier={trechPositiveModifier}
                  negativeModifier={trechNegativeModifier}
                  onNext={handleNewUiNext}
                  onBack={handleNewUiBack}
                  onCalculate={handleNewUiCalculate}
                  onPlusDiceChange={setTrechPlusDice}
                  onMinusDiceChange={setTrechMinusDice}
                  onPositiveModifierChange={setTrechPositiveModifier}
                  onNegativeModifierChange={setTrechNegativeModifier}
                />
              ) : newUiPhase === 'tc-injury' ? (
                <NewUiTrechInjuryWizard
                  step={newUiStep}
                  plusDice={trechInjuryPlusDice}
                  minusDice={trechInjuryMinusDice}
                  positiveModifier={trechInjuryPositiveModifier}
                  negativeModifier={trechInjuryNegativeModifier}
                  onNext={handleNewUiNext}
                  onBack={handleNewUiBack}
                  onCalculate={handleNewUiCalculate}
                  onPlusDiceChange={setTrechInjuryPlusDice}
                  onMinusDiceChange={setTrechInjuryMinusDice}
                  onPositiveModifierChange={setTrechInjuryPositiveModifier}
                  onNegativeModifierChange={setTrechInjuryNegativeModifier}
                />
              ) : null
            ) : newUiPhase === 'combat' ? (
              <NewUiSummary
                title="Combat summary"
                sections={combatSummarySections}
                results={mode === 'probability' ? (
                  <ProbabilityResultsCard results={results} poisonedAttack={poisonedAttack} />
                ) : (
                  <ThrowResultsCard results={throwResults} />
                )}
                debugLines={mode === 'probability'
                  ? [
                    { label: 'Initial rolls', value: '-' },
                    { label: 'Re-rolls', value: '-' },
                  ]
                  : [
                    { label: 'Hit initial rolls', value: throwDebug.hitInitialRolls.join(', ') || '-' },
                    { label: 'Hit re-rolls', value: throwDebug.hitRerollRolls.join(', ') || '-' },
                    { label: 'Wound initial rolls', value: throwDebug.woundInitialRolls.join(', ') || '-' },
                    { label: 'Wound re-rolls', value: throwDebug.woundRerollRolls.join(', ') || '-' },
                  ]}
                onReroll={handleNewUiReroll}
                onBackToStart={handleNewUiBackToStart}
              />
            ) : newUiPhase === 'shooting' ? (
              <NewUiSummary
                title="Shooting summary"
                sections={shootingSummarySections}
                results={shootingMode === 'probability' ? (
                  <ProbabilityResultsCard
                    results={shootingProbabilityResults}
                    poisonedAttack={shootingPoisonedAttack && getShootingResultNeeded() <= 6 && !shootingAutoHit}
                  />
                ) : (
                  <ProbabilityResultsCard
                    results={shootingThrowResults}
                    poisonedAttack={shootingPoisonedAttack && getShootingResultNeeded() <= 6 && !shootingAutoHit}
                  />
                )}
                debugLines={shootingMode === 'probability'
                  ? [
                    { label: 'Initial rolls', value: '-' },
                    { label: 'Re-rolls', value: '-' },
                  ]
                  : [
                    { label: 'Hit initial rolls', value: shootingDebug.hitInitialRolls.join(', ') || '-' },
                    { label: 'Hit re-rolls', value: shootingDebug.hitRerollRolls.join(', ') || '-' },
                    { label: 'Wound initial rolls', value: shootingDebug.woundInitialRolls.join(', ') || '-' },
                    { label: 'Wound re-rolls', value: shootingDebug.woundRerollRolls.join(', ') || '-' },
                  ]}
                onReroll={handleNewUiReroll}
                onBackToStart={handleNewUiBackToStart}
              />
            ) : newUiPhase === 'general' ? (
              <NewUiSummary
                title="General throw summary"
                sections={generalSummarySections}
                results={generalResultsNode}
                debugLines={generalMode === 'probability'
                  ? [
                    { label: 'Initial rolls', value: '-' },
                    { label: 'Re-rolls', value: '-' },
                  ]
                  : [
                    { label: 'Initial rolls', value: generalDebug.initialRolls.join(', ') || '-' },
                    { label: 'Re-rolls', value: generalDebug.rerollRolls.join(', ') || '-' },
                    { label: 'Final rolls', value: generalDebug.finalRolls.join(', ') || '-' },
                  ]}
                onReroll={handleNewUiReroll}
                onBackToStart={handleNewUiBackToStart}
              />
            ) : newUiPhase === 'tc-generic' ? (
              <NewUiSummary
                title="Generic roll summary"
                sections={trechSummarySections}
                results={trechResultsNode}
                debugLines={[
                  { label: 'Initial rolls', value: trechDebug.rolls.join(', ') || '-' },
                  { label: 'Selected rolls', value: trechDebug.selectedRolls.join(', ') || '-' },
                ]}
                onReroll={handleNewUiReroll}
                onBackToStart={handleNewUiBackToStart}
              />
            ) : newUiPhase === 'tc-injury' ? (
              <NewUiSummary
                title="Injury roll summary"
                sections={trechInjurySummarySections}
                results={trechInjuryResultsNode}
                debugLines={[
                  { label: 'Initial rolls', value: trechInjuryDebug.rolls.join(', ') || '-' },
                  { label: 'Selected rolls', value: trechInjuryDebug.selectedRolls.join(', ') || '-' },
                ]}
                onReroll={handleNewUiReroll}
                onBackToStart={handleNewUiBackToStart}
              />
            ) : (
              <NewUiSummary
                title="Break / Morale check summary"
                sections={moraleSummarySections}
                results={moraleResultsNode}
                debugLines={[
                  { label: 'Initial rolls', value: moraleDebug.initialRolls.join(', ') || '-' },
                  { label: 'Re-rolls', value: moraleDebug.rerollRolls.join(', ') || '-' },
                  { label: 'Final rolls', value: moraleDebug.finalRolls.join(', ') || '-' },
                ]}
                onReroll={handleNewUiReroll}
                onBackToStart={handleNewUiBackToStart}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
