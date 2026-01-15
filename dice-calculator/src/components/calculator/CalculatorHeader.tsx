import Card from '@/components/ui/Card';

type CalculatorHeaderProps = {
  mode: 'probability' | 'throw';
  hasResults: boolean;
  finalDamage: number;
};

export default function CalculatorHeader({ mode, hasResults, finalDamage }: CalculatorHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b-2 border-zinc-900 px-6 py-6 sm:flex-row sm:items-end sm:justify-between sm:px-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
          Mathammer
        </p>
        <h1 className="mt-2 text-3xl font-bold text-zinc-900 sm:text-4xl">
          Never use a dice anymore!
        </h1>
      </div>
      {mode === 'probability' && hasResults ? (
        <Card className="bg-zinc-900 px-4 py-3 text-left sm:text-right">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-200">
            Final Damage
          </p>
          <p className="mt-1 font-mono text-xl font-bold text-white sm:text-2xl">
            {Math.round(finalDamage)}
          </p>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-300">
            Real Damage: {finalDamage.toFixed(2)}
          </p>
        </Card>
      ) : null}
    </div>
  );
}
