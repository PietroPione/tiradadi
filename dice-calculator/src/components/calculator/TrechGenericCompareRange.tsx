import { useState, type ReactNode } from 'react';
import Card from '@/components/ui/Card';
import CardHeader from '@/components/ui/CardHeader';
import InputField from '@/components/ui/InputField';
import ActionBar from '@/components/ui/ActionBar';
import Button from '@/components/ui/Button';
import LineChart from '@/components/ui/LineChart';

type TrechGenericInputs = {
  plusDice: string;
  minusDice: string;
  positiveModifier: string;
  negativeModifier: string;
};

type RangeFieldValues = {
  plusDice: number;
  minusDice: number;
  positiveModifier: number;
  negativeModifier: number;
};

type CompareConfig = TrechGenericInputs & {
  id: string;
  label: string;
  compareMode: 'single' | 'range';
  singleField: keyof RangeFieldValues;
  compareValues: string;
  compareRangeValues: string;
};

type TrechGenericCompareRangeProps = TrechGenericInputs & {
  onBack: () => void;
  backLabel?: string;
  rightSlot?: ReactNode;
  onPlusDiceChange: (value: string) => void;
  onMinusDiceChange: (value: string) => void;
  onPositiveModifierChange: (value: string) => void;
  onNegativeModifierChange: (value: string) => void;
};

const fieldLabels: Record<keyof RangeFieldValues, string> = {
  plusDice: '+Dice',
  minusDice: '-Dice',
  positiveModifier: 'Positive modifier',
  negativeModifier: 'Negative modifier',
};

const parseNumber = (value: string) => Number.parseInt(value, 10);

const buildCompareConfig = (base: TrechGenericInputs, index: number): CompareConfig => ({
  ...base,
  id: `compare-${Date.now()}-${index}`,
  label: `Compare ${index + 1}`,
  compareMode: 'range',
  singleField: 'plusDice',
  compareValues: '',
  compareRangeValues: '',
});

const parseRangeValues = (input: string) => {
  const trimmed = input.trim();
  if (!trimmed) {
    return [];
  }
  const normalized = trimmed.replace(/[–—]/g, '-');
  if (normalized.includes('-')) {
    const [startRaw, endRaw] = normalized.split('-').map((value) => value.trim());
    const start = Number.parseInt(startRaw, 10);
    const end = Number.parseInt(endRaw, 10);
    if (Number.isNaN(start) || Number.isNaN(end)) {
      return [];
    }
    const [min, max] = start <= end ? [start, end] : [end, start];
    return Array.from({ length: max - min + 1 }, (_, index) => min + index);
  }
  return normalized
    .split(',')
    .map((value) => Number.parseInt(value.trim(), 10))
    .filter((value) => !Number.isNaN(value));
};

const parseCompareValues = (input: string) => (
  input
    .split(',')
    .map((value) => Number.parseInt(value.trim(), 10))
    .filter((value) => !Number.isNaN(value))
);

export default function TrechGenericCompareRange({
  plusDice,
  minusDice,
  positiveModifier,
  negativeModifier,
  onBack,
  backLabel = 'Back to phases',
  rightSlot,
  onPlusDiceChange,
  onMinusDiceChange,
  onPositiveModifierChange,
  onNegativeModifierChange,
}: TrechGenericCompareRangeProps) {
  const baseInputs: TrechGenericInputs = {
    plusDice,
    minusDice,
    positiveModifier,
    negativeModifier,
  };
  const [compareItems, setCompareItems] = useState<CompareConfig[]>([buildCompareConfig(baseInputs, 0)]);
  const [chartSeries, setChartSeries] = useState<{ name: string; points: { x: number; y: number }[]; color: string }[]>(
    [],
  );
  const [expectedSeries, setExpectedSeries] = useState<{ name: string; points: { x: number; y: number }[]; color: string }[]>(
    [],
  );
  const [tableRows, setTableRows] = useState<{ x: number; values: Record<string, number> }[]>([]);
  const [generatedBaseResult, setGeneratedBaseResult] = useState<number | null>(null);

  const updateCompare = (id: string, patch: Partial<CompareConfig>) => {
    setCompareItems((items) => items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const buildSeries = () => {
    const rangeSeries = compareItems.flatMap((item) => {
      const field = item.singleField;
      const values = item.compareMode === 'single'
        ? parseCompareValues(item.compareValues)
        : parseRangeValues(item.compareRangeValues);
      return values.map((value) => {
        const inputs: TrechGenericInputs = {
          plusDice: item.plusDice,
          minusDice: item.minusDice,
          positiveModifier: item.positiveModifier,
          negativeModifier: item.negativeModifier,
        };
        inputs[field] = value.toString();
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
    const baseDice = 2;
    const baseMax = Math.max(0, baseDice * 6 + parseNumber(positiveModifier) - parseNumber(negativeModifier));
    const seriesData = rangeSeries.map((entry) => {
      const maxValue = Math.max(
        0,
        baseDice * 6 + parseNumber(entry.inputs.positiveModifier) - parseNumber(entry.inputs.negativeModifier),
      );
      return { name: entry.name, inputs: entry.inputs, max: maxValue };
    });
    const overallMax = Math.max(baseMax, ...seriesData.map((item) => item.max));
    const simulate = (inputs: TrechGenericInputs) => {
      const counts = Array.from({ length: overallMax + 1 }, () => 0);
      const parsedPlus = parseNumber(inputs.plusDice);
      const parsedMinus = parseNumber(inputs.minusDice);
      const parsedPositive = parseNumber(inputs.positiveModifier);
      const parsedNegative = parseNumber(inputs.negativeModifier);
      const netDice = parsedPlus - parsedMinus;
      const totalDice = baseDice + Math.abs(netDice);
      for (let i = 0; i < iterations; i += 1) {
        const rolls = Array.from({ length: totalDice }, () => Math.floor(Math.random() * 6) + 1);
        const sorted = [...rolls].sort((a, b) => a - b);
        let selected = sorted;
        if (netDice > 0) {
          selected = sorted.slice(-baseDice);
        } else if (netDice < 0) {
          selected = sorted.slice(0, baseDice);
        }
        const baseTotal = selected.reduce((sum, roll) => sum + roll, 0);
        const finalTotal = baseTotal + parsedPositive - parsedNegative;
        const bucket = Math.min(Math.max(0, finalTotal), overallMax);
        counts[bucket] += 1;
      }
      return counts.map((count) => count / iterations);
    };
    const probabilitySeries = [
      {
        name: 'Base',
        points: simulate(baseInputs).map((value, index) => ({
          x: index,
          y: parseFloat(value.toFixed(4)),
        })),
        color: '',
      },
      ...seriesData.map((entry) => ({
        name: entry.name,
        points: simulate(entry.inputs).map((value, index) => ({
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
      probabilitySeries.forEach((entry) => {
        values[entry.name] = entry.points[index]?.y ?? 0;
      });
      return { x: index, values };
    });
    setChartSeries(series);
    setExpectedSeries(expected);
    setTableRows(rows);
    const baseExpected = expected.find((entry) => entry.name === 'Base')?.points[0]?.y ?? 0;
    setGeneratedBaseResult(baseExpected);
  };

  const hasInvalidCompareValues = compareItems.some((item) => (
    item.compareMode === 'single'
      ? parseCompareValues(item.compareValues).length === 0
      : parseRangeValues(item.compareRangeValues).length === 0
  ));

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
          <CardHeader title="Step 1: Generic base values" subtitle="Set your baseline for comparison" />
          <div className="mt-4 space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
              <InputField
                id="trechComparePlusDice"
                label="+Dice"
                value={plusDice}
                min="0"
                onChange={onPlusDiceChange}
              />
              <InputField
                id="trechCompareMinusDice"
                label="-Dice"
                value={minusDice}
                min="0"
                onChange={onMinusDiceChange}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
              <InputField
                id="trechComparePositiveMod"
                label="Positive modifier"
                value={positiveModifier}
                min="0"
                onChange={onPositiveModifierChange}
              />
              <InputField
                id="trechCompareNegativeMod"
                label="Negative modifier"
                value={negativeModifier}
                min="0"
                onChange={onNegativeModifierChange}
              />
            </div>
          </div>
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
                <div className="mt-3">
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
                </div>
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
                      placeholder="e.g. 1,2,3"
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
                    placeholder="Use a range (e.g. 0-2) or list (e.g. 0,1,2)"
                    onChange={(value) => updateCompare(item.id, { compareRangeValues: value })}
                  />
                )}
                {item.compareMode === 'range'
                  && item.compareRangeValues.trim()
                  && parseRangeValues(item.compareRangeValues).length === 0 ? (
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-600">
                    Invalid range format. Use 0-2 or 0,1,2.
                  </p>
                ) : null}
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
          <CardHeader title="Step 3: Results" subtitle="Final total distribution" />
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
                xLabel="Final total"
                xUnit="points"
                yLabel="Probability"
                yUnit="%"
                footer={(
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
                    X axis shows total final result (0 to max).
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
          <CardHeader title="Step 3: Results table" subtitle="Probability by final total" />
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
              <div>Base expected total: {generatedBaseResult.toFixed(2)}</div>
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
