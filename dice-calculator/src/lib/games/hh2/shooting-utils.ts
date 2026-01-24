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

export type Hh2WoundProfile = {
  target: number | null;
  impossible: boolean;
  instantDeath: boolean;
};

type Hh2HitOptions = {
  nightFighting?: boolean;
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

const applyNightFighting = (target: number, enabled?: boolean) => (
  enabled ? Math.min(6, target + 1) : target
);

export const getHh2HitProfile = (ballisticSkill: number, options: Hh2HitOptions = {}): Hh2HitProfile => {
  if (Number.isNaN(ballisticSkill)) {
    return { baseTarget: Number.NaN, followUpTarget: null };
  }
  if (ballisticSkill <= 5) {
    const baseTarget = Math.min(6, Math.max(2, 7 - ballisticSkill));
    return { baseTarget: applyNightFighting(baseTarget, options.nightFighting), followUpTarget: null };
  }
  if (ballisticSkill === 6) {
    return {
      baseTarget: applyNightFighting(2, options.nightFighting),
      followUpTarget: applyNightFighting(6, options.nightFighting),
    };
  }
  if (ballisticSkill === 7) {
    return {
      baseTarget: applyNightFighting(2, options.nightFighting),
      followUpTarget: applyNightFighting(5, options.nightFighting),
    };
  }
  if (ballisticSkill === 8) {
    return {
      baseTarget: applyNightFighting(2, options.nightFighting),
      followUpTarget: applyNightFighting(4, options.nightFighting),
    };
  }
  if (ballisticSkill === 9) {
    return {
      baseTarget: applyNightFighting(2, options.nightFighting),
      followUpTarget: applyNightFighting(3, options.nightFighting),
    };
  }
  return {
    baseTarget: applyNightFighting(2, options.nightFighting),
    followUpTarget: applyNightFighting(2, options.nightFighting),
  };
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
  options: Hh2HitOptions = {},
) => {
  const profile = getHh2HitProfile(ballisticSkill, options);
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
  options: Hh2HitOptions = {},
  rng: () => number = Math.random,
) => {
  const profile = getHh2HitProfile(ballisticSkill, options);
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

export const getHh2WoundProfile = (strength: number, toughness: number): Hh2WoundProfile => {
  if (Number.isNaN(strength) || Number.isNaN(toughness)) {
    return { target: null, impossible: false, instantDeath: false };
  }
  if (toughness >= strength * 2) {
    return { target: null, impossible: true, instantDeath: false };
  }
  const instantDeath = strength >= toughness * 2;
  let target = 6;
  if (strength >= toughness + 2) {
    target = 2;
  } else if (strength === toughness + 1) {
    target = 3;
  } else if (strength === toughness) {
    target = 4;
  } else if (strength === toughness - 1) {
    target = 5;
  }
  return { target, impossible: false, instantDeath };
};

export const getHh2WoundSuccessChance = (strength: number, toughness: number) => {
  const profile = getHh2WoundProfile(strength, toughness);
  if (profile.target === null) {
    return profile.impossible ? 0 : Number.NaN;
  }
  return (7 - profile.target) / 6;
};
