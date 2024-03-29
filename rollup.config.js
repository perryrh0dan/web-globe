import summary from 'rollup-plugin-summary';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from "@rollup/plugin-terser";

export default {
  input: 'temp/web-globe.js',
  output: {
    file: 'dist/web-globe.js',
    format: 'esm',
  },
  onwarn(warning) {
    if (warning.code !== 'THIS_IS_UNDEFINED') {
      console.error(`(!) ${warning.message}`);
    }
  },
  plugins: [
    resolve(),
    commonjs(),
    terser({
      ecma: 2017,
      module: true,
      warnings: true,
      mangle: {
        properties: {
          regex: /^__/,
          reserved: ['__threeObj']
        },
      },
    }),
    summary(),
  ],
};
