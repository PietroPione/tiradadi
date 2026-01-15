"use client";

import { useState } from 'react';
import CalculatorHeader from '@/components/calculator/CalculatorHeader';
import ModeSwitch from '@/components/calculator/ModeSwitch';
import ProbabilityCalculator from '@/components/calculator/ProbabilityCalculator';
import ThrowDiceCalculator from '@/components/calculator/ThrowDiceCalculator';
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
    const poisonedAutoWounds = poisonedAttack
      ? hitRolls.filter((roll) => roll === 6).length
      : 0;
    const nonPoisonHits = poisonedAttack
      ? hitRolls.filter((roll) => roll >= hitTarget && roll !== 6).length
      : hitRolls.filter((roll) => roll >= hitTarget).length;
    const hitSuccesses = poisonedAutoWounds + nonPoisonHits;

    const woundTarget = getWoundTarget(parsedHitStrength, parsedTargetToughness);
    const woundRolls = Array.from({ length: nonPoisonHits }, () => Math.floor(Math.random() * 6) + 1);
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
          <CalculatorHeader
            mode={mode}
            hasResults={hasResults}
            finalDamage={results.finalDamage}
          />

          <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
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
                onDiceCountChange={setDiceCount}
                onHitValueChange={setHitValue}
                onPoisonedAttackChange={setPoisonedAttack}
                onHitStrengthChange={setHitStrength}
                onWoundValueChange={setWoundValue}
                onArmorSaveChange={setArmorSave}
                onWardSaveChange={setWardSave}
                onCalculate={handleCalculate}
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
                onDiceCountChange={setDiceCount}
                onAttackersAcChange={setAttackersAc}
                onDefendersAcChange={setDefendersAc}
                onThrowHitStrengthChange={setThrowHitStrength}
                onTargetToughnessChange={setTargetToughness}
                onThrowArmorSaveChange={setThrowArmorSave}
                onThrowWardSaveChange={setThrowWardSave}
                onPoisonedAttackChange={setPoisonedAttack}
                onCalculate={handleThrowCalculate}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
