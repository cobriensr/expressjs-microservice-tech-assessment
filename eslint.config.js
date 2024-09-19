import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2021,
        ...globals.mocha
      }
    },
    rules: {
      // Turned off formatting rules
      'no-console': 'off',
      'no-trailing-spaces': 'off',
      'quotes': 'off',
      'max-len': 'off',

      // Kept important rules
      'no-duplicate-imports': 'error',
      'eqeqeq': ['error', 'always'],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-param-reassign': 'error',
      'no-return-await': 'error',
      'require-await': 'error',
      'no-throw-literal': 'error',
      'camelcase': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-template': 'error',
      'complexity': ['error', 10],

      // Relaxed some stylistic rules
      'indent': ['warn', 2],
      'semi': ['warn', 'always'],
    }
  }
];