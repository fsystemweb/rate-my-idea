module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
 ignorePatterns: [
    'components/**',
    'dist/**',
    'build/**',
    "**/*.spec.tsx"
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'jsx-a11y'],
  settings: {
    react: { version: 'detect' },
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  overrides: [
    {
      files: ['**/*.{ts,tsx,js,jsx}'],
      rules: {
        // project-specific relaxations can go here
      },
    },
    {
      files: ['**/*.ts', '**/*.tsx'],
      parserOptions: { project: false },
    },
  ],
  rules: {
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    // Disable rule that can crash with newer TypeScript/parser combos in CI
    '@typescript-eslint/no-unsafe-declaration-merging': 'off',
    // Workaround: disable react-hooks rule that can throw in this environment.
    'react-hooks/exhaustive-deps': 'off',
    // New JSX transform: React doesn't need to be in scope for JSX.
    'react/react-in-jsx-scope': 'off',
  },
};
