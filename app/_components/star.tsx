// Four-point compass star, matching the InControl logo mark.
export default function Star({ size = 40, color = "#B5905A" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden>
      {/* vertical spindle */}
      <polygon points="50,2 58,50 50,98 42,50" fill={color} />
      {/* horizontal spindle (slightly shorter) */}
      <polygon points="5,50 50,57 95,50 50,43" fill={color} opacity="0.9" />
      {/* small NW arc accent */}
      <path d="M24 30 A36 36 0 0 1 50 18" stroke={color} strokeWidth="2" fill="none" opacity="0.7" />
    </svg>
  );
}
