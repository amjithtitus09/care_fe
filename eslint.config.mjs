import eslint from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import i18nextPlugin from "eslint-plugin-i18next";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import globals from "globals";


export default [
  // Base configuration
  {
    ignores: [
      "**/dist",
      "**/public",
      "**/lib",
      "**/build",
      "**/*.css",
      "**/*.csv",
      "**/Dockerfile",
    ],
  },
  eslint.configs.recommended,

  // Global settings for all JavaScript/TypeScript files
  {
    files: ["**/*.{js,jsx,ts,tsx,mjs,mts}"],
    languageOptions: {
      ecmaVersion: 12,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
  },

  // TypeScript-specific rules
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "@typescript-eslint": tseslint,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },

  // React-specific rules
  {
    files: ["**/*.{jsx,tsx}"],
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      "react/prop-types": "off",
    },
  },

  // i18next plugin rules
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      i18next: i18nextPlugin,
    },
    rules: {
      ...i18nextPlugin.configs.recommended.rules,
      "i18next/no-literal-string": [
        "warn",
        {
          mode: "jsx-only",
          "jsx-attributes": {
            include: ["label", "placeholder", "error", "title"],
            exclude: [".*"],
          },
          callees: {
            exclude: [".*"],
          },
        },
      ],
    },
  },

  // Add prettier recommended config last
  eslintPluginPrettierRecommended,
];