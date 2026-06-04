import { Rank } from "@/lib/constants";

interface Props {
  rank: Rank;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-3 py-1",
  lg: "text-base px-4 py-2",
};

export default function RankBadge({ rank, size = "md" }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-bold ${sizes[size]}`}
      style={{
        background: rank.glow,
        color: rank.color,
        border: `1px solid ${rank.color}44`,
        textShadow: `0 0 8px ${rank.color}88`,
      }}
    >
      {rank.icon} {rank.name}
    </span>
  );
}
