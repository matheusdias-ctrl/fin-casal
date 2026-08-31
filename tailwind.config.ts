import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Mesmo azul validado (contraste + daltonismo) usado na série "Receita"
        // dos gráficos — reaproveitado como cor de marca para manter coerência
        // entre a UI e os gráficos.
        brand: {
          light: "#e8f1fc",
          DEFAULT: "#2a78d6",
          dark: "#184f95",
        },
      },
    },
  },
  plugins: [],
};

export default config;
