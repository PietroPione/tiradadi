export interface DiceCalculatorInput {
  diceCount: number;
  hitValue: number;
  poisonedAttack: boolean;
  predatoryFighterCount?: number;
  hitStrength: number;
  woundValue: number;
  armorSave: number;
  wardSave: number;
  rerollHitConfig?: RerollConfig;
  rerollWoundConfig?: RerollConfig;
  rerollArmorConfig?: RerollConfig;
  rerollWardConfig?: RerollConfig;
}

export interface DiceCalculatorOutput {
  successfulHits: number;
  successfulWounds: number;
  poisonedAutoWounds: number;
  failedArmorSaves: number;
  failedWardSaves: number;
  finalDamage: number;
}

export type RerollConfig = {
  enabled: boolean;
  mode: 'failed' | 'success';
  scope: 'all' | 'specific';
  specificValues: number[];
};

const shouldRerollValue = (
  value: number,
  target: number,
  config?: RerollConfig,
): boolean => {
  if (!config?.enabled) {
    return false;
  }
  const isSuccess = value >= target;
  if (config.mode === 'failed' && isSuccess) {
    return false;
  }
  if (config.mode === 'success' && !isSuccess) {
    return false;
  }
  if (config.scope === 'all') {
    return true;
  }
  return config.specificValues.includes(value);
};

const getFaceProbabilitiesWithReroll = (
  target: number,
  config?: RerollConfig,
) => {
  let rerollCount = 0;
  const rerollable = new Set<number>();
  for (let value = 1; value <= 6; value += 1) {
    if (shouldRerollValue(value, target, config)) {
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
  return { successChance, sixChance };
};

export const calculateAverages = ({
  diceCount,
  hitValue,
  poisonedAttack,
  predatoryFighterCount = 0,
  hitStrength,
  woundValue,
  armorSave,
  wardSave,
  rerollHitConfig,
  rerollWoundConfig,
  rerollArmorConfig,
  rerollWardConfig,
}: DiceCalculatorInput): DiceCalculatorOutput => {
  const hitProbabilities = getFaceProbabilitiesWithReroll(hitValue, rerollHitConfig);
  const poisonedAutoWoundChance = poisonedAttack ? hitProbabilities.sixChance : 0;
  const nonPoisonHitChance = poisonedAttack
    ? Math.max(0, hitProbabilities.successChance - hitProbabilities.sixChance)
    : hitProbabilities.successChance;
  const hitChance = poisonedAttack
    ? poisonedAutoWoundChance + nonPoisonHitChance
    : nonPoisonHitChance;
  const cappedPredatory = Math.min(predatoryFighterCount, diceCount);
  const extraAttacks = cappedPredatory * hitProbabilities.sixChance;
  const totalAttacks = diceCount + extraAttacks;
  const woundChance = getFaceProbabilitiesWithReroll(woundValue, rerollWoundConfig).successChance;
  const armorSaveModifier = hitStrength - 3;
  const effectiveArmorSave = armorSave + armorSaveModifier;
  const armorSaveChance = effectiveArmorSave > 1
    ? getFaceProbabilitiesWithReroll(effectiveArmorSave, rerollArmorConfig).successChance
    : 0;
  const wardSaveChance = wardSave > 1
    ? getFaceProbabilitiesWithReroll(wardSave, rerollWardConfig).successChance
    : 0;

  const successfulHits = totalAttacks * hitChance;
  const autoWounds = totalAttacks * poisonedAutoWoundChance;
  const hitsToWound = poisonedAttack ? totalAttacks * nonPoisonHitChance : successfulHits;
  const successfulWounds = poisonedAttack
    ? autoWounds + hitsToWound * woundChance
    : successfulHits * woundChance;
  const failedArmorSaves = successfulWounds * (1 - armorSaveChance);
  const failedWardSaves = failedArmorSaves * (1 - wardSaveChance);
  const finalDamage = failedWardSaves;

  return {
    successfulHits: parseFloat(successfulHits.toFixed(2)),
    successfulWounds: parseFloat(successfulWounds.toFixed(2)),
    poisonedAutoWounds: parseFloat(autoWounds.toFixed(2)),
    failedArmorSaves: parseFloat(failedArmorSaves.toFixed(2)),
    failedWardSaves: parseFloat(failedWardSaves.toFixed(2)),
    finalDamage: parseFloat(finalDamage.toFixed(2)),
  };
};
