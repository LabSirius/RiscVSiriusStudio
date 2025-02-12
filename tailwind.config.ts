import type { Config } from 'tailwindcss'

export default {
  content: ["./src/**/*.{html,ts,js}"],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui'),],
  daisyui: {
    themes: ["light", "dark"],
  },
} satisfies Config

