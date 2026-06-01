interface IrisProps {
  size?: number;
  className?: string;
  animated?: boolean;
}

export function Iris({ size = 36, className = "", animated = false }: IrisProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={`${animated ? "animate-iris" : ""} ${className}`}
      style={{ filter: "drop-shadow(0 0 6px rgba(193,123,63,0.45))" }}
    >
      <circle cx="32" cy="32" r="28" stroke="var(--copper)" strokeWidth="1" fill="none" opacity="0.6" />
      <ellipse cx="32" cy="32" rx="22" ry="22" stroke="var(--copper)" strokeWidth="0.8" fill="none" opacity="0.45" transform="rotate(30 32 32)" />
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i * 60 * Math.PI) / 180;
        const x1 = 32 + Math.cos(angle) * 8;
        const y1 = 32 + Math.sin(angle) * 8;
        const x2 = 32 + Math.cos(angle) * 22;
        const y2 = 32 + Math.sin(angle) * 22;
        const cx = 32 + Math.cos(angle + 0.3) * 16;
        const cy = 32 + Math.sin(angle + 0.3) * 16;
        return (
          <path
            key={i}
            d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`}
            stroke="var(--copper)"
            strokeWidth="0.8"
            fill="none"
            opacity="0.65"
          />
        );
      })}
      <circle cx="32" cy="32" r="4" fill="var(--copper)" />
    </svg>
  );
}
