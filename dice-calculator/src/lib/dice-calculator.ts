export interface DiceCalculatorInput {
  diceCount: number;
  hitValue: number;
  poisonedAttack: boolean;
  hitStrength: number;
  woundValue: number;
  armorSave: number;
  wardSave: number;
}

export interface DiceCalculatorOutput {
  successfulHits: number;
  successfulWounds: number;
  poisonedAutoWounds: number;
  failedArmorSaves: number;
  failedWardSaves: number;
  finalDamage: number;
}

const getChance = (value: number): number => {
  if (value <= 1) {
    return 0;
  }
  return Math.max(0, Math.min(1, (7 - value) / 6));
};

const getNonPoisonHitChance = (value: number): number => {
  return Math.max(0, getChance(value) - 1 / 6);
};

export const calculateAverages = ({
  diceCount,
  hitValue,
  poisonedAttack,
  hitStrength,
  woundValue,
  armorSave,
  wardSave,
}: DiceCalculatorInput): DiceCalculatorOutput => {
  const poisonedAutoWoundChance = poisonedAttack ? 1 / 6 : 0;
  const nonPoisonHitChance = poisonedAttack
    ? getNonPoisonHitChance(hitValue)
    : getChance(hitValue);
  const hitChance = poisonedAttack
    ? poisonedAutoWoundChance + nonPoisonHitChance
    : nonPoisonHitChance;
  const woundChance = getChance(woundValue);
  const armorSaveModifier = hitStrength - 3;
  const effectiveArmorSave = armorSave + armorSaveModifier;
  const armorSaveChance = getChance(effectiveArmorSave);
  const wardSaveChance = getChance(wardSave);

  const successfulHits = diceCount * hitChance;
  const autoWounds = diceCount * poisonedAutoWoundChance;
  const hitsToWound = poisonedAttack ? diceCount * nonPoisonHitChance : successfulHits;
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
