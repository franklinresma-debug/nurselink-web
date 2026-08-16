import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'public']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    files: ['src/nurselink-mobile.js'],
    rules: {
      'no-empty': 'off',
      'no-func-assign': 'off',
      'no-redeclare': 'off',
      'no-unused-vars': 'off',
    },
  },
  {
    files: ['src/context/AuthContext.jsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    files: ['src/pages/ApplicationStatus.jsx', 'src/pages/Credentials.jsx'],
    rules: {
      'react-hooks/set-state-in-effect': 'off',
    },
  },
])
