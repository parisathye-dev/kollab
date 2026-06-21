import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#7C3AED",
          light: "#A78BFA",
          tint: "#EDE9FE",
          dark: "#4C1D95",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "#F97316",
          light: "#FDBA74",
          tint: "#FFF3E8",
          foreground: "var(--secondary-foreground)",
        },
        accent: {
          DEFAULT: "#0D9488",
          light: "#5EEAD4",
          tint: "#E6FAF8",
          foreground: "var(--accent-foreground)",
        },
        surface: "#F8F6FF",
        success: "#16A34A",
        warning: "#D97706",
        danger: "#DC2626",
        destructive: {
          DEFAULT: "#DC2626",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
};

export default config;
