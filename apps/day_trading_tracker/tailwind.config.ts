import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#0b0e14',
          light: '#12161f',
        },
        card: {
          DEFAULT: '#12161f',
          light: '#1a202c',
        },
        primary: {
          DEFAULT: '#22d3ee',
          dark: '#0e7490',
          light: '#67e8f9',
        },
        success: '#22c55e',
        danger: '#ef4444',
        muted: '#94a3b8',
        border: '#1f2937',
      },
    },
  },
  plugins: [],
}
export default config
