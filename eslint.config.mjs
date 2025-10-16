import pluginJs from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import configPrettier from 'eslint-config-prettier';
import pluginJsxA11y from 'eslint-plugin-jsx-a11y';
import pluginPrettier from 'eslint-plugin-prettier';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default [
    {
        files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
        languageOptions: {
            parser: tsParser, // Specify the TypeScript ESLint parser
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
            globals: {
                ...globals.browser,
                ...globals.node, // If you're also using Node.js environments
            },
        },
        plugins: {
            react: pluginReact,
            'react-hooks': pluginReactHooks,
            'jsx-a11y': pluginJsxA11y,
            prettier: pluginPrettier,
        },
        rules: {
            ...pluginJs.configs.recommended.rules,
            ...pluginReact.configs.recommended.rules,
            ...pluginReact.configs['jsx-runtime'].rules, // For React 17+ with new JSX transform
            ...pluginJsxA11y.configs.recommended.rules,
            ...configPrettier.rules, // Integrates Prettier rules
            'prettier/prettier': 'error', // Reports Prettier violations as ESLint errors
            'react/prop-types': 'off', // Disable if using TypeScript or another prop-type solution
            'react/react-in-jsx-scope': 'off', // Disable for React 17+ with new JSX transform
            'react/no-unescaped-entities': 'off',
            // Add any other custom rules here
            'jsx-a11y/no-noninteractive-element-interactions': 'off',
            'jsx-a11y/click-events-have-key-events': 'off',
        },
        settings: {
            react: {
                version: 'detect', // Automatically detect React version
            },
        },
    },
    {
        // Optional: Ignore specific files or directories
        ignores: ['node_modules/', 'dist/', '.next/'],
    },
];
