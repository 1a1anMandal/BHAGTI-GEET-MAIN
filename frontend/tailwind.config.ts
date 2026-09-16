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
        bg: '#0A0A0A',
        surface: '#151515',
        surface2: '#1E1E1E',
        primary: '#FF7A00',
        'primary-dark': '#E06A00',
        'primary-light': '#FFA34D',
        muted: '#888888',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'primary-gradient': 'linear-gradient(to right, #FF7A00, #FFA34D)',
        'surface-gradient': 'linear-gradient(180deg, #1A1A1A 0%, #0A0A0A 100%)',
      }
    },
  },
  plugins: [],
}
export default config
