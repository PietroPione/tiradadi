import Card from '@/components/ui/Card';
import DebugPanel from '@/components/ui/DebugPanel';

type NewUiPlaceholderWizardProps = {
  title: string;
  stepLabel: string;
  onBack: () => void;
};

export default function NewUiPlaceholderWizard({
  title,
  stepLabel,
  onBack,
}: NewUiPlaceholderWizardProps) {
  return (
    <Card className="px-4 py-5 sm:px-6 sm:py-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
          Step 1 / 1: {stepLabel}
        </p>
      </div>

      <div className="mt-6 rounded-sm border-2 border-dashed border-zinc-300 bg-zinc-50 px-4 py-5 text-sm text-zinc-600">
        Coming soon.
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="border-2 border-zinc-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors hover:bg-zinc-900 hover:text-white"
        >
          Back
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
