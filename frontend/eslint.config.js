import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  {
    ignores: [
      "dist",
      "build",
      "node_modules",
      "*.min.js",
      "coverage",
      "public",
      "*.config.js",
    ],
  },
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2024,
      globals: {
        ...globals.browser,
        ...globals.es2024,
      },
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    plugins: {
      react: react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,

      // React specific
      "react/prop-types": "off",
      "react/jsx-uses-react": "off", // Not needed in React 17+
      "react/react-in-jsx-scope": "off", // Not needed in React 17+
      "react/jsx-uses-vars": "error", // This will fix the unused component issue
      "react-refresh/only-export-components": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // Variables
      "no-unused-vars": [
        "error",
        {
          args: "after-used",
          argsIgnorePattern: "^_",
          vars: "all",
          varsIgnorePattern: "^_|^React$",
          destructuredArrayIgnorePattern: "^_",
          ignoreRestSiblings: true,
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "no-use-before-define": [
        "error",
        { functions: false, classes: true, variables: true },
      ],

      // Best practices
      // "no-console": ["warn", { allow: ["warn", "error", "info"] }],
      "no-debugger": "error",
      "no-alert": "warn",
      "prefer-const": "error",
      "no-var": "error",
      eqeqeq: ["error", "always", { null: "ignore" }],
      curly: ["error", "multi-line"],
      "react/no-unescaped-entities": "off",

      // ES6+
      "arrow-body-style": "off",
      "prefer-arrow-callback": "off",
      "prefer-template": "off",
      "no-duplicate-imports": "error",
      "object-shorthand": ["warn", "always"],
      "prefer-destructuring": "off",

      // Code quality
      "no-lonely-if": "warn",
      "no-nested-ternary": "off",
      "no-unneeded-ternary": "warn",
      "no-useless-return": "warn",
      "prefer-object-spread": "warn",
      "no-shadow": "warn",
      "no-param-reassign": ["warn", { props: false }],

      // Async/Promises
      "no-async-promise-executor": "error",
      "no-await-in-loop": "warn",
      "prefer-promise-reject-errors": "warn",
      "no-promise-executor-return": "error",

      // Import sorting (optional but helpful)
      "sort-imports": "off",
    },
  },
];
