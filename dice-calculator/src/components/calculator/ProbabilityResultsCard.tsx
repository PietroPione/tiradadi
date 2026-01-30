import Card from '@/components/ui/Card';

export type ProbabilityResults = {
  successfulHits: number;
  successfulWounds: number;
  poisonedAutoWounds: number;
  failedArmorSaves: number;
  failedWardSaves: number;
  finalDamage: number;
  modelsRemoved?: number;
  glancingHits?: number;
  penetratingHits?: number;
  crewShaken?: number;
  crewStunned?: number;
  weaponDestroyed?: number;
  immobilised?: number;
  explodes?: number;
};

type ProbabilityResultsCardProps = {
  results: ProbabilityResults;
  poisonedAttack: boolean;
  wardLabel?: string;
};

export default function ProbabilityResultsCard({
  results,
  poisonedAttack,
  wardLabel = 'Ward',
}: ProbabilityResultsCardProps) {
  return (
    <Card className="mt-5 bg-stone-50 px-4 py-4 sm:px-6 sm:py-5">
      <h2 className="text-lg font-semibold text-zinc-900">Results</h2>
      <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2 sm:border-b-0 sm:pb-0">
          <span className="text-zinc-600">Successful Hits</span>
          <span className="font-mono text-lg text-zinc-900">{results.successfulHits}</span>
        </p>
        {poisonedAttack ? (
          <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2 sm:border-b-0 sm:pb-0">
            <span className="text-zinc-600">Poisoned Auto Wounds</span>
            <span className="font-mono text-lg text-zinc-900">{results.poisonedAutoWounds}</span>
          </p>
        ) : null}
        <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2 sm:border-b-0 sm:pb-0">
          <span className="text-zinc-600">Successful Wounds</span>
          <span className="font-mono text-lg text-zinc-900">{results.successfulWounds}</span>
        </p>
        <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2 sm:border-b-0 sm:pb-0">
          <span className="text-zinc-600">Failed Armor Saves</span>
          <span className="font-mono text-lg text-zinc-900">{results.failedArmorSaves}</span>
        </p>
        <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2 sm:border-b-0 sm:pb-0">
          <span className="text-zinc-600">Failed {wardLabel} Saves</span>
          <span className="font-mono text-lg text-zinc-900">{results.failedWardSaves}</span>
        </p>
        {typeof results.glancingHits === 'number' ? (
          <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2 sm:border-b-0 sm:pb-0">
            <span className="text-zinc-600">Glancing Hits</span>
            <span className="font-mono text-lg text-zinc-900">{results.glancingHits.toFixed(2)}</span>
          </p>
        ) : null}
        {typeof results.penetratingHits === 'number' ? (
          <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2 sm:border-b-0 sm:pb-0">
            <span className="text-zinc-600">Penetrating Hits</span>
            <span className="font-mono text-lg text-zinc-900">{results.penetratingHits.toFixed(2)}</span>
          </p>
        ) : null}
        {typeof results.crewShaken === 'number' ? (
          <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2 sm:border-b-0 sm:pb-0">
            <span className="text-zinc-600">Crew Shaken</span>
            <span className="font-mono text-lg text-zinc-900">{results.crewShaken.toFixed(2)}</span>
          </p>
        ) : null}
        {typeof results.crewStunned === 'number' ? (
          <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2 sm:border-b-0 sm:pb-0">
            <span className="text-zinc-600">Crew Stunned</span>
            <span className="font-mono text-lg text-zinc-900">{results.crewStunned.toFixed(2)}</span>
          </p>
        ) : null}
        {typeof results.weaponDestroyed === 'number' ? (
          <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2 sm:border-b-0 sm:pb-0">
            <span className="text-zinc-600">Weapon Destroyed</span>
            <span className="font-mono text-lg text-zinc-900">{results.weaponDestroyed.toFixed(2)}</span>
          </p>
        ) : null}
        {typeof results.immobilised === 'number' ? (
          <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2 sm:border-b-0 sm:pb-0">
            <span className="text-zinc-600">Immobilised</span>
            <span className="font-mono text-lg text-zinc-900">{results.immobilised.toFixed(2)}</span>
          </p>
        ) : null}
        {typeof results.explodes === 'number' ? (
          <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2 sm:border-b-0 sm:pb-0">
            <span className="text-zinc-600">Explodes</span>
            <span className="font-mono text-lg text-zinc-900">{results.explodes.toFixed(2)}</span>
          </p>
        ) : null}
        {typeof results.modelsRemoved === 'number' ? (
          <p className="flex items-center justify-between border-b-2 border-zinc-900 pb-2 sm:border-b-0 sm:pb-0">
            <span className="text-zinc-600">Models Removed</span>
            <span className="font-mono text-lg text-zinc-900">{results.modelsRemoved.toFixed(2)}</span>
          </p>
        ) : null}
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
