/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './entrypoints/**/*.{js,ts,jsx,tsx}',
    './entrypoints/sidepanel/**/*.{js,ts,jsx,tsx}',
    './entrypoints/sidepanel/*.{js,ts,jsx,tsx}',
    './entrypoints/sidepanel/components/**/*.{js,ts,jsx,tsx}',
    './entrypoints/sidepanel/hooks/**/*.{js,ts,jsx,tsx}',
    './entrypoints/sidepanel/services/**/*.{js,ts,jsx,tsx}',
    './entrypoints/sidepanel/actions/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}