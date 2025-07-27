import globals from 'globals';
import react from 'eslint-plugin-react';
import json from '@eslint/json';
import reactHooks from 'eslint-plugin-react-hooks';
import babelParser from '@babel/eslint-parser';

export default [
  {
    ignores: [
      'node_modules',
      'dist',
      'package.json',
      'package-lock.json',
    ],
  },
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: ['@babel/preset-react'],
        },
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      // Airbnb-style rules (add more as needed)
      'array-bracket-spacing': ['error', 'never'],
      'comma-dangle': ['error', 'always-multiline'],
      'consistent-return': 'error',
      'eqeqeq': ['error', 'always'],
      'no-console': 'warn',
      'no-underscore-dangle': 'off',
      'object-curly-spacing': ['error', 'always'],
      'prefer-const': 'error',
      'react/jsx-boolean-value': ['error', 'never'],
      'react/jsx-curly-spacing': ['error', { when: 'never', children: true }],
      'react/jsx-equals-spacing': ['error', 'never'],
      'react/jsx-filename-extension': ['error', { extensions: ['.jsx', '.js'] }],
      'react/jsx-no-bind': ['error', { allowArrowFunctions: true }],
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-no-undef': 'error',
      'react/jsx-pascal-case': 'error',
      'react/jsx-tag-spacing': ['error', { beforeSelfClosing: 'always' }],
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'error',
      'react/no-danger': 'warn',
      'react/no-deprecated': 'error',
      'react/no-direct-mutation-state': 'error',
      'react/no-unescaped-entities': 'error',
      'react/no-unknown-property': 'error',
      'react/prop-types': 'off', // or 'error' if you want to enforce
      'react/react-in-jsx-scope': 'off',
      'react/self-closing-comp': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  // JSON linting
  {
    files: ['**/*.json'],
    plugins: { json },
    // languageOptions: { parser: "json" },
    rules: {
      ...json.configs.recommended.rules,
    },
  },
];
