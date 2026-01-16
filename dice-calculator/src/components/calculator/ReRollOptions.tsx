import InputField from '@/components/ui/InputField';

type RerollConfig = {
  enabled: boolean;
  mode: 'failed' | 'success';
  scope: 'all' | 'specific';
  specificValues: string;
};

type ReRollOptionsProps = {
  config: RerollConfig;
  onChange: (config: RerollConfig) => void;
};

export type { RerollConfig };

export default function ReRollOptions({ config, onChange }: ReRollOptionsProps) {
  const update = (patch: Partial<RerollConfig>) => {
    onChange({ ...config, ...patch });
  };

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">Re-roll</p>
      <div className="mt-3 space-y-3">
        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={(e) => update({ enabled: e.target.checked })}
            className="h-4 w-4 border-2 border-zinc-900"
          />
          Enable re-roll
        </label>

        {config.enabled ? (
          <>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => update({ mode: 'failed' })}
                className={`border-2 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors hover:bg-zinc-900 hover:text-white ${
                  config.mode === 'failed'
                    ? 'border-zinc-900 bg-zinc-900 text-white'
                    : 'border-zinc-900 bg-white text-zinc-900'
                }`}
              >
                Re-roll failed
              </button>
              <button
                type="button"
                onClick={() => update({ mode: 'success' })}
                className={`border-2 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors hover:bg-zinc-900 hover:text-white ${
                  config.mode === 'success'
                    ? 'border-zinc-900 bg-zinc-900 text-white'
                    : 'border-zinc-900 bg-white text-zinc-900'
                }`}
              >
                Re-roll success
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => update({ scope: 'all' })}
                className={`border-2 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors hover:bg-zinc-900 hover:text-white ${
                  config.scope === 'all'
                    ? 'border-zinc-900 bg-zinc-900 text-white'
                    : 'border-zinc-900 bg-white text-zinc-900'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => update({ scope: 'specific' })}
                className={`border-2 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors hover:bg-zinc-900 hover:text-white ${
                  config.scope === 'specific'
                    ? 'border-zinc-900 bg-zinc-900 text-white'
                    : 'border-zinc-900 bg-white text-zinc-900'
                }`}
              >
                Specific values
              </button>
            </div>
            {config.scope === 'specific' ? (
              <InputField
                id="rerollSpecificValues"
                label="Specific values"
                type="text"
                value={config.specificValues}
                placeholder="Input values separated by comma"
                onChange={(value) => update({ specificValues: value })}
              />
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
