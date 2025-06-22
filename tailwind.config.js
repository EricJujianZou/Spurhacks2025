/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      fontFamily: {
        'manrope': ['Manrope', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      colors: {
        'page-bg': '#F9F9F9',
        'surface': '#FFFFFF',
        'text-primary': '#0D0D0D',
        'text-secondary': '#5F5F5F',
        'accent': '#000000',
        'tab-inactive-bg': '#F1F1F1',
        'tab-inactive-text': '#4A4A4A',
        'border-subtle': '#E5E5E5',
        'success': '#27ca3f',
        'warning': '#ffbd2e',
        'error': '#ff5f56',
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '40px',
        'xxl': '64px',
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'pill': '18px',
      },
      boxShadow: {
        'small': '0 1px 3px rgba(0,0,0,0.08)',
        'medium': '0 4px 12px rgba(0,0,0,0.06)',
      },
      fontSize: {
        'h1': ['48px', { lineHeight: '56px', letterSpacing: '-0.5px' }],
        'h2': ['18px', { lineHeight: '28px' }],
        'button': ['14px', { letterSpacing: '0.25px' }],
      },
      maxWidth: {
        'layout': '920px',
        'video': '640px',
      },
      height: {
        'video': '360px',
      },
      width: {
        'video': '640px',
      },
    },
  },
  plugins: [],
} 