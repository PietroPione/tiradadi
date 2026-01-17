type RerollStateLike = {
  enabled: boolean;
  mode: 'failed' | 'success';
  scope: 'all' | 'specific';
  specificValues: string;
};

export const parseSpecificValues = (input: string) => {
  return input
    .split(',')
    .map((value) => Number.parseInt(value.trim(), 10))
    .filter((value) => Number.isFinite(value) && value >= 1 && value <= 6);
};

export const shouldRerollValue = (
  value: number,
  isSuccess: boolean,
  config: RerollStateLike,
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

export const applyRerollWithDebug = (
  rolls: number[],
  target: number,
  config: RerollStateLike,
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

export const getFaceProbabilitiesWithReroll = (target: number, config?: RerollStateLike) => {
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

export const getShootingSuccessChanceWithReroll = (target: number, config: RerollStateLike) => {
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

export const getHitTarget = (attacker: number, defender: number) => {
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

export const getWoundTarget = (strength: number, toughness: number) => {
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
