export type ThrowDebug = {
  hitTarget: number;
  woundTarget: number;
  effectiveArmorSave: number;
  poisonedAutoWounds: number;
  nonPoisonHits: number;
  hitRolls: number[];
  woundRolls: number[];
  armorRolls: number[];
  wardRolls: number[];
};

type ThrowDebugPanelProps = {
  debug: ThrowDebug;
  wardSave: string;
};

export default function ThrowDebugPanel({ debug, wardSave }: ThrowDebugPanelProps) {
  return (
    <div className="mt-4 border-2 border-dashed border-zinc-400 bg-white px-4 py-4 sm:px-6">
      <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-700">Debug</h3>
      <div className="mt-3 space-y-2 text-xs text-zinc-600">
        <p>Hit Target: <span className="font-mono text-zinc-900">{debug.hitTarget}+</span></p>
        <p>Poisoned Attacks: <span className="font-mono text-zinc-900">{debug.poisonedAutoWounds}</span></p>
        <p>Non-Poison Hits: <span className="font-mono text-zinc-900">{debug.nonPoisonHits}</span></p>
        <p>Hit Rolls: <span className="font-mono text-zinc-900">{debug.hitRolls.join(', ') || '-'}</span></p>
        <p>Wound Target: <span className="font-mono text-zinc-900">{debug.woundTarget}+</span></p>
        <p>Wound Rolls: <span className="font-mono text-zinc-900">{debug.woundRolls.join(', ') || '-'}</span></p>
        <p>Armor Save Target: <span className="font-mono text-zinc-900">{debug.effectiveArmorSave}+</span></p>
        <p>Armor Rolls: <span className="font-mono text-zinc-900">{debug.armorRolls.join(', ') || '-'}</span></p>
        <p>Ward Save Target: <span className="font-mono text-zinc-900">{wardSave}+</span></p>
        <p>Ward Rolls: <span className="font-mono text-zinc-900">{debug.wardRolls.join(', ') || '-'}</span></p>
      </div>
    </div>
  );
}
