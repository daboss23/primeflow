import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#050510',
          surface: '#0d0d1f',
          elevated: '#13132a',
          border: 'rgba(255,255,255,0.06)',
        },
        accent: {
          blue: '#00d4ff',
          violet: '#a78bfa',
          red: '#ff4060',
          yellow: '#ffaa00',
          green: '#00e676',
        },
        text: {
          primary: '#e8e8f4',
          secondary: 'rgba(232,232,244,0.55)',
          muted: 'rgba(232,232,244,0.28)',
        },
      },
      fontFamily: {
        display: ['var(--font-cinzel)', 'Georgia', 'serif'],
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '8px',
        lg: '12px',
        xl: '16px',
      },
    },
  },
  plugins: [],
}

export default config
