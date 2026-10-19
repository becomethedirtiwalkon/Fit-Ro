type LogoProps = {
  size?: number;
  className?: string;
  stroke?: string;
  animated?: boolean;
};

export function LogoMark({
  size = 44,
  className = "",
  stroke = "#332A26",
  animated = false,
}: LogoProps) {
  return (
    <svg
      viewBox="0 0 220 220"
      width={size}
      height={size}
      fill="none"
      aria-hidden="true"
      className={`${animated ? "logo-draw" : ""} ${className}`}
    >
      <g
        stroke={stroke}
        strokeWidth={6.5}
        fill="none"
        strokeLinecap="butt"
        strokeMiterlimit={10}
      >
        <circle cx="110" cy="110" r="86" strokeDasharray="498 42.4" strokeDashoffset="-93" />
        <path d="M60 150 L102 54 L144 150" />
        <path d="M78 114 H126" />
        <path d="M62 56 H126 a30 30 0 0 1 0 60 H100" />
        <path d="M118 116 L162 190" />
      </g>
    </svg>
  );
}

export function LogoLockup({
  size = 96,
  stroke = "#332A26",
  subtitleColor = "#8A7A70",
  animated = false,
}: LogoProps & { subtitleColor?: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <LogoMark size={size} stroke={stroke} animated={animated} />
      <div className="text-center">
        <p
          className="tracking-brand text-[13px] font-semibold uppercase"
          style={{ color: stroke }}
        >
          Ro Alcalá Fit
        </p>
        <p
          className="mt-1 text-[9px] font-medium uppercase tracking-[0.42em]"
          style={{ color: subtitleColor }}
        >
          Personal Trainer
        </p>
      </div>
    </div>
  );
}
