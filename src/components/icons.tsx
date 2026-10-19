type IconProps = { className?: string; size?: number };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export const IconFeed = ({ className, size = 22 }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M4 7h16M4 12h10M4 17h7" />
    <circle cx="18.5" cy="16.5" r="2.5" />
  </svg>
);

export const IconDumbbell = ({ className, size = 22 }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M3 9v6M6 7v10M18 7v10M21 9v6M6 12h12" />
  </svg>
);

export const IconChat = ({ className, size = 22 }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M20 12a7.5 7.5 0 0 1-10.9 6.7L4 20l1.4-4.2A7.5 7.5 0 1 1 20 12Z" />
  </svg>
);

export const IconUser = ({ className, size = 22 }: IconProps) => (
  <svg {...base(size)} className={className}>
    <circle cx="12" cy="8.5" r="3.5" />
    <path d="M5 20c.8-3.6 3.5-5.5 7-5.5s6.2 1.9 7 5.5" />
  </svg>
);

export const IconSpark = ({ className, size = 22 }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M12 3.5 13.8 9 19 10.8 13.8 12.6 12 18l-1.8-5.4L5 10.8 10.2 9 12 3.5Z" />
  </svg>
);

export const IconHeart = ({
  className,
  size = 20,
  filled = false,
}: IconProps & { filled?: boolean }) => (
  <svg {...base(size)} className={className} fill={filled ? "currentColor" : "none"}>
    <path d="M12 20s-7-4.3-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.7-7 9-7 9Z" />
  </svg>
);

export const IconSend = ({ className, size = 20 }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M4.5 12 20 4.5 15.5 20l-3.7-6.1L4.5 12Z" />
  </svg>
);

export const IconPlus = ({ className, size = 20 }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconCamera = ({ className, size = 20 }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M4 8.5h3l1.5-2h7L17 8.5h3v10H4v-10Z" />
    <circle cx="12" cy="13" r="3.2" />
  </svg>
);

export const IconCheck = ({ className, size = 20 }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="m5 12.5 4.5 4.5L19 7" />
  </svg>
);

export const IconChevron = ({ className, size = 20 }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="m9 5 7 7-7 7" />
  </svg>
);

export const IconBack = ({ className, size = 22 }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M15 5 8 12l7 7" />
  </svg>
);

export const IconLeaf = ({ className, size = 22 }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M5 19C4 12 8 5 19 5c0 10-5 13-10 13-2.2 0-3.4-.6-4-1Z" />
    <path d="M9 15c1.5-3 3.8-5 6.5-6" />
  </svg>
);

export const IconFlame = ({ className, size = 22 }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M12 3c2.5 3 1 5 3 7 1.6 1.6 2 3 2 4a5 5 0 0 1-10 0c0-2 1-3.5 2.5-5C11.5 7.2 11 5 12 3Z" />
  </svg>
);
