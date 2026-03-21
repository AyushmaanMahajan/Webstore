/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        midnight: '#0E0A14',
        navy: {
          DEFAULT: '#130D1C',
          mid: '#1A1126',
          light: '#221630',
        },
        violet: {
          DEFAULT: '#9B6FD4',
          bright: '#B48FE8',
        },
        rose: {
          brand: '#C47FA8',
          gold: '#E8B4CF',
        },
        silver: '#D4C8E8',
        glass: 'rgba(200,170,255,0.05)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-display)', 'Georgia', 'serif'],
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(200,170,255,0.07)',
        glow: '0 0 40px rgba(155, 111, 212, 0.35)',
        'glow-rose': '0 0 40px rgba(196, 127, 168, 0.25)',
      },
    },
  },
  plugins: [],
};
