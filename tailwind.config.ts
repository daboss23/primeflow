import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#06060d',
          sidebar: '#08080f',
          surface: 'rgba(255,255,255,0.022)',
          elevated: 'rgba(255,255,255,0.045)',
          input: 'rgba(255,255,255,0.03)',
          border: 'rgba(255,255,255,0.06)',
        },
        line: {
          subtle: 'rgba(255,255,255,0.06)',
          DEFAULT: 'rgba(255,255,255,0.08)',
          strong: 'rgba(255,255,255,0.12)',
        },
        ink: {
          primary: 'rgba(255,255,255,0.95)',
          secondary: 'rgba(255,255,255,0.62)',
          tertiary: 'rgba(255,255,255,0.45)',
          muted: 'rgba(255,255,255,0.32)',
          faint: 'rgba(255,255,255,0.22)',
        },
        accent: {
          DEFAULT: '#00d4ff',
          soft: 'rgba(0,212,255,0.10)',
          border: 'rgba(0,212,255,0.22)',
          glow: 'rgba(0,212,255,0.35)',
          blue: '#00d4ff',
          violet: '#a78bfa',
          red: '#ff4d6a',
          yellow: '#ffaa00',
          green: '#3ddc97',
        },
        violet: {
          DEFAULT: '#a78bfa',
          soft: 'rgba(167,139,250,0.10)',
          border: 'rgba(167,139,250,0.22)',
        },
        status: {
          success: '#3ddc97',
          warn: '#ffaa00',
          danger: '#ff4d6a',
        },
        text: {
          primary: 'rgba(255,255,255,0.95)',
          secondary: 'rgba(255,255,255,0.62)',
          muted: 'rgba(255,255,255,0.32)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '10px',
        md: '10px',
        lg: '14px',
        xl: '18px',
        '2xl': '18px',
      },
      boxShadow: {
        'card':        '0 1px 0 rgba(255,255,255,0.04) inset, 0 12px 32px -16px rgba(0,0,0,0.6)',
        'card-hover':  '0 1px 0 rgba(255,255,255,0.06) inset, 0 16px 40px -16px rgba(0,0,0,0.7)',
        'glow-accent': '0 0 0 1px rgba(0,212,255,0.22), 0 0 24px -4px rgba(0,212,255,0.30)',
        'focus':       '0 0 0 3px rgba(0,212,255,0.10)',
      },
    },
  },
  plugins: [],
}

export default config
