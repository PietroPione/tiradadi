"use client";

import { useState } from 'react';
import { calculateAverages } from '@/lib/dice-calculator';

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
    failedArmorSaves: 0,
    failedWardSaves: 0,
    finalDamage: 0,
  });
  const [throwDebug, setThrowDebug] = useState({
    hitTarget: 0,
    woundTarget: 0,
    effectiveArmorSave: 0,
    hitRolls: [] as number[],
    woundRolls: [] as number[],
    armorRolls: [] as number[],
    wardRolls: [] as number[],
  });
  const [hasThrowResults, setHasThrowResults] = useState(false);

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
    const hitRolls = Array.from({ length: parsedDiceCount }, () => Math.floor(Math.random() * 6) + 1);
    const hitSuccesses = hitRolls.filter((roll) => roll >= hitTarget).length;

    const woundTarget = getWoundTarget(parsedHitStrength, parsedTargetToughness);
    const woundRolls = Array.from({ length: hitSuccesses }, () => Math.floor(Math.random() * 6) + 1);
    const woundSuccesses = woundRolls.filter((roll) => roll >= woundTarget).length;

    const effectiveArmorSave = parsedThrowArmorSave + (parsedHitStrength - 3);
    let failedArmorSaves = woundSuccesses;
    let armorRolls: number[] = [];
    if (effectiveArmorSave > 1 && effectiveArmorSave <= 6) {
      armorRolls = Array.from({ length: woundSuccesses }, () => Math.floor(Math.random() * 6) + 1);
      const armorSuccesses = armorRolls.filter((roll) => roll >= effectiveArmorSave).length;
      failedArmorSaves = woundSuccesses - armorSuccesses;
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
      successfulWounds: woundSuccesses,
      failedArmorSaves,
      failedWardSaves,
      finalDamage: failedWardSaves,
    });
    setThrowDebug({
      hitTarget,
      woundTarget,
      effectiveArmorSave,
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
    });
    setResults(newResults);
    setHasResults(true);
  };

  return (
    <div className="min-h-screen w-full px-4 py-10 sm:px-8">
      <div className="mx-auto w-full max-w-3xl">
        <div className="w-full border-2 border-zinc-900 bg-white shadow-[6px_6px_0_0_rgba(0,0,0,0.15)]">
          <div className="flex flex-col gap-4 border-b-2 border-zinc-900 px-6 py-6 sm:flex-row sm:items-end sm:justify-between sm:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
                Mathammer
              </p>
              <h1 className="mt-2 text-3xl font-bold text-zinc-900 sm:text-4xl">
                Dice Average Calculator
              </h1>
            </div>
            {mode === 'probability' && hasResults ? (
              <div className="border-2 border-zinc-900 bg-zinc-900 px-4 py-3 text-left sm:text-right">
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-200">
                  Final Damage
                </p>
                <p className="mt-1 font-mono text-xl font-bold text-white sm:text-2xl">
                  {Math.round(results.finalDamage)}
                </p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-300">
                  Real Damage: {results.finalDamage.toFixed(2)}
                </p>
              </div>
            ) : null}
          </div>

          <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setMode('probability')}
                className={`border-2 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
                  mode === 'probability'
                    ? 'border-zinc-900 bg-zinc-900 text-white'
                    : 'border-zinc-900 bg-white text-zinc-900'
                }`}
              >
                Probability calculator
              </button>
              <button
                type="button"
                onClick={() => setMode('throw')}
                className={`border-2 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
                  mode === 'throw'
                    ? 'border-zinc-900 bg-zinc-900 text-white'
                    : 'border-zinc-900 bg-white text-zinc-900'
                }`}
              >
                Throw dices
              </button>
            </div>

            {mode === 'probability' ? (
              <div className="border-2 border-zinc-900 bg-white px-4 py-5 sm:px-6 sm:py-6">
                <h2 className="text-lg font-semibold text-zinc-900">Probability calculator</h2>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                  <div>
                    <label htmlFor="diceCount" className="block">Dice Count</label>
                    <input
                      type="number"
                      id="diceCount"
                      value={diceCount}
                      min="1"
                      onChange={(e) => setDiceCount(e.target.value)}
                      className="mt-2 w-full border-2 border-zinc-900 bg-white px-3 py-2 font-mono text-base text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/30"
                    />
                  </div>
                  <div>
                    <label htmlFor="hitValue" className="block">To Hit (X+)</label>
                    <input
                      type="number"
                      id="hitValue"
                      value={hitValue}
                      min="1"
                      max="7"
                      onChange={(e) => setHitValue(e.target.value)}
                      className="mt-2 w-full border-2 border-zinc-900 bg-white px-3 py-2 font-mono text-base text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/30"
                    />
                    <div className="mt-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
                      <input
                        type="checkbox"
                        id="poisonedAttack"
                        checked={poisonedAttack}
                        onChange={(e) => setPoisonedAttack(e.target.checked)}
                        className="h-4 w-4 border-2 border-zinc-900"
                      />
                      <label htmlFor="poisonedAttack">Poisoned Attack</label>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="hitStrength" className="block">Hit Strength</label>
                    <input
                      type="number"
                      id="hitStrength"
                      value={hitStrength}
                      min="1"
                      max="10"
                      onChange={(e) => setHitStrength(e.target.value)}
                      className="mt-2 w-full border-2 border-zinc-900 bg-white px-3 py-2 font-mono text-base text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/30"
                    />
                  </div>
                  <div>
                    <label htmlFor="woundValue" className="block">To Wound (X+)</label>
                    <input
                      type="number"
                      id="woundValue"
                      value={woundValue}
                      min="1"
                      max="7"
                      onChange={(e) => setWoundValue(e.target.value)}
                      className="mt-2 w-full border-2 border-zinc-900 bg-white px-3 py-2 font-mono text-base text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/30"
                    />
                  </div>
                  <div>
                    <label htmlFor="armorSave" className="block">Armor Save (X+)</label>
                    <input
                      type="number"
                      id="armorSave"
                      value={armorSave}
                      min="1"
                      max="7"
                      onChange={(e) => setArmorSave(e.target.value)}
                      className="mt-2 w-full border-2 border-zinc-900 bg-white px-3 py-2 font-mono text-base text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/30"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="wardSave" className="block">Ward Save (X+)</label>
                    <input
                      type="number"
                      id="wardSave"
                      value={wardSave}
                      min="0"
                      max="7"
                      onChange={(e) => setWardSave(e.target.value)}
                      className="mt-2 w-full border-2 border-zinc-900 bg-white px-3 py-2 font-mono text-base text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/30"
                    />
                  </div>
                </div>

                <button
                  onClick={handleCalculate}
                  className="mt-5 w-full border-2 border-zinc-900 py-3 text-base font-semibold uppercase tracking-[0.2em]"
                >
                  Calculate
                </button>
                {errorMessage ? (
                  <p className="mt-4 border-2 border-zinc-900 bg-zinc-100 px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-zinc-700">
                    {errorMessage}
                  </p>
                ) : null}

                <div className="mt-5 border-2 border-zinc-900 bg-stone-50 px-4 py-4 sm:px-6 sm:py-5">
                  <h2 className="text-lg font-semibold text-zinc-900">Results</h2>
                  <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                    <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2 sm:border-b-0 sm:pb-0">
                      <span className="text-zinc-600">Successful Hits</span>
                      <span className="font-mono text-lg text-zinc-900">{results.successfulHits}</span>
                    </p>
                    {poisonedAttack ? (
                      <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2 sm:border-b-0 sm:pb-0">
                        <span className="text-zinc-600">Poisoned Auto Wounds</span>
                        <span className="font-mono text-lg text-zinc-900">{results.poisonedAutoWounds}</span>
                      </p>
                    ) : null}
                    <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2 sm:border-b-0 sm:pb-0">
                      <span className="text-zinc-600">Successful Wounds</span>
                      <span className="font-mono text-lg text-zinc-900">{results.successfulWounds}</span>
                    </p>
                    <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2 sm:border-b-0 sm:pb-0">
                      <span className="text-zinc-600">Failed Armor Saves</span>
                      <span className="font-mono text-lg text-zinc-900">{results.failedArmorSaves}</span>
                    </p>
                    <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2 sm:border-b-0 sm:pb-0">
                      <span className="text-zinc-600">Failed Ward Saves</span>
                      <span className="font-mono text-lg text-zinc-900">{results.failedWardSaves}</span>
                    </p>
                    <div className="sm:col-span-2">
                      <div className="w-full flex items-center justify-between border-2 border-zinc-900 bg-zinc-900 px-4 py-3">
                        <div>
                          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-200">
                            Final Damage
                          </span>
                          <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-300">
                            Real Damage: {results.finalDamage.toFixed(2)}
                          </p>
                        </div>
                        <span className="font-mono text-2xl font-bold text-white sm:text-3xl">
                          {Math.round(results.finalDamage)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border-2 border-zinc-900 bg-white px-4 py-5 sm:px-6 sm:py-6">
                <h2 className="text-lg font-semibold text-zinc-900">Throw dices</h2>
                <div className="mt-4 space-y-5">
                  <div>
                    <label htmlFor="diceCountThrow" className="block">Dice Count</label>
                    <input
                      type="number"
                      id="diceCountThrow"
                      value={diceCount}
                      min="1"
                      onChange={(e) => setDiceCount(e.target.value)}
                      className="mt-2 w-full border-2 border-zinc-900 bg-white px-3 py-2 font-mono text-base text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/30"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">To hit</p>
                    <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                      <div>
                        <label htmlFor="attackersAc" className="block">Attackers AC</label>
                        <input
                          type="number"
                          id="attackersAc"
                          value={attackersAc}
                          min="1"
                          onChange={(e) => setAttackersAc(e.target.value)}
                          className="mt-2 w-full border-2 border-zinc-900 bg-white px-3 py-2 font-mono text-base text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/30"
                        />
                      </div>
                      <div>
                        <label htmlFor="defendersAc" className="block">Defenders AC</label>
                        <input
                          type="number"
                          id="defendersAc"
                          value={defendersAc}
                          min="1"
                          onChange={(e) => setDefendersAc(e.target.value)}
                          className="mt-2 w-full border-2 border-zinc-900 bg-white px-3 py-2 font-mono text-base text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/30"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">To wound</p>
                    <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                      <div>
                        <label htmlFor="throwHitStrength" className="block">Hit Strength</label>
                        <input
                          type="number"
                          id="throwHitStrength"
                          value={throwHitStrength}
                          min="1"
                          onChange={(e) => setThrowHitStrength(e.target.value)}
                          className="mt-2 w-full border-2 border-zinc-900 bg-white px-3 py-2 font-mono text-base text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/30"
                        />
                      </div>
                      <div>
                        <label htmlFor="targetToughness" className="block">Target Toughness</label>
                        <input
                          type="number"
                          id="targetToughness"
                          value={targetToughness}
                          min="1"
                          onChange={(e) => setTargetToughness(e.target.value)}
                          className="mt-2 w-full border-2 border-zinc-900 bg-white px-3 py-2 font-mono text-base text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/30"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">Savings</p>
                    <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                      <div>
                        <label htmlFor="throwArmorSave" className="block">Armor Save (X+)</label>
                        <input
                          type="number"
                          id="throwArmorSave"
                          value={throwArmorSave}
                          min="1"
                          max="7"
                          onChange={(e) => setThrowArmorSave(e.target.value)}
                          className="mt-2 w-full border-2 border-zinc-900 bg-white px-3 py-2 font-mono text-base text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/30"
                        />
                      </div>
                      <div>
                        <label htmlFor="throwWardSave" className="block">Ward Save (X+)</label>
                        <input
                          type="number"
                          id="throwWardSave"
                          value={throwWardSave}
                          min="0"
                          max="7"
                          onChange={(e) => setThrowWardSave(e.target.value)}
                          className="mt-2 w-full border-2 border-zinc-900 bg-white px-3 py-2 font-mono text-base text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/30"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleThrowCalculate}
                  className="mt-5 w-full border-2 border-zinc-900 py-3 text-base font-semibold uppercase tracking-[0.2em]"
                >
                  Calculate
                </button>
                {errorMessage ? (
                  <p className="mt-4 border-2 border-zinc-900 bg-zinc-100 px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-zinc-700">
                    {errorMessage}
                  </p>
                ) : null}
                {hasThrowResults ? (
                  <>
                    <div className="mt-5 border-2 border-zinc-900 bg-stone-50 px-4 py-4 sm:px-6 sm:py-5">
                      <h2 className="text-lg font-semibold text-zinc-900">Results</h2>
                      <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                        <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2 sm:border-b-0 sm:pb-0">
                          <span className="text-zinc-600">Successful Hits</span>
                          <span className="font-mono text-lg text-zinc-900">{throwResults.successfulHits}</span>
                        </p>
                        <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2 sm:border-b-0 sm:pb-0">
                          <span className="text-zinc-600">Successful Wounds</span>
                          <span className="font-mono text-lg text-zinc-900">{throwResults.successfulWounds}</span>
                        </p>
                        <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2 sm:border-b-0 sm:pb-0">
                          <span className="text-zinc-600">Failed Armor Saves</span>
                          <span className="font-mono text-lg text-zinc-900">{throwResults.failedArmorSaves}</span>
                        </p>
                        <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2 sm:border-b-0 sm:pb-0">
                          <span className="text-zinc-600">Failed Ward Saves</span>
                          <span className="font-mono text-lg text-zinc-900">{throwResults.failedWardSaves}</span>
                        </p>
                        <div className="sm:col-span-2">
                          <div className="w-full flex items-center justify-between border-2 border-zinc-900 bg-zinc-900 px-4 py-3">
                            <div>
                              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-200">
                                Final Damage
                              </span>
                              <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-300">
                                Real Damage: {throwResults.finalDamage.toFixed(2)}
                              </p>
                            </div>
                            <span className="font-mono text-2xl font-bold text-white sm:text-3xl">
                              {Math.round(throwResults.finalDamage)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 border-2 border-dashed border-zinc-400 bg-white px-4 py-4 sm:px-6">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-700">Debug</h3>
                      <div className="mt-3 space-y-2 text-xs text-zinc-600">
                        <p>Hit Target: <span className="font-mono text-zinc-900">{throwDebug.hitTarget}+</span></p>
                        <p>Hit Rolls: <span className="font-mono text-zinc-900">{throwDebug.hitRolls.join(', ') || '-'}</span></p>
                        <p>Wound Target: <span className="font-mono text-zinc-900">{throwDebug.woundTarget}+</span></p>
                        <p>Wound Rolls: <span className="font-mono text-zinc-900">{throwDebug.woundRolls.join(', ') || '-'}</span></p>
                        <p>Armor Save Target: <span className="font-mono text-zinc-900">{throwDebug.effectiveArmorSave}+</span></p>
                        <p>Armor Rolls: <span className="font-mono text-zinc-900">{throwDebug.armorRolls.join(', ') || '-'}</span></p>
                        <p>Ward Save Target: <span className="font-mono text-zinc-900">{throwWardSave}+</span></p>
                        <p>Ward Rolls: <span className="font-mono text-zinc-900">{throwDebug.wardRolls.join(', ') || '-'}</span></p>
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
