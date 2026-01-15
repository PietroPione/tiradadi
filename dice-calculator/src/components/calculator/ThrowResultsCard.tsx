import Card from '@/components/ui/Card';

export type ThrowResults = {
  successfulHits: number;
  successfulWounds: number;
  poisonedAutoWounds: number;
  nonPoisonHits: number;
  failedArmorSaves: number;
  failedWardSaves: number;
  finalDamage: number;
};

type ThrowResultsCardProps = {
  results: ThrowResults;
};

export default function ThrowResultsCard({ results }: ThrowResultsCardProps) {
  return (
    <Card className="mt-5 bg-stone-50 px-4 py-4 sm:px-6 sm:py-5">
      <h2 className="text-lg font-semibold text-zinc-900">Results</h2>
      <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2 sm:border-b-0 sm:pb-0">
          <span className="text-zinc-600">Successful Hits</span>
          <span className="font-mono text-lg text-zinc-900">{results.successfulHits}</span>
        </p>
        <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2 sm:border-b-0 sm:pb-0">
          <span className="text-zinc-600">Poisoned attack</span>
          <span className="font-mono text-lg text-zinc-900">{results.poisonedAutoWounds}</span>
        </p>
        <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2 sm:border-b-0 sm:pb-0">
          <span className="text-zinc-600">Hit that are not poisoned attacks</span>
          <span className="font-mono text-lg text-zinc-900">{results.nonPoisonHits}</span>
        </p>
        <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2 sm:border-b-0 sm:pb-0">
          <span className="text-zinc-600">Successful Wounds</span>
          <span className="font-mono text-lg text-zinc-900">{results.successfulWounds}</span>
        </p>
        <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2 sm:border-b-0 sm:pb-0">
          <span className="text-zinc-600">Failed Armor Saves</span>
          <span className="font-mono text-lg text-zinc-900">{results.failedArmorSaves}</span>
        </p>
        <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2 sm:border-b-0 sm:pb-0">
          <span className="text-zinc-600">Failed Ward Saves</span>
          <span className="font-mono text-lg text-zinc-900">{results.failedWardSaves}</span>
        </p>
        <div className="sm:col-span-2">
          <div className="w-full flex items-center justify-between border-2 border-zinc-900 bg-zinc-900 px-4 py-3">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-200">
                Final Damage
              </span>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-300">
                Real Damage: {results.finalDamage.toFixed(2)}
              </p>
            </div>
            <span className="font-mono text-2xl font-bold text-white sm:text-3xl">
              {Math.round(results.finalDamage)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
