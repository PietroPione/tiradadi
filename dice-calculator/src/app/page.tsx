"use client";

import { useState } from 'react';
import { calculateAverages } from '@/lib/dice-calculator';

export default function Home() {
  const [diceCount, setDiceCount] = useState(10);
  const [hitValue, setHitValue] = useState(4);
  const [woundValue, setWoundValue] = useState(4);
  const [armorSave, setArmorSave] = useState(4);
  const [wardSave, setWardSave] = useState(0);

  const [results, setResults] = useState({
    successfulHits: 0,
    successfulWounds: 0,
    failedArmorSaves: 0,
    finalDamage: 0,
  });

  const parseNumberInput = (value: string, fallback: number) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? fallback : parsed;
  };

  const handleCalculate = () => {
    const newResults = calculateAverages({
      diceCount,
      hitValue,
      woundValue,
      armorSave,
      wardSave,
    });
    setResults(newResults);
  };

  return (
    <div className="min-h-screen w-full px-4 py-10 sm:px-8">
      <div className="mx-auto w-full max-w-3xl">
        <div className="w-full border-2 border-zinc-900 bg-white shadow-[6px_6px_0_0_rgba(0,0,0,0.15)]">
          <div className="flex flex-col gap-4 border-b-2 border-zinc-900 px-6 py-6 sm:flex-row sm:items-end sm:justify-between sm:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
                Retro Dice Lab
              </p>
              <h1 className="mt-2 text-3xl font-bold text-zinc-900 sm:text-4xl">
                Dice Average Calculator
              </h1>
            </div>
            <p className="text-sm text-zinc-500 sm:max-w-xs sm:text-right">
              Quick averages for tabletop rolls. Clean inputs, crisp outputs.
            </p>
          </div>

          <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
          <div>
            <label htmlFor="diceCount" className="block">Dice Count</label>
            <input
              type="number"
              id="diceCount"
              value={diceCount}
              min="1"
              onChange={(e) => setDiceCount(parseNumberInput(e.target.value, 1))}
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
              onChange={(e) => setHitValue(parseNumberInput(e.target.value, 1))}
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
              onChange={(e) => setWoundValue(parseNumberInput(e.target.value, 1))}
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
              onChange={(e) => setArmorSave(parseNumberInput(e.target.value, 1))}
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
              onChange={(e) => setWardSave(parseNumberInput(e.target.value, 0))}
              className="mt-2 w-full border-2 border-zinc-900 bg-white px-3 py-2 font-mono text-base text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/30"
            />
          </div>
        </div>

            <button
              onClick={handleCalculate}
              className="w-full py-3 text-base font-semibold uppercase tracking-[0.2em]"
            >
              Calculate
            </button>

            <div className="border-2 border-zinc-900 bg-stone-50 px-4 py-4 sm:px-6 sm:py-5">
              <h2 className="text-lg font-semibold text-zinc-900">Results</h2>
              <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2 sm:border-b-0 sm:pb-0">
                  <span className="text-zinc-600">Successful Hits</span>
                  <span className="font-mono text-lg text-zinc-900">{results.successfulHits}</span>
                </p>
                <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2 sm:border-b-0 sm:pb-0">
                  <span className="text-zinc-600">Successful Wounds</span>
                  <span className="font-mono text-lg text-zinc-900">{results.successfulWounds}</span>
                </p>
                <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2 sm:border-b-0 sm:pb-0">
                  <span className="text-zinc-600">Failed Armor Saves</span>
                  <span className="font-mono text-lg text-zinc-900">{results.failedArmorSaves}</span>
                </p>
                <div className="sm:col-span-2">
                  <div className="w-full flex items-center justify-between border-2 border-zinc-900 bg-zinc-900 px-4 py-3">
                    <span className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-200">
                      Final Damage
                    </span>
                    <span className="font-mono text-2xl font-bold text-white sm:text-3xl">
                      {Math.round(results.finalDamage)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
