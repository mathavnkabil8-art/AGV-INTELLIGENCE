/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        command: {
          bg: "var(--bg-app)",
          surface: "var(--bg-surface)",
          card: "var(--bg-card)",
          panel: "var(--bg-card-secondary)",
          border: "var(--border-main)",
          borderLight: "var(--border-light)",
          muted: "var(--text-muted)",
          text: "var(--text-primary)",
          secondary: "var(--text-secondary)",
        },
        industrial: {
          bg: "#F4F7FB",
          surface: "#FFFFFF",
          surfaceSec: "#F8FAFC",
          border: "#E2E8F0",
          text: "#172033",
          secondary: "#64748B",
          muted: "#94A3B8",
          blue: "#2563EB",
          electric: "#0EA5E9",
          teal: "#0D9488",
          success: "#16A34A",
          warning: "#D97706",
          danger: "#DC2626",
          softBlue: "#EFF6FF",
          softTeal: "#F0FDFA",
        },
        cyan: {
          glow: "#00F0FF",
          subtle: "#0891B2",
          dim: "rgba(6, 182, 212, 0.12)",
        },
        electric: {
          blue: "#0EA5E9",
          indigo: "#6366F1",
        },
        status: {
          idle: "#16A34A",
          moving: "#2563EB",
          charging: "#0D9488",
          waiting: "#D97706",
          deadlocked: "#DC2626",
          lowBattery: "#EA580C",
        },
        warehouse: {
          bg: "var(--warehouse-bg)",
          panel: "var(--bg-surface)",
          border: "var(--border-main)",
          grid: "var(--warehouse-grid)",
          obstacle: "var(--warehouse-obstacle)",
          pickup: "#0D9488",
          dropoff: "#2563EB",
          charger: "#0D9488",
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      boxShadow: {
        'card-light': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 10px 20px -5px rgba(37, 99, 235, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)',
        'card-dark': '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
        'glow-blue': '0 0 20px -5px rgba(37, 99, 235, 0.35)',
        'glow-cyan': '0 0 20px -5px rgba(14, 165, 233, 0.35)',
        'glow-rose': '0 0 20px -5px rgba(220, 38, 38, 0.35)',
      }
    },
  },
  plugins: [],
}
