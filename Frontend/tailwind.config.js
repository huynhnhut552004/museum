/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily:{
        'cabin': ['"Cabin"', 'sans-serif'],
        'josefin': ['"Josefin Sans"', 'sans-serif'],
        'playfair': ['"Playfair Display"', 'serif'],
        'oswald': ['"Oswald"', 'sans-serif'],
        'inter': ['"Inter"', 'san-serif'],
        Vietnam: ['"Be Vietnam Pro"', 'san-serif']
      },
       animation: {
        'spin-slow': 'spin 15s linear infinite',        
        'spin-slower': 'spin 25s linear infinite',     
        'spin-reverse': 'spin-reverse 20s linear infinite', 
      },
      keyframes: {
        'spin-reverse': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(-360deg)' },
        }
      },
      cursor:{
        'arrow-right-white': 'url("/User/icon/ArrowRightWhite.png") 16 16, pointer',
        'arrow-right-black': 'url("/User/icon/ArrowRightBlack.png") 16 16, pointer',
        'next-white': 'url("User/icon/Next.png") 16 16, pointer',
        'prev-white': 'url("User/icon/Prev.png") 16 16, pointer'
      },
    },
  },
  plugins: [],
}