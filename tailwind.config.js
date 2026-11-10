export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "var(--bg-canvas)",
        felt: {
          DEFAULT: "var(--table-felt)",
          highlight: "var(--table-felt-highlight)",
          deep: "var(--table-felt-deep)",
        },
        gold: {
          DEFAULT: "var(--accent-gold)",
          glow: "var(--accent-gold-glow)",
        },
        cyan: {
          DEFAULT: "var(--accent-cyan)",
        },
        card: {
          face: "var(--card-bg)",
          back: "var(--card-back)",
        },
        danger: "var(--danger-red)",
      },
      fontFamily: {
        display: ["'Plus Jakarta Sans'", "sans-serif"],
        sans: ["'Inter'", "sans-serif"],
      },
      boxShadow: {
        table: "inset 0 0 120px rgba(0, 0, 0, 0.85), 0 25px 60px rgba(0, 0, 0, 0.9)",
        card: "0 8px 20px -4px rgba(0, 0, 0, 0.6), 0 2px 6px -1px rgba(0, 0, 0, 0.4)",
        "card-hover": "0 20px 32px -8px rgba(0, 0, 0, 0.75), 0 0 18px rgba(245, 158, 11, 0.35)",
        "gold-halo": "0 0 28px rgba(245, 158, 11, 0.45), inset 0 0 12px rgba(245, 158, 11, 0.25)",
      },
    },
  },
  plugins: [],
};

