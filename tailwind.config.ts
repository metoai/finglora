import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./constants/**/*.{js,ts,jsx,tsx,mdx}",
    "./utils/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        berry: {
          DEFAULT: '#E0246A',
          dark: '#BE185D',
          soft: '#FDF2F8',
        },
        cream: {
          DEFAULT: '#fff8f8',
          canvas: '#fcf6f4',
        },
        atelier: {
          bg: '#FAFAFA',
          card: '#FFFFFF',
          raised: '#F4F4F5',
          border: 'rgba(0, 0, 0, 0.08)',
          dark: '#18181B',
          muted: '#71717A',
          secondary: '#52525B',
          pink: '#E0246A',
          'pink-hover': '#BE185D',
          'pink-light': '#FDF2F8',
          'pink-border': '#FCE7F3',
          'pink-muted': '#DB2777',
          bordeaux: '#E0246A',
          'bordeaux-dark': '#BE185D',
          gold: '#E0246A',
          'gold-light': '#FDF2F8',
        },
        lacquer: {
          pink: '#E0246A',
          'pink-dark': '#BE185D',
          'pink-light': '#FDF2F8',
          bordeaux: '#E0246A',
          'bordeaux-dark': '#BE185D',
          gold: '#E0246A',
          'gold-light': '#FDF2F8',
          cream: '#FFFFFF',
          espresso: '#18181B',
        },
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Playfair Display', 'Didot', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'Geist', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '0.875rem' }],
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.625rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '1.15' }],
        '3xl': ['1.875rem', { lineHeight: '1.12' }],
        '4xl': ['2.25rem', { lineHeight: '1.1' }],
        '5xl': ['3rem', { lineHeight: '1.05' }],
      },
      borderWidth: {
        hairline: '0.5px',
        DEFAULT: '1px',
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(31, 26, 28, 0.04), 0 1px 2px rgba(31, 26, 28, 0.02)',
        'card': '0 4px 20px -2px rgba(31, 26, 28, 0.05)',
        'elevated': '0 12px 32px -4px rgba(31, 26, 28, 0.08)',
        'lacquer': '0 8px 24px -4px rgba(128, 26, 53, 0.18)',
      },
      animation: {
        "shimmer-slide": "shimmer-slide var(--speed) ease-in-out infinite alternate",
        "spin-around": "spin-around calc(var(--speed) * 2) infinite linear",
        marquee: "marquee var(--duration) linear infinite",
        "marquee-vertical": "marquee-vertical var(--duration) linear infinite",
        "border-beam": "border-beam calc(var(--duration)*1s) infinite linear",
        shine: "shine var(--duration) infinite linear",
        gradient: "gradient 8s linear infinite",
        "float-gentle": "float 4s ease-in-out infinite",
        "pulse-subtle": "pulseSubtle 3s ease-in-out infinite",
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.72' },
        },
        "shimmer-slide": {
          to: {
            transform: "translate(calc(100cqw - 100%), 0)",
          },
        },
        "spin-around": {
          "0%": {
            transform: "translateZ(0) rotate(0)",
          },
          "15%, 35%": {
            transform: "translateZ(0) rotate(90deg)",
          },
          "65%, 85%": {
            transform: "translateZ(0) rotate(270deg)",
          },
          "100%": {
            transform: "translateZ(0) rotate(360deg)",
          },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(calc(-100% - var(--gap)))" },
        },
        "marquee-vertical": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(calc(-100% - var(--gap)))" },
        },
        "border-beam": {
          "100%": {
            "offset-distance": "100%",
          },
        },
        shine: {
          "0%": {
            "background-position": "0% 0%",
          },
          "50%": {
            "background-position": "100% 100%",
          },
          to: {
            "background-position": "0% 0%",
          },
        },
        gradient: {
          to: {
            backgroundPosition: "var(--bg-size) 0",
          },
        },
      },
    },
  },
  plugins: [],
};
export default config;
