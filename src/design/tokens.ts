export const colors = {
  bg: {
    app: "#EDE8DC",
    card: "#FFFFFF",
    input: "#F5F2EB",
    mapCard: "#ECEAE4",
  },
  brand: {
    lime: "#AECB2A",
    limeDark: "#92A822",
    limeLight: "#E4EDD0",
    forest: "#243318",
    forestText: "#FFFFFF",
  },
  text: {
    primary: "#1A1A1A",
    secondary: "#6B7280",
    muted: "#9CA3AF",
    onLime: "#1A1A1A",
    onDark: "#FFFFFF",
  },
  state: {
    notifDot: "#EF4444",
    starActive: "#F59E0B", // cm-amber
  },
} as const;

export const typography = {
  fontFamily: {
    display: "'Inter', 'SF Pro Display', system-ui, sans-serif",
    body: "'Inter', 'SF Pro Text', system-ui, sans-serif",
  },
  scale: {
    xs: "0.688rem",
    sm: "0.813rem",
    base: "0.938rem",
    md: "1.063rem",
    lg: "1.25rem",
    xl: "1.5rem",
    "2xl": "1.75rem",
    "3xl": "2rem",
    price: "1.75rem",
  },
  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 800,
  },
  leading: {
    tight: 1.1,
    normal: 1.4,
    relaxed: 1.6,
  },
} as const;

export const radii = {
  xs: "8px",
  sm: "12px",
  md: "16px",
  lg: "20px",
  xl: "24px",
  "2xl": "28px",
  full: "9999px",
  circle: "50%",
} as const;

export const spacing = {
  "1": "4px",
  "2": "8px",
  "3": "12px",
  "4": "16px",
  "5": "20px",
  "6": "24px",
  "8": "32px",
  "10": "40px",
} as const;

export const shadows = {
  card: "0 2px 12px rgba(0,0,0,0.06)",
  cardHov: "0 4px 20px rgba(0,0,0,0.10)",
  button: "0 4px 16px rgba(174,203,42,0.35)",
  mapBtn: "0 2px 8px rgba(0,0,0,0.18)",
} as const;
