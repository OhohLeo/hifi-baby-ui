import eslintConfigPrettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";

/**
 * ESLint flat config: Vue 3 + TypeScript + Prettier compatibility.
 * Typed rules (`recommendedTypeChecked`) are intentionally not enabled here — enable
 * them in a follow-up once `parserOptions.project` / projectService covers every
 * linted path (including `tests/`) and import resolution is configured for `@/`.
 */
export default tseslint.config(
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "*.config.js",
      "*.config.mjs",
      "*.config.mts",
      "*.config.ts",
      ".eslintrc.js",
      ".eslintrc.cjs",
      ".playwright-mcp/**",
      "coverage/**",
      "android/**",
      "test-results/**",
    ],
  },

  {
    files: ["**/*.{js,cjs,mjs}"],
    ...pluginJs.configs.recommended,
    languageOptions: {
      sourceType: "module",
      globals: { ...globals.node },
    },
  },

  ...tseslint.configs.recommended,
  ...pluginVue.configs["flat/strongly-recommended"],

  {
    files: ["**/*.vue"],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
  },

  {
    plugins: { import: importPlugin },
  },

  // Unit tests often define small inline `defineComponent` hosts for composables / VTU.
  {
    files: ["tests/unit/**/*.{ts,tsx}"],
    rules: {
      "vue/one-component-per-file": "off",
    },
  },

  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        computed: "readonly",
        ref: "readonly",
        reactive: "readonly",
        watch: "readonly",
        watchEffect: "readonly",
        onMounted: "readonly",
        onUnmounted: "readonly",
        onBeforeMount: "readonly",
        onBeforeUnmount: "readonly",
        onUpdated: "readonly",
        onBeforeUpdate: "readonly",
        defineProps: "readonly",
        defineEmits: "readonly",
        defineExpose: "readonly",
        withDefaults: "readonly",
      },
    },
  },

  {
    rules: {
      // Vue (strongly-recommended is stricter than recommended)
      "vue/multi-word-component-names": "off",
      "vue/no-v-html": "warn",
      "vue/require-default-prop": "off",
      "vue/require-explicit-emits": "warn",
      "vue/component-name-in-template-casing": ["error", "PascalCase"],
      "vue/html-self-closing": ["error", {
        html: {
          void: "always",
          normal: "always",
          component: "always",
        },
      }],
      // Matches this codebase: template-first SFCs
      "vue/block-order": ["error", {
        order: ["template", "script", "style"],
      }],

      // TypeScript
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      }],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",

      // General
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "warn",
      "prefer-const": "error",
      "no-var": "error",
      "eqeqeq": ["error", "always", { null: "ignore" }],
      "curly": ["error", "all"],
      "brace-style": ["error", "1tbs"],

      // Imports: avoid no-unresolved until resolver aliases match Vite (optional follow-up)
      "import/no-duplicates": "error",
      "import/no-unresolved": "off",
    },
  },

  eslintConfigPrettier,
);
