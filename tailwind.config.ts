import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        /* Identidade visual PDV / Vamos (Cobrança Avaria) */
        primary: {
          50: '#fdf2f4',
          100: '#fce7ea',
          200: '#f9d0d7',
          300: '#f4a9b5',
          400: '#ec7a8e',
          500: '#e04d6a',
          600: '#c41e3a',
          700: '#a01830',
          800: '#86162a',
          900: '#731628',
        },
      },
    },
  },
  plugins: [],
};

export default config;
