import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

export default [
  { ignores: ["**/dist/**", "node_modules/**", "coverage/**", "**/*.min.js"] },
  js.configs.recommended,
  eslintConfigPrettier,
  {
    files: ["eslint.config.js", "shared/**/*.js", "web/**/*.{js,jsx}", "web/vite.config.js", "api/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node
      },
      parserOptions: {
        ecmaFeatures: { jsx: true }
      }
    },
    plugins: {
      react,
      "react-hooks": reactHooks
    },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...react.configs.flat["jsx-runtime"].rules,
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react/prop-types": "off",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrors: "none" }],
      "no-empty": ["warn", { allowEmptyCatch: true }]
    },
    settings: {
      react: {
        version: "detect"
      }
    }
  }
];
