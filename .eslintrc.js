module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ["eslint:recommended", "plugin:foundry-vtt/recommended", "prettier"],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },
  globals: {
    // Classes
    Macro: "readonly",

    // hack for tinyMCE
    TextEditor: "readonly",
    ROUTE_PREFIX: "readonly",
    // foundry utils
    foundry: "readonly",
    DocumentSheetConfig: "readonly",
  },
  rules: {},
};
