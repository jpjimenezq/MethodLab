import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    // Clases para los campos de entrada con colores por método
    'border-blue-300', 'bg-blue-50', 'focus:border-blue-500', 'focus:ring-blue-200',
    'border-green-300', 'bg-green-50', 'focus:border-green-500', 'focus:ring-green-200',
    'border-purple-300', 'bg-purple-50', 'focus:border-purple-500', 'focus:ring-purple-200',
    'border-orange-300', 'bg-orange-50', 'focus:border-orange-500', 'focus:ring-orange-200',
    'border-pink-300', 'bg-pink-50', 'focus:border-pink-500', 'focus:ring-pink-200',
    'border-teal-300', 'bg-teal-50', 'focus:border-teal-500', 'focus:ring-teal-200',
    'border-gray-300', 'bg-gray-50', 'focus:border-gray-500', 'focus:ring-gray-200',
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
}
export default config
