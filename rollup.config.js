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
    inlineDynamicImports: true,
  },
  external: ['obsidian', 'crypto'],
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      jsx: 'react-jsx',
    }),
    nodeResolve({
      browser: true,
      preferBuiltins: true,
      exportConditions: ['default', 'module', 'import'],
    }),
    commonjs({
      include: 'node_modules/**',
      transformMixedEsModules: true,
    }),
    postcss({
      plugins: [],
      extract: false,
      inject: true,
    }),
    {
      name: 'define-process-env',
      generateBundle(options, bundle) {
        Object.keys(bundle).forEach((fileName) => {
          const file = bundle[fileName]
          if (file.type === 'chunk') {
            file.code = file.code.replace(/process\.env\.NODE_ENV/g, '"production"')
          }
        })
      },
    },
  ],
}
