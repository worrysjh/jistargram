module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  extends: ["eslint:recommand", "prettier"],
  plugins: ["prettier"],
  rules: {
    "prettier/prettier": "error",
  },
};
