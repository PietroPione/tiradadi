type ModeSwitchProps = {
  mode: 'probability' | 'throw';
  onModeChange: (mode: 'probability' | 'throw') => void;
};

export default function ModeSwitch({ mode, onModeChange }: ModeSwitchProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onModeChange('probability')}
        className={`border-2 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors hover:bg-zinc-900 hover:text-white ${
          mode === 'probability'
            ? 'border-zinc-900 bg-zinc-900 text-white'
            : 'border-zinc-900 bg-white text-zinc-900'
        }`}
      >
        Probability calculator
      </button>
      <button
        type="button"
        onClick={() => onModeChange('throw')}
        className={`border-2 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors hover:bg-zinc-900 hover:text-white ${
          mode === 'throw'
            ? 'border-zinc-900 bg-zinc-900 text-white'
            : 'border-zinc-900 bg-white text-zinc-900'
        }`}
      >
        Throw dices
      </button>
    </div>
  );
}
