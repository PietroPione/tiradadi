export type TrechSelectionMode = 'highest' | 'lowest' | 'normal';

export type TrechGenericInput = {
  plusDice: number;
  minusDice: number;
  positiveModifier: number;
  negativeModifier: number;
};

export type TrechGenericRollResult = {
  rolls: number[];
  selectedRolls: number[];
  baseTotal: number;
  finalTotal: number;
  success: boolean;
  selectionMode: TrechSelectionMode;
  baseDice: number;
  totalDice: number;
  netDice: number;
};

export type TrechGenericProbabilityResult = {
  expectedTotal: number;
  successChance: number;
  selectionMode: TrechSelectionMode;
  baseDice: number;
  totalDice: number;
  netDice: number;
};

export type TrechInjuryInput = {
  plusDice: number;
  minusDice: number;
  positiveModifier: number;
  negativeModifier: number;
  withThreeDice: boolean;
  targetArmor: number;
  noArmorSave: boolean;
  armorPositiveModifier: number;
  armorNegativeModifier: number;
};

export type TrechInjuryOutcome = 'No effect' | 'Minor hit' | 'Down' | 'Out of action';

export type TrechInjuryRollResult = {
  rolls: number[];
  selectedRolls: number[];
  baseTotal: number;
  finalTotal: number;
  outcome: TrechInjuryOutcome;
  selectionMode: TrechSelectionMode;
  baseDice: number;
  totalDice: number;
  netDice: number;
  armorApplied: number;
};

export type TrechInjuryProbabilityResult = {
  expectedTotal: number;
  outcomeChances: {
    noEffect: number;
    minorHit: number;
    down: number;
    outOfAction: number;
  };
  selectionMode: TrechSelectionMode;
  baseDice: number;
  totalDice: number;
  netDice: number;
  armorApplied: number;
};

const rollDie = (rng: () => number) => Math.floor(rng() * 6) + 1;

const rollDice = (count: number, rng: () => number) => (
  Array.from({ length: count }, () => rollDie(rng))
);

const selectRolls = (rolls: number[], baseDice: number, netDice: number) => {
  const sorted = [...rolls].sort((a, b) => a - b);
  if (netDice > 0) {
    return { selectedRolls: sorted.slice(-baseDice), selectionMode: 'highest' as const };
  }
  if (netDice < 0) {
    return { selectedRolls: sorted.slice(0, baseDice), selectionMode: 'lowest' as const };
  }
  return { selectedRolls: sorted, selectionMode: 'normal' as const };
};

const resolveArmor = (input: TrechInjuryInput) => (
  input.noArmorSave
    ? 0
    : Math.max(0, input.targetArmor + input.armorPositiveModifier - input.armorNegativeModifier)
);

const resolveOutcome = (finalTotal: number): TrechInjuryOutcome => {
  if (finalTotal <= 1) {
    return 'No effect';
  }
  if (finalTotal <= 6) {
    return 'Minor hit';
  }
  if (finalTotal <= 8) {
    return 'Down';
  }
  return 'Out of action';
};

export const calculateTrechGenericRoll = (
  input: TrechGenericInput,
  rng: () => number = Math.random,
): TrechGenericRollResult => {
  const baseDice = 2;
  const netDice = input.plusDice - input.minusDice;
  const totalDice = baseDice + Math.abs(netDice);
  const rolls = rollDice(totalDice, rng);
  const { selectedRolls, selectionMode } = selectRolls(rolls, baseDice, netDice);
  const baseTotal = selectedRolls.reduce((sum, roll) => sum + roll, 0);
  const finalTotal = baseTotal + input.positiveModifier - input.negativeModifier;

  return {
    rolls,
    selectedRolls,
    baseTotal,
    finalTotal,
    success: finalTotal >= 7,
    selectionMode,
    baseDice,
    totalDice,
    netDice,
  };
};

export const calculateTrechGenericProbability = (
  input: TrechGenericInput,
  iterations = 20000,
  rng: () => number = Math.random,
): TrechGenericProbabilityResult => {
  const baseDice = 2;
  const netDice = input.plusDice - input.minusDice;
  const totalDice = baseDice + Math.abs(netDice);
  let totalSum = 0;
  let successCount = 0;
  let selectionMode: TrechSelectionMode = 'normal';

  for (let i = 0; i < iterations; i += 1) {
    const rolls = rollDice(totalDice, rng);
    const selection = selectRolls(rolls, baseDice, netDice);
    selectionMode = selection.selectionMode;
    const baseTotal = selection.selectedRolls.reduce((sum, roll) => sum + roll, 0);
    const finalTotal = baseTotal + input.positiveModifier - input.negativeModifier;
    totalSum += finalTotal;
    if (finalTotal >= 7) {
      successCount += 1;
    }
  }

  return {
    expectedTotal: totalSum / iterations,
    successChance: successCount / iterations,
    selectionMode,
    baseDice,
    totalDice,
    netDice,
  };
};

export const calculateTrechInjuryRoll = (
  input: TrechInjuryInput,
  rng: () => number = Math.random,
): TrechInjuryRollResult => {
  const baseDice = input.withThreeDice ? 3 : 2;
  const netDice = input.plusDice - input.minusDice;
  const totalDice = baseDice + Math.abs(netDice);
  const rolls = rollDice(totalDice, rng);
  const { selectedRolls, selectionMode } = selectRolls(rolls, baseDice, netDice);
  const baseTotal = selectedRolls.reduce((sum, roll) => sum + roll, 0);
  const armorApplied = resolveArmor(input);
  const finalTotal = baseTotal + input.positiveModifier - input.negativeModifier - armorApplied;

  return {
    rolls,
    selectedRolls,
    baseTotal,
    finalTotal,
    outcome: resolveOutcome(finalTotal),
    selectionMode,
    baseDice,
    totalDice,
    netDice,
    armorApplied,
  };
};

export const calculateTrechInjuryProbability = (
  input: TrechInjuryInput,
  iterations = 20000,
  rng: () => number = Math.random,
): TrechInjuryProbabilityResult => {
  const baseDice = input.withThreeDice ? 3 : 2;
  const netDice = input.plusDice - input.minusDice;
  const totalDice = baseDice + Math.abs(netDice);
  const armorApplied = resolveArmor(input);
  let totalSum = 0;
  const outcomeCounts = { noEffect: 0, minorHit: 0, down: 0, outOfAction: 0 };
  let selectionMode: TrechSelectionMode = 'normal';

  for (let i = 0; i < iterations; i += 1) {
    const rolls = rollDice(totalDice, rng);
    const selection = selectRolls(rolls, baseDice, netDice);
    selectionMode = selection.selectionMode;
    const baseTotal = selection.selectedRolls.reduce((sum, roll) => sum + roll, 0);
    const finalTotal = baseTotal + input.positiveModifier - input.negativeModifier - armorApplied;
    totalSum += finalTotal;
    if (finalTotal <= 1) {
      outcomeCounts.noEffect += 1;
    } else if (finalTotal <= 6) {
      outcomeCounts.minorHit += 1;
    } else if (finalTotal <= 8) {
      outcomeCounts.down += 1;
    } else {
      outcomeCounts.outOfAction += 1;
    }
  }

  return {
    expectedTotal: totalSum / iterations,
    outcomeChances: {
      noEffect: outcomeCounts.noEffect / iterations,
      minorHit: outcomeCounts.minorHit / iterations,
      down: outcomeCounts.down / iterations,
      outOfAction: outcomeCounts.outOfAction / iterations,
    },
    selectionMode,
    baseDice,
    totalDice,
    netDice,
    armorApplied,
  };
};
