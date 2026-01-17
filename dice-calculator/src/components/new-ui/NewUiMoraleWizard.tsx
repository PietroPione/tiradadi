import Card from '@/components/ui/Card';
import InputField from '@/components/ui/InputField';
import ReRollOptions, { type RerollConfig } from '@/components/calculator/ReRollOptions';
import DebugPanel from '@/components/ui/DebugPanel';

type NewUiMoraleWizardProps = {
  step: number;
  discipline: string;
  bonus: string;
  malus: string;
  stubborn: boolean;
  withThreeDice: boolean;
  rerollConfig: RerollConfig;
  onNext: () => void;
  onBack: () => void;
  onCalculate: () => void;
  onDisciplineChange: (value: string) => void;
  onBonusChange: (value: string) => void;
  onMalusChange: (value: string) => void;
  onStubbornChange: (value: boolean) => void;
  onWithThreeDiceChange: (value: boolean) => void;
  onRerollChange: (config: RerollConfig) => void;
};

const steps = ['Setup', 'Special rules'];

export default function NewUiMoraleWizard({
  step,
  discipline,
  bonus,
  malus,
  stubborn,
  withThreeDice,
  rerollConfig,
  onNext,
  onBack,
  onCalculate,
  onDisciplineChange,
  onBonusChange,
  onMalusChange,
  onStubbornChange,
  onWithThreeDiceChange,
  onRerollChange,
}: NewUiMoraleWizardProps) {
  const isLast = step === steps.length - 1;

  return (
    <Card className="px-4 py-5 sm:px-6 sm:py-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">Break / Morale check</h2>
        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
          Step {step + 1} / {steps.length}: {steps[step]}
        </p>
      </div>

      <div className="mt-6 space-y-5">
        {step === 0 ? (
          <>
            <InputField
              id="newMoraleDiscipline"
              label="Discipline"
              value={discipline}
              min="1"
              max="10"
              onChange={onDisciplineChange}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
              <InputField
                id="newMoraleBonus"
                label="Bonus"
                value={bonus}
                min="0"
                onChange={onBonusChange}
              />
              <InputField
                id="newMoraleMalus"
                label="Malus"
                value={malus}
                min="0"
                onChange={onMalusChange}
              />
            </div>
          </>
        ) : null}

        {step === 1 ? (
          <>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
              <input
                type="checkbox"
                checked={stubborn}
                onChange={(e) => onStubbornChange(e.target.checked)}
                className="h-4 w-4 border-2 border-zinc-900"
              />
              Stubborn
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
              <input
                type="checkbox"
                checked={withThreeDice}
                onChange={(e) => onWithThreeDiceChange(e.target.checked)}
                className="h-4 w-4 border-2 border-zinc-900"
              />
              With three dice
            </div>
            <ReRollOptions config={rerollConfig} onChange={onRerollChange} />
          </>
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
