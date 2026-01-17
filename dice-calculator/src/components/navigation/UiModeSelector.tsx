import Card from '@/components/ui/Card';

type UiMode = 'classic' | 'new';

type UiModeSelectorProps = {
  onSelect: (mode: UiMode) => void;
};

export default function UiModeSelector({ onSelect }: UiModeSelectorProps) {
  return (
    <Card className="px-4 py-5 sm:px-6 sm:py-6">
      <h2 className="text-lg font-semibold text-zinc-900">Choose interface</h2>
      <p className="mt-2 text-sm text-zinc-600">Pick the UI style to continue.</p>
      <div className="mt-4 grid gap-3">
        <button
          type="button"
          onClick={() => onSelect('new')}
          className="w-full border-2 border-zinc-900 bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-900 transition-colors hover:bg-zinc-900 hover:text-white"
        >
          New UI
        </button>
        <button
          type="button"
          onClick={() => onSelect('classic')}
          className="w-full border-2 border-zinc-900 bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-900 transition-colors hover:bg-zinc-900 hover:text-white"
        >
          Classical UI
        </button>
      </div>
    </Card>
  );
}
