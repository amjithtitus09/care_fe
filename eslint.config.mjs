import eslint from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettierConfig from "eslint-config-prettier";
import i18nextPlugin from "eslint-plugin-i18next";
import mdxPlugin from "eslint-plugin-mdx";
import prettierPlugin from "eslint-plugin-prettier";
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
      "**/*.bs.js",
      "**/*.gen.tsx",
      "**/*.res",
      "**/*.css",
      "**/*.csv",
      "**/Dockerfile",
    ],
  },
  eslint.configs.recommended,
  prettierConfig,

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
      "react/react-in-jsx-scope": "off", // Not needed in React 17+
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

  // Prettier rules
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      "prettier/prettier": "error",
    },
  },

  // MDX-specific rules
  {
    files: ["**/*.mdx"],
    plugins: {
      mdx: mdxPlugin,
    },
    ...mdxPlugin.configs.recommended,
    rules: {
      "react/jsx-no-target-blank": "off",
      "i18next/no-literal-string": "off",
    },
  },
];
