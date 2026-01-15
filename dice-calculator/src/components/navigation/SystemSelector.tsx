import Card from '@/components/ui/Card';

type GameSystem = 'wfb8';

type SystemSelectorProps = {
  onSelect: (system: GameSystem) => void;
};

export default function SystemSelector({ onSelect }: SystemSelectorProps) {
  return (
    <Card className="px-4 py-5 sm:px-6 sm:py-6">
      <h2 className="text-lg font-semibold text-zinc-900">Choose game system</h2>
      <p className="mt-2 text-sm text-zinc-600">Pick a ruleset to continue.</p>
      <div className="mt-4">
        <button
          type="button"
          onClick={() => onSelect('wfb8')}
          className="w-full border-2 border-zinc-900 bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-900 transition-colors hover:bg-zinc-900 hover:text-white"
        >
          Warhammer Fantasy 8th
        </button>
      </div>
    </Card>
  );
}
