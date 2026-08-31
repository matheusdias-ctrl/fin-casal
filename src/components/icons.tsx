type IconProps = { className?: string };

function Icon({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function IconHome({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
    </Icon>
  );
}

export function IconUpload({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M12 15V4" />
      <path d="M7 8l5-5 5 5" />
      <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
    </Icon>
  );
}

export function IconUsers({ className }: IconProps) {
  return (
    <Icon className={className}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20a6 6 0 0 1 12 0" />
      <circle cx="17.5" cy="9" r="2.3" />
      <path d="M15.5 13.8a5 5 0 0 1 5.5 5" />
    </Icon>
  );
}

export function IconTag({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M11 3H4a1 1 0 0 0-1 1v7a1 1 0 0 0 .3.7l9 9a1 1 0 0 0 1.4 0l7-7a1 1 0 0 0 0-1.4l-9-9A1 1 0 0 0 11 3Z" />
      <circle cx="7.5" cy="7.5" r="0.6" fill="currentColor" />
    </Icon>
  );
}

export function IconChart({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M4 19V10" />
      <path d="M10 19V4" />
      <path d="M16 19v-7" />
      <path d="M21 19H3" />
    </Icon>
  );
}

export function IconSettings({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M4 6h10" />
      <circle cx="16" cy="6" r="2" />
      <path d="M4 12h4" />
      <circle cx="10" cy="12" r="2" />
      <path d="M4 18h10" />
      <circle cx="16" cy="18" r="2" />
    </Icon>
  );
}

export function IconMenu({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </Icon>
  );
}

export function IconClose({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </Icon>
  );
}
