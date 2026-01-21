import Card from '@/components/ui/Card';
import ActionBar from '@/components/ui/ActionBar';
import Button from '@/components/ui/Button';
import InputField from '@/components/ui/InputField';
import ReRollOptions, { type RerollConfig } from '@/components/calculator/ReRollOptions';
import CardHeader from '@/components/ui/CardHeader';
import SectionBlock from '@/components/ui/SectionBlock';
import DebugPanel from '@/components/ui/DebugPanel';

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

type BreakMoraleCheckResults = {
  rolls: number[];
  usedRolls: number[];
  total: number;
  target: number;
  outcome: 'Passed' | 'Failed';
  isDoubleOne: boolean;
};

type BreakMoraleCheckProps = {
  discipline: string;
  bonus: string;
  malus: string;
  stubborn: boolean;
  withThreeDice: boolean;
  errorMessage: string;
  results: BreakMoraleCheckResults | null;
  rerollConfig: RerollConfig;
  debug: {
    initialRolls: number[];
    rerollRolls: number[];
    finalRolls: number[];
  };
  onDisciplineChange: (value: string) => void;
  onBonusChange: (value: string) => void;
  onMalusChange: (value: string) => void;
  onStubbornChange: (value: boolean) => void;
  onWithThreeDiceChange: (value: boolean) => void;
  onRoll: () => void;
  onBack: () => void;
  onRerollChange: (config: RerollConfig) => void;
};

export default function BreakMoraleCheck({
  discipline,
  bonus,
  malus,
  stubborn,
  withThreeDice,
  errorMessage,
  results,
  rerollConfig,
  debug,
  onDisciplineChange,
  onBonusChange,
  onMalusChange,
  onStubbornChange,
  onWithThreeDiceChange,
  onRoll,
  onBack,
  onRerollChange,
}: BreakMoraleCheckProps) {
  return (
    <Card className="px-4 py-5 sm:px-6 sm:py-6">
      <CardHeader
        title="Break / Morale check"
        onBack={onBack}
        backLabel="Back to phases"
      />

      <div className="mt-4 space-y-5">
        <InputField
          id="moraleDiscipline"
          label="Discipline"
          value={discipline}
          min="1"
          max="10"
          onChange={onDisciplineChange}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
          <InputField
            id="moraleBonus"
            label="Bonus"
            value={bonus}
            min="0"
            onChange={onBonusChange}
          />
          <InputField
            id="moraleMalus"
            label="Malus"
            value={malus}
            min="0"
            onChange={onMalusChange}
          />
        </div>
        <SectionBlock title="Options" contentClassName="mt-3">
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
              <input
                type="checkbox"
                checked={stubborn}
                onChange={(e) => onStubbornChange(e.target.checked)}
                className="h-4 w-4 border-2 border-zinc-900"
              />
              Stubborn
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
              <input
                type="checkbox"
                checked={withThreeDice}
                onChange={(e) => onWithThreeDiceChange(e.target.checked)}
                className="h-4 w-4 border-2 border-zinc-900"
              />
              With three dice
            </label>
          </div>
        </SectionBlock>
        <ReRollOptions config={rerollConfig} onChange={onRerollChange} compact />
      </div>

      <ActionBar>
        <Button type="button" onClick={onRoll} fullWidth size="lg">
          Roll
        </Button>
      </ActionBar>
      {errorMessage ? (
        <p className="mt-4 border-2 border-zinc-900 bg-zinc-100 px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-zinc-700">
          {errorMessage}
        </p>
      ) : null}

      {results ? (
        <Card className="mt-5 bg-stone-50 px-4 py-4 sm:px-6 sm:py-5">
          <h3 className="text-lg font-semibold text-zinc-900">Results</h3>
          <div className="mt-4 space-y-2 text-sm">
            <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2">
              <span className="text-zinc-600">Target value</span>
              <span className="font-mono text-lg text-zinc-900">{results.target}</span>
            </p>
            <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2">
              <span className="text-zinc-600">Dice used</span>
              <span className="font-mono text-lg text-zinc-900">{results.usedRolls.join(', ')}</span>
            </p>
            <div className="w-full flex items-center justify-between border-2 border-zinc-900 bg-zinc-900 px-4 py-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-200">
                  {results.outcome}
                </span>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-300">
                  Total: {results.total}
                </p>
              </div>
              <span className="font-mono text-2xl font-bold text-white sm:text-3xl">
                {results.outcome}
              </span>
            </div>
            <p className="text-xs text-zinc-600">
              Rolls: <span className="font-mono text-zinc-900">{results.rolls.join(', ')}</span>
            </p>
            {results.isDoubleOne ? (
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
                Double 1: automatic success
              </p>
            ) : null}
          </div>
        </Card>
      ) : null}
      <DebugPanel
        lines={[
          { label: 'Discipline', value: discipline || '-' },
          { label: 'Bonus', value: bonus || '-' },
          { label: 'Malus', value: malus || '-' },
          { label: 'Stubborn', value: stubborn ? 'Yes' : 'No' },
          { label: 'With three dice', value: withThreeDice ? 'Yes' : 'No' },
          { label: 'Re-roll', value: formatRerollLabel(rerollConfig) },
          { label: 'Initial rolls', value: debug.initialRolls.join(', ') || '-' },
          { label: 'Re-rolls', value: debug.rerollRolls.join(', ') || '-' },
          { label: 'Final rolls', value: debug.finalRolls.join(', ') || '-' },
        ]}
      />
    </Card>
  );
}
