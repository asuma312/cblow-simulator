/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                bronze: {
                    primary: '#8B5E3C',
                    secondary: '#C8860A',
                    dark: '#3B1F0F',
                    darker: '#1a0d06',
                    light: '#F5F0E8',
                    card: '#2a1508',
                    border: '#8B5E3C',
                    gold: '#C8A84E',
                },
            },
            fontFamily: {
                sans: ['Arial Narrow', 'Arial', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
