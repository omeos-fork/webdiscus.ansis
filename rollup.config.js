import terser from '@rollup/plugin-terser';
import replace from '@rollup/plugin-replace';
import cleanup from 'rollup-plugin-cleanup';
import copy from 'rollup-plugin-copy';
import dts from 'rollup-plugin-dts';
import { minify } from 'terser';

// last ECMA version compatible with node.js 12
const ecma = 2019;

export default [
  // remove comments from d.ts file
  {
    input: 'src/index.d.ts',
    output: [
      {
        file: 'dist/index.d.ts',
        format: 'es',
      },
    ],
    plugins: [
      cleanup({ extensions: ['ts'] }),
      dts(),
    ],
  },

  {
    input: 'src/index.js',
    output: [
      {
        intro: '/* Auto generated by rollup.\nUse `npm run build` to create new version. */',
        exports: 'named',
        file: './dist/index.js',
        format: 'cjs',
      },
    ],
    plugins: [
      replace({
        preventAssignment: false, // allow modifying exports
        // the order of exports is other than is needed
        'exports.Ansis = Ansis': 'module.exports = ansis', // firstly must be defined default export
        'exports.default = ansis': 'module.exports.Ansis = Ansis', // then on the next line can be named export
      }),
      terser({
        ecma,
        compress: {
          ecma,
          passes: 2,
        },
        toplevel: true,
      }),
      copy({
        targets: [
          {
            src: 'src/index.mjs',
            dest: 'dist/',
            transform: async (contents, name) => (await minify(contents.toString(), { ecma: 2015 })).code,
          },

          // minify d.ts file generated after cleanup
          {
            src: 'dist/index.d.ts',
            dest: 'dist/',
            transform: (contents, name) => { return contents.toString().replaceAll(/\n/g, '');},
          },

          { src: 'package.npm.json', dest: 'dist/', rename: 'package.json' },
          { src: 'README.npm.md', dest: 'dist/', rename: 'README.md' },
          { src: 'LICENSE', dest: 'dist/' },
        ],
      }),
    ],
  },
];
