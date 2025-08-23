/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './screens/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        gray1: 'rgba(184, 184, 184, 1)',
        secondary: 'rgba(184, 184, 184, 1)',
        accent: '#fbbf24',
        kakao: '#FEE500',  
      },
    },
  },
  plugins: [],
}
