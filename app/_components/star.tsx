// Four-point compass star, matching the InControl logo mark.
export default function Star({ size = 40, color = "#B5905A" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden>
      {/* vertical spindle */}
      <polygon points="50,2 56,50 50,98 44,50" fill={color} />
      {/* horizontal spindle (slightly shorter) */}
      <polygon points="6,50 50,55 94,50 50,45" fill={color} opacity="0.92" />
      {/* small NW arc accent */}
      <path d="M24 30 A36 36 0 0 1 50 18" stroke={color} strokeWidth="2" fill="none" opacity="0.7" />
    </svg>
  );
}
