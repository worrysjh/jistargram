module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ["eslint:recommended", "plugin:react/recommand", "prettier"],
  plugins: ["react", "prettier"],
  rules: {
    "prettier/prettier": "error",
  },
};
