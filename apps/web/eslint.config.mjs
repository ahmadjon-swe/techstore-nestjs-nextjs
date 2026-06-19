import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // API responses are untyped; relax until proper types are added
      "@typescript-eslint/no-explicit-any": "warn",
      // Apostrophes in UI copy don't need HTML escaping in JSX
      "react/no-unescaped-entities": "off",
      // Patterns like setMounted(true) and syncing URL → state are intentional
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
