import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF6B00',
        bg: '#0A0A0A',
        surface: '#141414',
        surface2: '#1E1E1E',
        text: '#F5F5F5',
        muted: '#555555',
        completed: '#3A3A3A',
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(145deg, rgba(255,107,0,0.05) 0%, rgba(255,255,255,0.02) 100%)',
      }
    },
  },
  plugins: [],
}
export default config
