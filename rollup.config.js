import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import postcss from 'rollup-plugin-postcss'

export default {
  input: 'src/main.ts',
  output: {
    dir: '.',
    sourcemap: 'inline',
    format: 'cjs',
    exports: 'default',
  },
  external: ['obsidian', 'crypto'],
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      jsx: 'react-jsx',
    }),
    nodeResolve({ browser: true, preferBuiltins: true }),
    commonjs({
      include: 'node_modules/**',
      transformMixedEsModules: true,
    }),
    postcss({
      plugins: [require('@tailwindcss/postcss'), require('autoprefixer')],
      extract: false,
      inject: true,
    }),
  ],
}
