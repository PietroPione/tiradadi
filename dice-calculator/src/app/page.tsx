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
    <div className="min-h-screen bg-gray-800 text-white flex flex-col items-center justify-center font-mono">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-900 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-green-400">Dice Average Calculator</h1>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="diceCount" className="block text-sm font-medium text-gray-400">Dice Count</label>
            <input
              type="number"
              id="diceCount"
              value={diceCount}
              min="1"
              onChange={(e) => setDiceCount(parseNumberInput(e.target.value, 1))}
              className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label htmlFor="hitValue" className="block text-sm font-medium text-gray-400">To Hit (X+)</label>
            <input
              type="number"
              id="hitValue"
              value={hitValue}
              min="1"
              max="7"
              onChange={(e) => setHitValue(parseNumberInput(e.target.value, 1))}
              className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label htmlFor="woundValue" className="block text-sm font-medium text-gray-400">To Wound (X+)</label>
            <input
              type="number"
              id="woundValue"
              value={woundValue}
              min="1"
              max="7"
              onChange={(e) => setWoundValue(parseNumberInput(e.target.value, 1))}
              className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label htmlFor="armorSave" className="block text-sm font-medium text-gray-400">Armor Save (X+)</label>
            <input
              type="number"
              id="armorSave"
              value={armorSave}
              min="1"
              max="7"
              onChange={(e) => setArmorSave(parseNumberInput(e.target.value, 1))}
              className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="col-span-2">
            <label htmlFor="wardSave" className="block text-sm font-medium text-gray-400">Ward Save (X+)</label>
            <input
              type="number"
              id="wardSave"
              value={wardSave}
              min="0"
              max="7"
              onChange={(e) => setWardSave(parseNumberInput(e.target.value, 0))}
              className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <button
          onClick={handleCalculate}
          className="w-full py-3 mt-6 font-bold text-gray-900 bg-green-400 rounded-md hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500"
        >
          Calculate
        </button>

        <div className="pt-6 mt-6 border-t border-gray-700">
          <h2 className="text-xl font-bold text-center text-green-400">Results</h2>
          <div className="mt-4 space-y-2">
            <p><span className="font-semibold">Successful Hits:</span> {results.successfulHits}</p>
            <p><span className="font-semibold">Successful Wounds:</span> {results.successfulWounds}</p>
            <p><span className="font-semibold">Failed Armor Saves:</span> {results.failedArmorSaves}</p>
            <p><span className="font-semibold">Final Damage:</span> {results.finalDamage}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
