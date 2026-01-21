import Card from '@/components/ui/Card';
import ActionBar from '@/components/ui/ActionBar';
import Button from '@/components/ui/Button';
import InputField from '@/components/ui/InputField';
import ModeSwitch from '@/components/calculator/ModeSwitch';
import ReRollOptions, { type RerollConfig } from '@/components/calculator/ReRollOptions';
import DebugPanel from '@/components/ui/DebugPanel';
import CardHeader from '@/components/ui/CardHeader';
import SectionBlock from '@/components/ui/SectionBlock';
import ToggleButton from '@/components/ui/ToggleButton';

const formatRerollLabel = (config: RerollConfig) => {
  if (!config.enabled) {
    return 'Off';
  }
  const base = `${config.mode} / ${config.scope}`;
  if (config.scope === 'specific' && config.specificValues.trim()) {
    return `${base} (${config.specificValues})`;
  }
  return base;
};

type GeneralAverageResults = {
  averageSuccesses: number;
  successChance: number;
  averageTotal: number;
};

type GeneralThrowResults = {
  successes: number;
  rolls: number[];
  total: number;
};

type GeneralThrowCalculatorProps = {
  diceCount: string;
  objective: 'target' | 'total';
  targetValue: string;
  mode: 'probability' | 'throw';
  errorMessage: string;
  averageResults: GeneralAverageResults;
  throwResults: GeneralThrowResults;
  hasAverageResults: boolean;
  hasThrowResults: boolean;
  rerollConfig: RerollConfig;
  debug: {
    initialRolls: number[];
    rerollRolls: number[];
    finalRolls: number[];
  };
  onBack: () => void;
  onDiceCountChange: (value: string) => void;
  onObjectiveChange: (objective: 'target' | 'total') => void;
  onTargetValueChange: (value: string) => void;
  onModeChange: (mode: 'probability' | 'throw') => void;
  onAverageCalculate: () => void;
  onThrowCalculate: () => void;
  onRerollChange: (config: RerollConfig) => void;
};

export default function GeneralThrowCalculator({
  diceCount,
  objective,
  targetValue,
  mode,
  errorMessage,
  averageResults,
  throwResults,
  hasAverageResults,
  hasThrowResults,
  rerollConfig,
  debug,
  onBack,
  onDiceCountChange,
  onObjectiveChange,
  onTargetValueChange,
  onModeChange,
  onAverageCalculate,
  onThrowCalculate,
  onRerollChange,
}: GeneralThrowCalculatorProps) {
  const isProbability = mode === 'probability';

  return (
    <Card className="px-4 py-5 sm:px-6 sm:py-6">
      <CardHeader
        title="General throw"
        onBack={onBack}
        backLabel="Back to phases"
        rightSlot={<ModeSwitch mode={mode} onModeChange={onModeChange} />}
      />
      <div className="mt-4 space-y-5">
        <InputField
          id="generalDiceCount"
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
            id="generalTarget"
            label="Target (X+)"
            value={targetValue}
            min="1"
            max="7"
            onChange={onTargetValueChange}
          />
        ) : null}
        <ReRollOptions config={rerollConfig} onChange={onRerollChange} compact />
      </div>

      <ActionBar>
        <Button type="button" onClick={isProbability ? onAverageCalculate : onThrowCalculate} fullWidth size="lg">
          Calculate
        </Button>
      </ActionBar>
      {errorMessage ? (
        <p className="mt-4 border-2 border-zinc-900 bg-zinc-100 px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-zinc-700">
          {errorMessage}
        </p>
      ) : null}

      {isProbability && hasAverageResults ? (
        <Card className="mt-5 bg-stone-50 px-4 py-4 sm:px-6 sm:py-5">
          <h3 className="text-lg font-semibold text-zinc-900">Results</h3>
          <div className="mt-4 space-y-3 text-sm">
            {objective === 'target' ? (
              <>
                <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2">
                  <span className="text-zinc-600">Average successes</span>
                  <span className="font-mono text-lg text-zinc-900">
                    {averageResults.averageSuccesses.toFixed(2)}
                  </span>
                </p>
                <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2">
                  <span className="text-zinc-600">Success chance</span>
                  <span className="font-mono text-lg text-zinc-900">
                    {(averageResults.successChance * 100).toFixed(2)}%
                  </span>
                </p>
              </>
            ) : (
              <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2">
                <span className="text-zinc-600">Average total</span>
                <span className="font-mono text-lg text-zinc-900">
                  {averageResults.averageTotal.toFixed(2)}
                </span>
              </p>
            )}
            <div className="w-full flex items-center justify-between border-2 border-zinc-900 bg-zinc-900 px-4 py-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-200">
                  {objective === 'target' ? 'Average successes' : 'Average total'}
                </span>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-300">
                  Real value: {objective === 'target'
                    ? averageResults.averageSuccesses.toFixed(2)
                    : averageResults.averageTotal.toFixed(2)}
                </p>
              </div>
              <span className="font-mono text-2xl font-bold text-white sm:text-3xl">
                {Math.round(objective === 'target'
                  ? averageResults.averageSuccesses
                  : averageResults.averageTotal)}
              </span>
            </div>
          </div>
        </Card>
      ) : null}

      {!isProbability && hasThrowResults ? (
        <Card className="mt-5 bg-stone-50 px-4 py-4 sm:px-6 sm:py-5">
          <h3 className="text-lg font-semibold text-zinc-900">Results</h3>
          <div className="mt-4 space-y-2 text-sm">
            {objective === 'target' ? (
              <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2">
                <span className="text-zinc-600">Number of successes</span>
                <span className="font-mono text-lg text-zinc-900">{throwResults.successes}</span>
              </p>
            ) : (
              <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2">
                <span className="text-zinc-600">Total throw</span>
                <span className="font-mono text-lg text-zinc-900">{throwResults.total}</span>
              </p>
            )}
            <div className="w-full flex items-center justify-between border-2 border-zinc-900 bg-zinc-900 px-4 py-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-200">
                  {objective === 'target' ? 'Successes' : 'Total'}
                </span>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-300">
                  {objective === 'target' ? `Out of ${diceCount} dice` : `From ${diceCount} dice`}
                </p>
              </div>
              <span className="font-mono text-2xl font-bold text-white sm:text-3xl">
                {objective === 'target' ? throwResults.successes : throwResults.total}
              </span>
            </div>
            <p className="text-xs text-zinc-600">
              Rolls: <span className="font-mono text-zinc-900">{throwResults.rolls.join(', ') || '-'}</span>
            </p>
          </div>
        </Card>
      ) : null}
      <DebugPanel
        lines={[
          { label: 'Mode', value: mode === 'probability' ? 'Probability' : 'Throw' },
          { label: 'Dice count', value: diceCount || '-' },
          { label: 'Objective', value: objective === 'target' ? 'Target value' : 'Total throw' },
          { label: 'Target', value: objective === 'target' ? `${targetValue}+` : '-' },
          { label: 'Re-roll', value: formatRerollLabel(rerollConfig) },
          { label: 'Initial rolls', value: debug.initialRolls.join(', ') || '-' },
          { label: 'Re-rolls', value: debug.rerollRolls.join(', ') || '-' },
          { label: 'Final rolls', value: debug.finalRolls.join(', ') || '-' },
        ]}
      />
    </Card>
  );
}
