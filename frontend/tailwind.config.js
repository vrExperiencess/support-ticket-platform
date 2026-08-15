/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#FFF8EC",
          100: "#FFEDCC",
          200: "#FFD699",
          300: "#FFBF66",
          400: "#FFA726",
          500: "#FF9800",
          600: "#E88600",
          700: "#B96800",
          800: "#8A4D00",
          900: "#633700",
        },

        navy: {
          50: "#EEF5FA",
          100: "#DCEAF4",
          200: "#B8D4E8",
          300: "#88B8D6",
          400: "#5196BD",
          500: "#327CA7",
          600: "#246389",
          700: "#194E70",
          800: "#103A59",
          900: "#0A2943",
          950: "#061522",
        },

        corporate: {
          blue: "#0B3156",
          blueLight: "#1476AE",
          cyan: "#2395D0",

          orange: "#FF9800",

          background: "#F5F7FA",
          surface: "#FFFFFF",
          border: "#E4E9EF",

          text: "#102A43",
          muted: "#718096",
        },
      },

      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },

      boxShadow: {
        card:
          "0 8px 30px rgba(15, 42, 67, 0.06)",
        panel:
          "0 15px 50px rgba(5, 25, 45, 0.12)",
        floating:
          "0 18px 45px rgba(6, 21, 34, 0.16)",
        orange:
          "0 10px 28px rgba(255, 152, 0, 0.22)",
      },

      borderRadius: {
        app: "14px",
        panel: "18px",
      },

      backgroundImage: {
        "auth-gradient":
          "linear-gradient(145deg, #061522 0%, #0A2943 48%, #0B3156 100%)",

        "brand-glow":
          "radial-gradient(circle at center, rgba(255,152,0,.18), transparent 65%)",
      },
    },
  },
};