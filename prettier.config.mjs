const formattingConfig = {
  arrowParens: 'always',
  semi: false,
  trailingComma: 'es5',
  singleQuote: true,
  tabWidth: 2,
  useTabs: false,
  printWidth: 80,
  bracketSpacing: true,
  jsxBracketSameLine: false,
}

const pluginsConfig = {
  plugins: ['prettier-plugin-organize-imports', 'prettier-plugin-tailwindcss'],
}

const config = {
  ...formattingConfig,
  ...pluginsConfig,
}

export default config
