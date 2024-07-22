/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/flowbite/**/*.js",
  ],
  darkMode: "selector",
  important: true,
  theme: {
    fontFamily: {
      exo: ["Exo", "sans-serif"],
      mono: ["Roboto Mono", "monospace"],
    },
  },
  plugins: [
    require("flowbite/plugin"),
    function ({ addUtilities, theme, e }) {
      const colors = theme("colors");
      const baseColorUtilities = {};
      const highlightColorUtilities = {};

      Object.keys(colors).forEach((color) => {
        const colorValue = colors[color];

        if (typeof colorValue === "string") {
          baseColorUtilities[`.base-${e(color)}`] = {
            "--base-color": colorValue,
          };
          highlightColorUtilities[`.highlight-${e(color)}`] = {
            "--highlight-color": colorValue,
          };
        } else {
          Object.keys(colorValue).forEach((shade) => {
            baseColorUtilities[`.base-${e(color)}-${e(shade)}`] = {
              "--base-color": colorValue[shade],
            };
            highlightColorUtilities[`.highlight-${e(color)}-${e(shade)}`] = {
              "--highlight-color": colorValue[shade],
            };
          });
        }
      });

      addUtilities(highlightColorUtilities, ["responsive", "hover"]);
      addUtilities(baseColorUtilities, ["responsive", "hover"]);
    },
  ],
};
