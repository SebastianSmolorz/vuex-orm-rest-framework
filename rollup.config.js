import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import rollupJson from 'rollup-plugin-json'
import commonjs from 'rollup-plugin-commonjs'
import bundleSize from 'rollup-plugin-bundle-size'

const outputDir = 'dist/vuex-orm-rest-framework'

export default {
  input: 'src/index.js',
  output: [
    {
      file: `${outputDir}.cjs.js`,
      format: 'cjs',
      exports: 'named'
    },
    {
      file: `${outputDir}.esm.js`,
      format: 'esm',
      exports: 'named'
    },
    {
      name: 'VuexOrmRestFramework',
      file: `${outputDir}.umd.js`,
      format: 'umd',
      exports: 'named'
    }
  ],
  plugins: [
    resolve({ jsnext: true, preferBuiltins: true, browser: true }),
    commonjs({
      include: /node_modules/
    }),
    rollupJson(),
    babel({
      runtimeHelpers: true,
      exclude: 'node_modules/**'
    }),
    bundleSize()
  ]
}
