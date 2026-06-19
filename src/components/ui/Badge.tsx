import { BADGE_CLASSES, type BadgeVariant } from "@/lib/projects/formatters";

type BadgeProps = {
  label: string;
  variant?: BadgeVariant;
};

export function Badge({ label, variant = "neutral" }: BadgeProps) {
  return (
    <span
      className={`inline-flex rounded px-2 py-0.5 text-xs font-medium whitespace-nowrap ${BADGE_CLASSES[variant]}`}
    >
      {label}
    </span>
  );
}
