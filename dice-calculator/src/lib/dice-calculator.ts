export interface DiceCalculatorInput {
  diceCount: number;
  hitValue: number;
  woundValue: number;
  armorSave: number;
  wardSave: number;
}

export interface DiceCalculatorOutput {
  successfulHits: number;
  successfulWounds: number;
  failedArmorSaves: number;
  finalDamage: number;
}

const getChance = (value: number): number => {
  if (value <= 1) {
    return 0;
  }
  return Math.max(0, Math.min(1, (7 - value) / 6));
};

export const calculateAverages = ({
  diceCount,
  hitValue,
  woundValue,
  armorSave,
  wardSave,
}: DiceCalculatorInput): DiceCalculatorOutput => {
  const hitChance = getChance(hitValue);
  const woundChance = getChance(woundValue);
  const armorSaveChance = getChance(armorSave);
  const wardSaveChance = getChance(wardSave);

  const successfulHits = diceCount * hitChance;
  const successfulWounds = successfulHits * woundChance;
  const failedArmorSaves = successfulWounds * (1 - armorSaveChance);
  const finalDamage = failedArmorSaves * (1 - wardSaveChance);

  return {
    successfulHits: parseFloat(successfulHits.toFixed(2)),
    successfulWounds: parseFloat(successfulWounds.toFixed(2)),
    failedArmorSaves: parseFloat(failedArmorSaves.toFixed(2)),
    finalDamage: parseFloat(finalDamage.toFixed(2)),
  };
};
