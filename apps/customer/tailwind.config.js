/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  prefix: 'tw-',
  darkMode: 'media', // or 'class'
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#1A3F22',
          secondary: '#58761B',
          gold: '#D99201',
          'primary-dark': '#0C120E',
        },
        // We can also bridge Ionic variables if needed
        'ion-primary': 'var(--ion-color-primary)',
        'ion-secondary': 'var(--ion-color-secondary)',
        'ion-tertiary': 'var(--ion-color-tertiary)',
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
