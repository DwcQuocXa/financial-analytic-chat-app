module.exports = {
    extends: [
        'react-app',
        'react-app/jest',
        'plugin:@typescript-eslint/recommended'
    ],
    plugins: ['@typescript-eslint'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true
        }
    },
    rules: {
    }
};
