/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    { pattern: /bg-(slate|blue|teal|cyan|amber|orange|sky|indigo|violet|red|rose|pink|green|yellow|lime|fuchsia|purple|emerald|gray|crimson|magenta)-(400|500|600|700|800|900)/ },
    { pattern: /border-(slate|blue|teal|cyan|amber|orange|sky|indigo|violet|red|rose|pink|green|yellow|lime|fuchsia|purple|emerald|gray)-(400|500|600|700|800|900)/ },
    { pattern: /text-(slate|blue|teal|cyan|amber|orange|sky|indigo|violet|red|rose|pink|green|yellow|lime|fuchsia|purple|emerald|gray)-(200|300|400|500|600|700|800|900)/ },
  ]
}
