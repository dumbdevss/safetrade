/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: 'var(--primary-green)',
        white: '#ffffff',
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
      },
      animation: {
        'rotate-rose': 'rotateRose 4s linear infinite',
        'float': 'float 8s ease-in-out infinite',
        'pattern-move': 'patternMove 20s linear infinite',
        'pulse-orange': 'pulseOrange 3s infinite',
        'chat-pulse': 'chatPulse 2s infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'typing': 'typing 1.4s infinite',
      },
      keyframes: {
        rotateRose: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(180deg)' },
        },
        patternMove: {
          '0%': { backgroundPosition: '0 0, 0 0' },
          '100%': { backgroundPosition: '50px 50px, 25px 25px' },
        },
        pulseOrange: {
          '0%': { boxShadow: '0 0 0 0 rgba(255, 107, 53, 0.4)' },
          '70%': { boxShadow: '0 0 0 10px rgba(255, 107, 53, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(255, 107, 53, 0)' },
        },
        chatPulse: {
          '0%': { opacity: '1' },
          '50%': { opacity: '0.5' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        typing: {
          '0%, 60%, 100%': { transform: 'translateY(0)' },
          '30%': { transform: 'translateY(-8px)' },
        },
      },
      boxShadow: {
        'light': '0 4px 12px rgba(0,0,0,0.1)',
        'medium': '0 8px 24px rgba(0,0,0,0.15)',
        'heavy': '0 16px 48px rgba(0,0,0,0.2)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '20px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      clipPath: {
        'right': 'polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%)',
        'full': 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        '.clip-path-right': {
          'clip-path': 'polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%)',
        },
        '.clip-path-full': {
          'clip-path': 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
        },
        '.transition-clip': {
          'transition': 'clip-path 0.5s ease',
        },
        '.backdrop-blur-15': {
          'backdrop-filter': 'blur(15px)',
        },
      });
    }
  ],
}

module.exports = config;