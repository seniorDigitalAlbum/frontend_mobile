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
      fontSize: {
        // 기본 폰트 크기
        'xs': '12px',
        'sm': '14px',
        'base': '16px',
        'lg': '18px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '30px',
        '4xl': '36px',
        '5xl': '48px',
        '6xl': '60px',
        // 큰 글씨 모드용 폰트 크기 (1.3배)
        'xs-large': '15.6px',    // 12 * 1.3
        'sm-large': '18.2px',    // 14 * 1.3
        'base-large': '20.8px',  // 16 * 1.3
        'lg-large': '23.4px',    // 18 * 1.3
        'xl-large': '26px',      // 20 * 1.3
        '2xl-large': '31.2px',   // 24 * 1.3
        '3xl-large': '39px',     // 30 * 1.3
        '4xl-large': '46.8px',   // 36 * 1.3
        '5xl-large': '62.4px',   // 48 * 1.3
        '6xl-large': '78px',     // 60 * 1.3
      },
      spacing: {
        // 큰 글씨 모드용 여백 (1.2배)
        '1-large': '4.8px',      // 4 * 1.2
        '2-large': '9.6px',      // 8 * 1.2
        '3-large': '14.4px',     // 12 * 1.2
        '4-large': '19.2px',     // 16 * 1.2
        '5-large': '24px',       // 20 * 1.2
        '6-large': '28.8px',     // 24 * 1.2
        '8-large': '38.4px',     // 32 * 1.2
        '10-large': '48px',      // 40 * 1.2
        '12-large': '57.6px',    // 48 * 1.2
        '16-large': '76.8px',    // 64 * 1.2
        '20-large': '96px',      // 80 * 1.2
        '24-large': '115.2px',   // 96 * 1.2
      },
    },
  },
  plugins: [],
}
