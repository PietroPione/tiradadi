export type ThrowDebug = {
  hitTarget: number;
  woundTarget: number;
  effectiveArmorSave: number;
  poisonedAutoWounds: number;
  nonPoisonHits: number;
  predatoryCount: number;
  predatorySixes: number;
  totalAttacks: number;
  hitInitialRolls: number[];
  hitRerollRolls: number[];
  woundInitialRolls: number[];
  woundRerollRolls: number[];
  hitRolls: number[];
  woundRolls: number[];
  armorRolls: number[];
  armorRerollRolls: number[];
  wardRolls: number[];
  wardRerollRolls: number[];
  multipleWoundsRolls: number[];
};

type ThrowDebugPanelProps = {
  debug: ThrowDebug;
  wardSave: string;
  rerollHitLabel: string;
  rerollWoundLabel: string;
  rerollArmorLabel: string;
  rerollWardLabel: string;
  poisonedAttack: boolean;
  multipleWoundsValue: string;
};

export default function ThrowDebugPanel({
  debug,
  wardSave,
  rerollHitLabel,
  rerollWoundLabel,
  rerollArmorLabel,
  rerollWardLabel,
  poisonedAttack,
  multipleWoundsValue,
}: ThrowDebugPanelProps) {
  return (
    <div className="mt-4 border-2 border-dashed border-zinc-400 bg-white px-4 py-4 sm:px-6">
      <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-700">Debug</h3>
      <div className="mt-3 space-y-2 text-xs text-zinc-600">
        <p>Hit Target: <span className="font-mono text-zinc-900">{debug.hitTarget}+</span></p>
        <p>Poisoned: <span className="font-mono text-zinc-900">{poisonedAttack ? 'Yes' : 'No'}</span></p>
        <p>Re-roll hit: <span className="font-mono text-zinc-900">{rerollHitLabel}</span></p>
        <p>Predatory Count: <span className="font-mono text-zinc-900">{debug.predatoryCount}</span></p>
        <p>Predatory Sixes: <span className="font-mono text-zinc-900">{debug.predatorySixes}</span></p>
        <p>Total Attacks: <span className="font-mono text-zinc-900">{debug.totalAttacks}</span></p>
        <p>Poisoned Attacks: <span className="font-mono text-zinc-900">{debug.poisonedAutoWounds}</span></p>
        <p>Non-Poison Hits: <span className="font-mono text-zinc-900">{debug.nonPoisonHits}</span></p>
        <p>Hit Initial Rolls: <span className="font-mono text-zinc-900">{debug.hitInitialRolls.join(', ') || '-'}</span></p>
        <p>Hit Re-rolls: <span className="font-mono text-zinc-900">{debug.hitRerollRolls.join(', ') || '-'}</span></p>
        <p>Hit Rolls: <span className="font-mono text-zinc-900">{debug.hitRolls.join(', ') || '-'}</span></p>
        <p>Wound Target: <span className="font-mono text-zinc-900">{debug.woundTarget}+</span></p>
        <p>Re-roll wound: <span className="font-mono text-zinc-900">{rerollWoundLabel}</span></p>
        <p>Wound Initial Rolls: <span className="font-mono text-zinc-900">{debug.woundInitialRolls.join(', ') || '-'}</span></p>
        <p>Wound Re-rolls: <span className="font-mono text-zinc-900">{debug.woundRerollRolls.join(', ') || '-'}</span></p>
        <p>Wound Rolls: <span className="font-mono text-zinc-900">{debug.woundRolls.join(', ') || '-'}</span></p>
        <p>Armor Save Target: <span className="font-mono text-zinc-900">{debug.effectiveArmorSave}+</span></p>
        <p>Re-roll armor: <span className="font-mono text-zinc-900">{rerollArmorLabel}</span></p>
        <p>Armor Rolls: <span className="font-mono text-zinc-900">{debug.armorRolls.join(', ') || '-'}</span></p>
        <p>Armor Re-rolls: <span className="font-mono text-zinc-900">{debug.armorRerollRolls.join(', ') || '-'}</span></p>
        <p>Ward Save Target: <span className="font-mono text-zinc-900">{wardSave.trim() ? `${wardSave}+` : '-'}</span></p>
        <p>Re-roll ward: <span className="font-mono text-zinc-900">{rerollWardLabel}</span></p>
        <p>Ward Rolls: <span className="font-mono text-zinc-900">{debug.wardRolls.join(', ') || '-'}</span></p>
        <p>Ward Re-rolls: <span className="font-mono text-zinc-900">{debug.wardRerollRolls.join(', ') || '-'}</span></p>
        <p>Multiple Wounds Value: <span className="font-mono text-zinc-900">{multipleWoundsValue.trim() || '-'}</span></p>
        <p>Multiple Wounds Rolls: <span className="font-mono text-zinc-900">{debug.multipleWoundsRolls.join(', ') || '-'}</span></p>
      </div>
    </div>
  );
}
