export const THEMES = [
  { id: "light", label: "Light", scheme: "light", bg: "#f2f1ec", fg: "#0b0b0b", muted: "#66655f", accent: "#e8480c", border: "#d6d4cc" },
  { id: "cream", label: "Cream", scheme: "light", bg: "#f7efd8", fg: "#242019", muted: "#6a624f", accent: "#1f5fae", border: "#e0d5b8" },
  { id: "sand", label: "Sand", scheme: "light", bg: "#e4d5bb", fg: "#2b2117", muted: "#65563f", accent: "#a8481a", border: "#cdbb9b" },
  { id: "mint", label: "Mint", scheme: "light", bg: "#cde9da", fg: "#0f2a1f", muted: "#3f6153", accent: "#0b7a52", border: "#aed2bf" },
  { id: "lilac", label: "Lilac", scheme: "light", bg: "#dcd5f2", fg: "#1b1533", muted: "#574e74", accent: "#5a3ccf", border: "#c2b8e6" },
  { id: "clay", label: "Clay", scheme: "dark", bg: "#9e3f22", fg: "#fff1e6", muted: "#f6d6c5", accent: "#ffd29e", border: "#b85a3b" },
  { id: "cobalt", label: "Cobalt", scheme: "dark", bg: "#1d33c9", fg: "#ffffff", muted: "#c9d1ff", accent: "#ffd84d", border: "#3a4fd8" },
  { id: "forest", label: "Forest", scheme: "dark", bg: "#10241a", fg: "#e5efe8", muted: "#93aa9c", accent: "#7ed79d", border: "#1f3a2b" },
  { id: "midnight", label: "Midnight", scheme: "dark", bg: "#0b1328", fg: "#e6ecf8", muted: "#8e9bb5", accent: "#6fa8ff", border: "#1c2742" },
  { id: "dark", label: "Dark", scheme: "dark", bg: "#000000", fg: "#ffffff", muted: "#8a8a8a", accent: "#ff5a1f", border: "#262626" },
  { id: "high-contrast", label: "High contrast", scheme: "dark", bg: "#000000", fg: "#ffffff", muted: "#8a8a8a", accent: "#ffd600", border: "#ffffff" },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

export const THEME_IDS = THEMES.map((t) => t.id);

export const themeCSS = THEMES.map((t, i) => {
  const selector = i === 0 ? `:root,[data-theme="${t.id}"]` : `[data-theme="${t.id}"]`;
  return `${selector}{--bg:${t.bg};--fg:${t.fg};--muted:${t.muted};--accent:${t.accent};--border:${t.border};color-scheme:${t.scheme}}`;
}).join("");