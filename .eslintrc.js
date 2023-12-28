module.exports = {
  env: {
    node: true,
    es6: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:prettier/recommended", // Agrega esta línea
  ],
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
    // Personaliza las reglas según tus preferencias
  },
};
