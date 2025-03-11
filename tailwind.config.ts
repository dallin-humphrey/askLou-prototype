// tailwind.config.js
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        louPrimary: "#00AAFF",
        louGray1: "#333333",
        louGray2: "#505050",
        louBlack: "#101010",
        louYellow: "#E0C01F",
        louRed: "#DD1616",
      },
      borderRadius: {
        default: "5px",
      },
      fontSize: {
        "2xs": ".65rem",
      },
      fontFamily: {
        sans: ["Montserrat", "sans-serif"],
      },
// tailwind.config.js - add this to your backgroundImage section
backgroundImage: {
  "primary-gradient":
    "linear-gradient(to right, rgba(1, 170, 255, 0.4), rgba(0.2, 170, 255, 0))",
  "red-gradient":
    "radial-gradient(87.69% 87.69% at 12.31% 50%, #FEB4B4 0%, rgba(254, 180, 180, 0.00) 100%)",
  "noise-texture": "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.65\" numOctaves=\"3\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%\" height=\"100%\" filter=\"url(%23noiseFilter)\" opacity=\"0.15\"/%3E%3C/svg%3E')",
 // Add this to your backgroundImage section in tailwind.config.js
"wood-grain-simple": "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"400\" height=\"400\"%3E%3Crect width=\"400\" height=\"400\" fill=\"%23331a00\"/%3E%3Cfilter id=\"noise\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.01\" numOctaves=\"3\" seed=\"5\"/%3E%3C/filter%3E%3Crect width=\"400\" height=\"400\" filter=\"url(%23noise)\" opacity=\"0.3\" fill=\"%23553300\"/%3E%3C/svg%3E')",

},
      borderColor: {
        "custom-red": "#DD1616",
      },
    },
  },
  plugins: [],
};