import InputField from '@/components/ui/InputField';
import ToggleButton from '@/components/ui/ToggleButton';

type RerollConfig = {
  enabled: boolean;
  mode: 'failed' | 'success';
  scope: 'all' | 'specific';
  specificValues: string;
};

type ReRollOptionsProps = {
  config: RerollConfig;
  onChange: (config: RerollConfig) => void;
  compact?: boolean;
};

export type { RerollConfig };

export default function ReRollOptions({ config, onChange, compact = false }: ReRollOptionsProps) {
  const update = (patch: Partial<RerollConfig>) => {
    onChange({ ...config, ...patch });
  };
  const buttonSize = compact ? 'sm' : 'md';
  const gapClass = compact ? 'flex flex-wrap gap-1.5' : 'flex flex-wrap gap-2';

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
            <div className={gapClass}>
              <ToggleButton
                active={config.mode === 'failed'}
                onClick={() => update({ mode: 'failed' })}
                size={buttonSize}
              >
                Re-roll failed
              </ToggleButton>
              <ToggleButton
                active={config.mode === 'success'}
                onClick={() => update({ mode: 'success' })}
                size={buttonSize}
              >
                Re-roll success
              </ToggleButton>
            </div>
            <div className={gapClass}>
              <ToggleButton
                active={config.scope === 'all'}
                onClick={() => update({ scope: 'all' })}
                size={buttonSize}
              >
                All
              </ToggleButton>
              <ToggleButton
                active={config.scope === 'specific'}
                onClick={() => update({ scope: 'specific' })}
                size={buttonSize}
              >
                Specific values
              </ToggleButton>
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
