import Card from '@/components/ui/Card';

type ComingSoonCardProps = {
  title: string;
  onBack: () => void;
};

export default function ComingSoonCard({ title, onBack }: ComingSoonCardProps) {
  return (
    <Card className="px-4 py-5 sm:px-6 sm:py-6">
      <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
      <p className="mt-2 text-sm text-zinc-600">Coming soon.</p>
      <button
        type="button"
        onClick={onBack}
        className="mt-4 border-2 border-zinc-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors hover:bg-zinc-900 hover:text-white"
      >
        Back to phases
      </button>
    </Card>
  );
}
