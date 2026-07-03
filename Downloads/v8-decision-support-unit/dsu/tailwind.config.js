/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#dbe6fe',
          200: '#bcd0fd',
          300: '#8db0fb',
          400: '#5687f7',
          500: '#3163f0',
          600: '#2145e4',
          700: '#1c37c9',
          800: '#1c30a2',
          900: '#1c2f80',
          950: '#141d4d'
        },
        surface: {
          light: '#f6f7fb',
          dark: '#0b1220'
        },
        panel: {
          light: '#ffffff',
          dark: '#111a2e'
        },
        ink: {
          light: '#101827',
          dark: '#e6eaf5'
        },
        muted: {
          light: '#5b6577',
          dark: '#8b95ac'
        },
        border: {
          light: '#e4e7ee',
          dark: '#1f2a44'
        },
        status: {
          critical: '#dc2626',
          warning: '#d97706',
          normal: '#16a34a',
          info: '#2563eb',
          neutral: '#64748b'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace']
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(16, 24, 39, 0.04), 0 1px 3px 0 rgba(16, 24, 39, 0.06)',
        popover: '0 8px 24px -4px rgba(16, 24, 39, 0.18)'
      },
      borderRadius: {
        xl: '0.875rem'
      }
    }
  },
  plugins: []
};
