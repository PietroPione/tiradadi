import { useState, type ReactNode } from 'react';
import Card from '@/components/ui/Card';
import CardHeader from '@/components/ui/CardHeader';
import SectionBlock from '@/components/ui/SectionBlock';
import InputField from '@/components/ui/InputField';
import ToggleButton from '@/components/ui/ToggleButton';
import ActionBar from '@/components/ui/ActionBar';
import Button from '@/components/ui/Button';
import LineChart from '@/components/ui/LineChart';
import ReRollOptions, { type RerollConfig } from '@/components/calculator/ReRollOptions';
import { getFaceProbabilitiesWithReroll, parseSpecificValues, shouldRerollValue } from '@/lib/roll-utils';

type GeneralInputs = {
  diceCount: string;
  objective: 'target' | 'total';
  targetValue: string;
  rerollConfig: RerollConfig;
};

type RangeFieldValues = {
  diceCount: number;
  targetValue: number;
};

type CompareConfig = GeneralInputs & {
  id: string;
  label: string;
  compareMode: 'single' | 'range';
  singleField: keyof RangeFieldValues;
  compareValues: string;
  compareRangeValues: string;
};

type GeneralCompareRangeProps = GeneralInputs & {
  onBack: () => void;
  backLabel?: string;
  rightSlot?: ReactNode;
  onDiceCountChange: (value: string) => void;
  onObjectiveChange: (objective: 'target' | 'total') => void;
  onTargetValueChange: (value: string) => void;
  onRerollChange: (config: RerollConfig) => void;
};

const fieldLabels: Record<keyof RangeFieldValues, string> = {
  diceCount: 'Dice Count',
  targetValue: 'Target (X+)',
};

const parseNumber = (value: string) => Number.parseInt(value, 10);

const buildCompareConfig = (base: GeneralInputs, index: number): CompareConfig => ({
  ...base,
  id: `compare-${Date.now()}-${index}`,
  label: `Compare ${index + 1}`,
  compareMode: 'range',
  singleField: 'targetValue',
  compareValues: '',
  compareRangeValues: '',
});

const calculateAverageOutput = (inputs: GeneralInputs) => {
  const parsedDice = parseNumber(inputs.diceCount);
  const parsedTarget = parseNumber(inputs.targetValue);
  if (Number.isNaN(parsedDice) || parsedDice <= 0) {
    return 0;
  }
  if (inputs.objective === 'target') {
    if (Number.isNaN(parsedTarget)) {
      return 0;
    }
    const chance = getFaceProbabilitiesWithReroll(parsedTarget, inputs.rerollConfig).successChance;
    return parseFloat((parsedDice * chance).toFixed(2));
  }
  const rerollTarget = 4;
  const probabilities = getFaceProbabilitiesWithReroll(rerollTarget, inputs.rerollConfig).probabilities;
  const expectedDie = probabilities
    .slice(1)
    .reduce((sum, chance, index) => sum + (index + 1) * chance, 0);
  return parseFloat((parsedDice * expectedDie).toFixed(2));
};

export default function GeneralCompareRange({
  diceCount,
  objective,
  targetValue,
  rerollConfig,
  onBack,
  backLabel = 'Back to phases',
  rightSlot,
  onDiceCountChange,
  onObjectiveChange,
  onTargetValueChange,
  onRerollChange,
}: GeneralCompareRangeProps) {
  const baseInputs: GeneralInputs = { diceCount, objective, targetValue, rerollConfig };
  const [compareItems, setCompareItems] = useState<CompareConfig[]>([buildCompareConfig(baseInputs, 0)]);
  const [chartSeries, setChartSeries] = useState<Array<{ name: string; points: Array<{ x: number; y: number }>; color: string }>>([]);
  const [expectedSeries, setExpectedSeries] = useState<Array<{ name: string; points: Array<{ x: number; y: number }>; color: string }>>([]);
  const [tableRows, setTableRows] = useState<Array<{
    x: number;
    values: Record<string, number>;
  }>>([]);
  const [generatedBaseResult, setGeneratedBaseResult] = useState<number | null>(null);

  const updateCompare = (id: string, patch: Partial<CompareConfig>) => {
    setCompareItems((items) => items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const parseCompareValues = (input: string) => {
    return input
      .split(',')
      .map((value) => Number.parseInt(value.trim(), 10))
      .filter((value) => Number.isFinite(value));
  };
  const parseRangeValues = (input: string) => {
    const trimmed = input.trim().replace(/[–—]/g, '-');
    if (!trimmed) {
      return [];
    }
    if (trimmed.includes('-')) {
      const parts = trimmed.split('-').map((value) => value.trim()).filter(Boolean);
      if (parts.length !== 2) {
        return [];
      }
      const [startRaw, endRaw] = parts;
      const start = Number.parseInt(startRaw, 10);
      const end = Number.parseInt(endRaw, 10);
      if (!Number.isFinite(start) || !Number.isFinite(end)) {
        return [];
      }
      const min = Math.min(start, end);
      const max = Math.max(start, end);
      return Array.from({ length: max - min + 1 }, (_, index) => min + index);
    }
    return parseCompareValues(trimmed);
  };
  const hasInvalidCompareValues = compareItems.some((item) => (
    item.compareMode === 'single'
      ? parseCompareValues(item.compareValues).length === 0
      : parseRangeValues(item.compareRangeValues).length === 0
  ));
  const baseResult = calculateAverageOutput(baseInputs);

  const buildSeries = () => {
    const rangeSeries = compareItems.flatMap((item) => {
      const field = item.singleField;
      const rangeValues = item.compareMode === 'single'
        ? parseCompareValues(item.compareValues)
        : parseRangeValues(item.compareRangeValues);
      return rangeValues.map((value) => {
        const inputs: GeneralInputs = {
          diceCount: item.diceCount,
          objective: item.objective,
          targetValue: item.targetValue,
          rerollConfig: item.rerollConfig,
        };
        if (field === 'diceCount') {
          inputs.diceCount = value.toString();
        } else if (field === 'targetValue') {
          inputs.targetValue = value.toString();
        }
        return {
          name: `${item.label} • ${fieldLabels[field]} ${value}`,
          inputs,
        };
      });
    });
    return { rangeSeries };
  };

  const handleGenerate = () => {
    const { rangeSeries } = buildSeries();
    const iterations = 20000;
    const baseDiceCount = Number.parseInt(diceCount, 10);
    const baseMax = objective === 'target' ? Math.max(0, baseDiceCount) : Math.max(0, baseDiceCount * 6);
    const seriesData = rangeSeries.map((entry) => {
      const diceValue = Number.parseInt(entry.inputs.diceCount, 10);
      const maxValue = entry.inputs.objective === 'target' ? Math.max(0, diceValue) : Math.max(0, diceValue * 6);
      return { name: entry.name, inputs: entry.inputs, max: maxValue };
    });
    const overallMax = Math.max(baseMax, ...seriesData.map((item) => item.max));
    const simulateGeneral = (inputs: GeneralInputs) => {
      const counts = Array.from({ length: overallMax + 1 }, () => 0);
      const parsedDice = Number.parseInt(inputs.diceCount, 10);
      const parsedTarget = Number.parseInt(inputs.targetValue, 10);
      for (let i = 0; i < iterations; i += 1) {
        let total = 0;
        let successes = 0;
        for (let j = 0; j < parsedDice; j += 1) {
          const roll = Math.floor(Math.random() * 6) + 1;
          const rerollTarget = inputs.objective === 'target' ? parsedTarget : 4;
          const specificValues = new Set(parseSpecificValues(inputs.rerollConfig.specificValues));
          const isSuccess = roll >= rerollTarget;
          const shouldReroll = inputs.rerollConfig.enabled
            ? shouldRerollValue(roll, isSuccess, inputs.rerollConfig, specificValues)
            : false;
          const finalRoll = shouldReroll ? Math.floor(Math.random() * 6) + 1 : roll;
          if (inputs.objective === 'target') {
            if (finalRoll >= parsedTarget) {
              successes += 1;
            }
          } else {
            total += finalRoll;
          }
        }
        const result = inputs.objective === 'target' ? successes : total;
        const bucket = Math.min(result, overallMax);
        counts[bucket] += 1;
      }
      return counts.map((count) => count / iterations);
    };
    const probabilitySeries = [
      {
        name: 'Base',
        points: simulateGeneral(baseInputs).map((value, index) => ({
          x: index,
          y: parseFloat(value.toFixed(4)),
        })),
        color: '',
      },
      ...seriesData.map((entry) => ({
        name: entry.name,
        points: simulateGeneral(entry.inputs).map((value, index) => ({
          x: index,
          y: parseFloat(value.toFixed(4)),
        })),
        color: '',
      })),
    ];
    const expected = probabilitySeries.map((entry, index) => {
      const expectedValue = entry.points.reduce((sum, point) => sum + point.x * point.y, 0);
      return {
        name: entry.name,
        points: [{ x: index + 1, y: parseFloat(expectedValue.toFixed(2)) }],
        color: '',
      };
    });
    const series = probabilitySeries.map((entry) => ({
      ...entry,
      points: entry.points.map((point) => ({ ...point, y: parseFloat((point.y * 100).toFixed(2)) })),
    }));
    const rows = Array.from({ length: overallMax + 1 }, (_, index) => {
      const values: Record<string, number> = {};
      probabilitySeries.forEach((seriesEntry) => {
        values[seriesEntry.name] = seriesEntry.points[index]?.y ?? 0;
      });
      return { x: index, values };
    });
    setChartSeries(series);
    setExpectedSeries(expected);
    setTableRows(rows);
    setGeneratedBaseResult(baseResult);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button size="sm" onClick={onBack}>
          {backLabel}
        </Button>
        {rightSlot ? rightSlot : null}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="px-4 py-5 sm:px-6 sm:py-6">
          <CardHeader
            title="Step 1: General throw base values"
            subtitle="Set your baseline for comparison"
          />
          <div className="mt-4 space-y-5">
          <InputField
            id="generalCompareDiceCount"
            label="Number of dice to throw"
            value={diceCount}
            min="1"
            onChange={onDiceCountChange}
          />
          <SectionBlock title="Objective" contentClassName="mt-3">
            <div className="flex flex-wrap gap-2">
              <ToggleButton
                active={objective === 'target'}
                onClick={() => onObjectiveChange('target')}
                size="sm"
              >
                Target value
              </ToggleButton>
              <ToggleButton
                active={objective === 'total'}
                onClick={() => onObjectiveChange('total')}
                size="sm"
              >
                Total throw
              </ToggleButton>
            </div>
          </SectionBlock>
          {objective === 'target' ? (
            <InputField
              id="generalCompareTarget"
              label="Target (X+)"
              value={targetValue}
              min="1"
              max="7"
              onChange={onTargetValueChange}
            />
          ) : null}
          <SectionBlock title="Re-rolls" contentClassName="mt-3">
            <ReRollOptions config={rerollConfig} onChange={onRerollChange} compact />
          </SectionBlock>
          </div>
          <ActionBar>
            <div className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-700">
              Base average {objective === 'target' ? 'successes' : 'total'}:{' '}
              <span className="font-mono text-zinc-900">{baseResult.toFixed(2)}</span>
            </div>
          </ActionBar>
        </Card>

        <Card className="px-4 py-5 sm:px-6 sm:py-6">
          <CardHeader title="Step 2: Compare with" subtitle="Choose what to vary and override values" />
          <div className="space-y-6">
          {compareItems.map((item) => (
            <div key={item.id} className="border-2 border-zinc-900 px-4 py-4">
              <div className="flex items-center justify-between gap-2">
                <InputField
                  id={`${item.id}-label`}
                  label="Label"
                  value={item.label}
                  type="text"
                  onChange={(value) => updateCompare(item.id, { label: value })}
                />
                <Button size="sm" onClick={() => setCompareItems((list) => list.filter((entry) => entry.id !== item.id))}>
                  Remove
                </Button>
              </div>
              <SectionBlock title="Step 2A: Field to compare" contentClassName="mt-3">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">Value to vary</label>
                <select
                  className="mt-2 w-full border-2 border-zinc-900 bg-white px-3 py-2 text-sm"
                  value={item.singleField}
                  onChange={(event) => updateCompare(item.id, { singleField: event.target.value as keyof RangeFieldValues })}
                >
                  {Object.entries(fieldLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
                <div className="mt-3">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">Compare mode</label>
                  <select
                    className="mt-2 w-full border-2 border-zinc-900 bg-white px-3 py-2 text-sm"
                    value={item.compareMode}
                    onChange={(event) => updateCompare(item.id, { compareMode: event.target.value as 'single' | 'range' })}
                  >
                    <option value="single">Compare single value</option>
                    <option value="range">Compare</option>
                  </select>
                </div>
                {item.compareMode === 'single' ? (
                  <>
                    <InputField
                      id={`${item.id}-compare-value`}
                      label="Compare values (comma separated)"
                      value={item.compareValues}
                      type="text"
                      placeholder="e.g. 3,4,5"
                      onChange={(value) => updateCompare(item.id, { compareValues: value })}
                    />
                    {!item.compareValues.trim() ? (
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-600">
                        Insert at least one value to compare.
                      </p>
                    ) : null}
                  </>
                ) : (
                  <InputField
                    id={`${item.id}-compare-range`}
                    label="Range values"
                    value={item.compareRangeValues}
                    type="text"
                    placeholder="Use a range (e.g. 2-4) or list (e.g. 2,3,4)"
                    onChange={(value) => updateCompare(item.id, { compareRangeValues: value })}
                  />
                )}
                {item.compareMode === 'range'
                  && item.compareRangeValues.trim()
                  && parseRangeValues(item.compareRangeValues).length === 0 ? (
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-600">
                    Invalid range format. Use 2-4 or 2,3,4.
                  </p>
                ) : null}
              </SectionBlock>

            </div>
          ))}
          </div>
          <ActionBar>
            <div className="flex flex-wrap gap-3">
              <Button
                size="sm"
                onClick={() => setCompareItems((items) => items.concat(buildCompareConfig(baseInputs, items.length)))}
              >
                Add compare
              </Button>
              <Button size="sm" onClick={handleGenerate} disabled={hasInvalidCompareValues}>
                Generate results
              </Button>
            </div>
            {hasInvalidCompareValues ? (
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-600">
                Add compare values before generating.
              </p>
            ) : null}
          </ActionBar>
        </Card>

        <Card className="lg:col-span-2 px-4 py-5 sm:px-6 sm:py-6">
          <CardHeader title="Step 3: Results" subtitle="Result distribution" />
          {chartSeries.length ? (
            <>
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
                Series: {chartSeries.map((series) => series.name).join(' | ')}
              </div>
              <LineChart
                series={chartSeries.map((item, index) => ({
                  ...item,
                  color: item.color || ['#111827', '#2563eb', '#16a34a', '#db2777', '#f97316', '#7c3aed'][index % 6],
                }))}
                xLabel="Result"
                xUnit={objective === 'target' ? 'successes' : 'total'}
                yLabel="Probability"
                yUnit="%"
                footer={(
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
                    X axis shows possible results (0 to max).
                  </p>
                )}
              />
            </>
          ) : (
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-600">
              Generate charts to see results.
            </p>
          )}
        </Card>

        <Card className="lg:col-span-2 px-4 py-5 sm:px-6 sm:py-6">
          <CardHeader title="Step 3: Results table" subtitle="Probability by result" />
          {tableRows.length ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b-2 border-zinc-900">
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
                      Value
                    </th>
                    {chartSeries.map((series) => (
                      <th
                        key={series.name}
                        className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600"
                      >
                        {series.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row) => (
                    <tr key={row.x} className="border-b border-zinc-200">
                      <td className="px-3 py-2 font-mono text-zinc-900">{row.x}</td>
                      {chartSeries.map((series) => (
                        <td key={`${series.name}-${row.x}`} className="px-3 py-2 text-zinc-700">
                          {((row.values[series.name] ?? 0) * 100).toFixed(2)}%
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-600">
              Generate charts to see results.
            </p>
          )}
          {generatedBaseResult !== null ? (
            <div className="mt-3 space-y-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
              <div>Base expected result: {generatedBaseResult.toFixed(2)}</div>
              {expectedSeries.length ? (
                <div>
                  Compare expected:{' '}
                  {expectedSeries
                    .filter((series) => series.name !== 'Base')
                    .map((series) => `${series.name}=${(series.points[0]?.y ?? 0).toFixed(2)}`)
                    .join(' | ')}
                </div>
              ) : null}
            </div>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
