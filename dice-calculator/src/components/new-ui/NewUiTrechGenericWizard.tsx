import Card from '@/components/ui/Card';
import InputField from '@/components/ui/InputField';
import DebugPanel from '@/components/ui/DebugPanel';

type NewUiTrechGenericWizardProps = {
  step: number;
  plusDice: string;
  minusDice: string;
  positiveModifier: string;
  negativeModifier: string;
  onNext: () => void;
  onBack: () => void;
  onCalculate: () => void;
  onPlusDiceChange: (value: string) => void;
  onMinusDiceChange: (value: string) => void;
  onPositiveModifierChange: (value: string) => void;
  onNegativeModifierChange: (value: string) => void;
};

const steps = ['Dice', 'Modifiers'];

export default function NewUiTrechGenericWizard({
  step,
  plusDice,
  minusDice,
  positiveModifier,
  negativeModifier,
  onNext,
  onBack,
  onCalculate,
  onPlusDiceChange,
  onMinusDiceChange,
  onPositiveModifierChange,
  onNegativeModifierChange,
}: NewUiTrechGenericWizardProps) {
  const isLast = step === steps.length - 1;

  return (
    <Card className="px-4 py-5 sm:px-6 sm:py-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">Generic roll</h2>
        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
          Step {step + 1} / {steps.length}: {steps[step]}
        </p>
      </div>

      <div className="mt-6 space-y-5">
        {step === 0 ? (
          <>
            <p className="text-sm text-zinc-600">Success on 7+.</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
              <InputField
                id="newTrechPlusDice"
                label="+Dice"
                value={plusDice}
                min="0"
                onChange={onPlusDiceChange}
              />
              <InputField
                id="newTrechMinusDice"
                label="-Dice"
                value={minusDice}
                min="0"
                onChange={onMinusDiceChange}
              />
            </div>
          </>
        ) : null}

        {step === 1 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            <InputField
              id="newTrechPositiveMod"
              label="Positive modifier"
              value={positiveModifier}
              min="0"
              onChange={onPositiveModifierChange}
            />
            <InputField
              id="newTrechNegativeMod"
              label="Negative modifier"
              value={negativeModifier}
              min="0"
              onChange={onNegativeModifierChange}
            />
          </div>
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
          { label: 'Selected rolls', value: '-' },
        ]}
      />
    </Card>
  );
}
