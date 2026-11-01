import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    path.resolve(__dirname, './index.html'),
    path.resolve(__dirname, './src/**/*.{js,ts,jsx,tsx}'),
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#050B10',
        surface: '#10171D',
        card: '#151E25',
        'card-hover': '#1B252E',
        border: '#2B363F',
        'border-light': '#384652',
        primary: {
          DEFAULT: '#FF8A00',
          hover: '#FF9E26',
          dark: '#E07800',
          light: '#FFAC42',
          muted: 'rgba(255, 138, 0, 0.15)',
        },
        text: {
          primary: '#F5F7FA',
          secondary: '#A6B0B9',
          muted: '#6C7A87',
        },
        status: {
          success: '#10B981',
          'success-bg': 'rgba(16, 185, 129, 0.12)',
          warning: '#F59E0B',
          'warning-bg': 'rgba(245, 158, 11, 0.12)',
          danger: '#EF4444',
          'danger-bg': 'rgba(239, 68, 68, 0.12)',
          info: '#3B82F6',
          'info-bg': 'rgba(59, 130, 246, 0.12)',
          emergency: '#DC2626',
          'emergency-bg': 'rgba(220, 38, 38, 0.2)',
        }
      },
      borderRadius: {
        'card': '14px',
        'panel': '16px',
        'pill': '9999px',
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.45)',
        'elevated': '0 10px 30px -5px rgba(0, 0, 0, 0.65)',
        'orange-glow': '0 0 20px -3px rgba(255, 138, 0, 0.35)',
        'orange-glow-lg': '0 0 35px -5px rgba(255, 138, 0, 0.5)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
