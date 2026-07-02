/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Base surfaces
        surface: {
          DEFAULT: 'rgb(var(--surface) / <alpha-value>)',
          subtle: 'rgb(var(--surface-subtle) / <alpha-value>)',
          raised: 'rgb(var(--surface-raised) / <alpha-value>)',
          overlay: 'rgb(var(--surface-overlay) / <alpha-value>)',
        },
        border: {
          DEFAULT: 'rgb(var(--border) / <alpha-value>)',
          subtle: 'rgb(var(--border-subtle) / <alpha-value>)',
        },
        ink: {
          DEFAULT: 'rgb(var(--ink) / <alpha-value>)',
          muted: 'rgb(var(--ink-muted) / <alpha-value>)',
          faint: 'rgb(var(--ink-faint) / <alpha-value>)',
        },
        // Brand accents — energy/utility domain
        amber: {
          50: '#FFF8EC',
          100: '#FFEDC9',
          200: '#FFD98D',
          300: '#FFC04D',
          400: '#FBA823',
          500: '#F0A227',
          600: '#D6840F',
          700: '#B0650B',
          800: '#8A4D0E',
          900: '#6E3F10',
        },
        teal: {
          50: '#ECFEFC',
          100: '#CFFBF6',
          200: '#A0F4EC',
          300: '#62E5DC',
          400: '#22D3C4',
          500: '#0FB8AB',
          600: '#0A938A',
          700: '#0C7570',
          800: '#0E5C5A',
          900: '#0F4B4A',
        },
        // Status
        success: {
          50: '#EFFDF5',
          500: '#16B566',
          600: '#0E9655',
          700: '#0A7A45',
        },
        danger: {
          50: '#FEF2F2',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
        },
        warning: {
          50: '#FFFBEB',
          500: '#F59E0B',
          600: '#D97706',
        },
        info: {
          50: '#EFF6FF',
          500: '#3B82F6',
          600: '#2563EB',
        },
      },
      fontFamily: {
        sans: ['"Lexend"', '"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        soft: '0 1px 2px 0 rgb(15 23 42 / 0.04), 0 2px 8px -2px rgb(15 23 42 / 0.06)',
        card: '0 1px 3px 0 rgb(15 23 42 / 0.06), 0 4px 16px -4px rgb(15 23 42 / 0.08)',
        raised: '0 4px 12px -2px rgb(15 23 42 / 0.10), 0 12px 32px -8px rgb(15 23 42 / 0.10)',
        glow: '0 0 0 1px rgb(240 162 39 / 0.15), 0 0 24px -4px rgb(240 162 39 / 0.35)',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.55, transform: 'scale(0.85)' },
        },
        slideUp: {
          '0%': { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-700px 0' },
          '100%': { backgroundPosition: '700px 0' },
        },
      },
      animation: {
        pulseGlow: 'pulseGlow 1.8s ease-in-out infinite',
        slideUp: 'slideUp 0.25s ease-out',
        shimmer: 'shimmer 1.6s linear infinite',
      },
      transitionTimingFunction: {
        snappy: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
    },
  },
  plugins: [],
};
