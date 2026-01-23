export type Hh2RerollConfig = {
  enabled: boolean;
  mode: 'failed' | 'success';
  scope: 'all' | 'specific';
  specificValues: string;
};

export type Hh2HitProfile = {
  baseTarget: number;
  followUpTarget: number | null;
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
  config: Hh2RerollConfig,
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

export const getHh2HitProfile = (ballisticSkill: number): Hh2HitProfile => {
  if (Number.isNaN(ballisticSkill)) {
    return { baseTarget: Number.NaN, followUpTarget: null };
  }
  if (ballisticSkill <= 5) {
    const baseTarget = Math.min(6, Math.max(2, 7 - ballisticSkill));
    return { baseTarget, followUpTarget: null };
  }
  if (ballisticSkill === 6) {
    return { baseTarget: 2, followUpTarget: 6 };
  }
  if (ballisticSkill === 7) {
    return { baseTarget: 2, followUpTarget: 5 };
  }
  if (ballisticSkill === 8) {
    return { baseTarget: 2, followUpTarget: 4 };
  }
  if (ballisticSkill === 9) {
    return { baseTarget: 2, followUpTarget: 3 };
  }
  return { baseTarget: 2, followUpTarget: 2 };
};

const getSuccessChanceForTarget = (target: number) => {
  if (Number.isNaN(target)) {
    return Number.NaN;
  }
  if (target <= 2) {
    return 5 / 6;
  }
  if (target >= 6) {
    return 1 / 6;
  }
  return (7 - target) / 6;
};

export const getHh2HitSuccessChance = (
  ballisticSkill: number,
  config: Hh2RerollConfig,
) => {
  const profile = getHh2HitProfile(ballisticSkill);
  if (Number.isNaN(profile.baseTarget)) {
    return Number.NaN;
  }
  const specificValues = new Set(parseSpecificValues(config.specificValues));
  const rerollTarget = profile.followUpTarget ?? profile.baseTarget;
  const baseSuccessChance = getSuccessChanceForTarget(rerollTarget);
  let totalSuccessChance = 0;

  for (let roll = 1; roll <= 6; roll += 1) {
    const isSuccess = roll !== 1 && roll >= profile.baseTarget;
    const shouldReroll = (profile.followUpTarget !== null && !isSuccess)
      || shouldRerollValue(roll, isSuccess, config, specificValues);
    if (shouldReroll) {
      totalSuccessChance += (1 / 6) * baseSuccessChance;
    } else if (isSuccess) {
      totalSuccessChance += 1 / 6;
    }
  }

  return totalSuccessChance;
};

export const rollHh2Hit = (
  ballisticSkill: number,
  config: Hh2RerollConfig,
  rng: () => number = Math.random,
) => {
  const profile = getHh2HitProfile(ballisticSkill);
  const specificValues = new Set(parseSpecificValues(config.specificValues));
  const rollOnce = () => Math.floor(rng() * 6) + 1;
  let roll = rollOnce();
  let isSuccess = roll !== 1 && roll >= profile.baseTarget;
  const shouldReroll = (profile.followUpTarget !== null && !isSuccess)
    || shouldRerollValue(roll, isSuccess, config, specificValues);
  let reroll = null as number | null;

  if (shouldReroll) {
    reroll = rollOnce();
    const rerollTarget = profile.followUpTarget ?? profile.baseTarget;
    isSuccess = reroll !== 1 && reroll >= rerollTarget;
  }

  return {
    roll,
    reroll,
    success: shouldReroll ? isSuccess : roll !== 1 && roll >= profile.baseTarget,
  };
};
