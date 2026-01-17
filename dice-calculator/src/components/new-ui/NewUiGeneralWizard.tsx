import Card from '@/components/ui/Card';
import InputField from '@/components/ui/InputField';
import ReRollOptions, { type RerollConfig } from '@/components/calculator/ReRollOptions';
import DebugPanel from '@/components/ui/DebugPanel';

type NewUiGeneralWizardProps = {
  step: number;
  mode: 'probability' | 'throw';
  diceCount: string;
  objective: 'target' | 'total';
  targetValue: string;
  rerollConfig: RerollConfig;
  onNext: () => void;
  onBack: () => void;
  onCalculate: () => void;
  onDiceCountChange: (value: string) => void;
  onObjectiveChange: (objective: 'target' | 'total') => void;
  onTargetValueChange: (value: string) => void;
  onRerollChange: (config: RerollConfig) => void;
};

const steps = ['Setup', 'Special rules'];

export default function NewUiGeneralWizard({
  step,
  mode,
  diceCount,
  objective,
  targetValue,
  rerollConfig,
  onNext,
  onBack,
  onCalculate,
  onDiceCountChange,
  onObjectiveChange,
  onTargetValueChange,
  onRerollChange,
}: NewUiGeneralWizardProps) {
  const isLast = step === steps.length - 1;

  return (
    <Card className="px-4 py-5 sm:px-6 sm:py-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">General throw</h2>
        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
          Step {step + 1} / {steps.length}: {steps[step]}
        </p>
      </div>

      <div className="mt-6 space-y-5">
        {step === 0 ? (
          <>
            <InputField
              id="newGeneralDiceCount"
              label="Number of dice to throw"
              value={diceCount}
              min="1"
              onChange={onDiceCountChange}
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">Objective</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onObjectiveChange('target')}
                  className={`border-2 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors hover:bg-zinc-900 hover:text-white ${
                    objective === 'target'
                      ? 'border-zinc-900 bg-zinc-900 text-white'
                      : 'border-zinc-900 bg-white text-zinc-900'
                  }`}
                >
                  Target value
                </button>
                <button
                  type="button"
                  onClick={() => onObjectiveChange('total')}
                  className={`border-2 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors hover:bg-zinc-900 hover:text-white ${
                    objective === 'total'
                      ? 'border-zinc-900 bg-zinc-900 text-white'
                      : 'border-zinc-900 bg-white text-zinc-900'
                  }`}
                >
                  Total throw
                </button>
              </div>
            </div>
            {objective === 'target' ? (
              <InputField
                id="newGeneralTarget"
                label="Target (X+)"
                value={targetValue}
                min="1"
                max="7"
                onChange={onTargetValueChange}
              />
            ) : null}
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
              Mode: {mode === 'probability' ? 'Probability' : 'Throw'}
            </p>
          </>
        ) : null}

        {step === 1 ? (
          <ReRollOptions config={rerollConfig} onChange={onRerollChange} />
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="border-2 border-zinc-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors hover:bg-zinc-900 hover:text-white"
        >
          Back
        </button>
        <button
          type="button"
          onClick={isLast ? onCalculate : onNext}
          className="border-2 border-zinc-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors hover:bg-zinc-900 hover:text-white"
        >
          {isLast ? 'Calculate' : 'Next'}
        </button>
      </div>

      <DebugPanel
        lines={[
          { label: 'Initial rolls', value: '-' },
          { label: 'Re-rolls', value: '-' },
        ]}
      />
    </Card>
  );
}
