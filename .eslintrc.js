module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  env: {
    es2021: true
  },
  plugins: [
    'vuejs-accessibility'
  ],
  extends: [
    'plugin:vue/vue3-recommended',
    '@vue/standard',
    'plugin:vuejs-accessibility/recommended',
    '@vue/eslint-config-standard'
  ],
  parserOptions: {
    parser: 'babel-eslint'
  },
  rules: {
    'no-console': 'off'
  }
}
