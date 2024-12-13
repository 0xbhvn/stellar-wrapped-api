// eslint.config.js
import { ESLint } from "eslint";

export default new ESLint({
  baseConfig: {
    extends: ["airbnb-base", "prettier"],
    plugins: ["import", "jest", "prettier", "security"],
    env: {
      node: true,
      jest: true,
    },
    rules: {
      // Add your custom rules here
    },
  },
  ignorePatterns: ["node_modules/", "dist/"],
});
