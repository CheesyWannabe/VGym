interface Props {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}

export default function StatCard({ label, value, sub, accent }: Props) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <p className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-1">
        {label}
      </p>
      <p className="text-2xl font-black" style={{ color: accent ?? "#fff" }}>
        {value}
      </p>
      {sub && <p className="text-zinc-500 text-xs mt-0.5">{sub}</p>}
    </div>
  );
}
