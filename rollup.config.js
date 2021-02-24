import { terser } from 'rollup-plugin-terser';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import vue from 'rollup-plugin-vue';
import json from 'rollup-plugin-json';
import copy from 'rollup-plugin-copy';

export default [
    {
        input: 'src/modules/scpi-api/index.js',
        output: {
            format: 'es',
            file: 'dist/modules/scpi-api/index.js',
        },
        plugins: [json(), terser(), resolve({ jsnext: true, preferBuiltins: true, browser: true }), commonjs(), vue()],
    },
    {
        input: 'src/endpoints/scpi-api/index.js',
        output: {
            file: 'dist/endpoints/scpi-api/index.js',
        },
        plugins: [
            resolve({ jsnext: true, preferBuiltins: true, browser: true }),
            commonjs(),
            copy({
                targets: [
                    {
                        src: 'dist/modules/scpi-api/index.js',
                        dest: '../../extensions/modules/scpi-api',
                    },
                    {
                        src: 'dist/endpoints/scpi-api/index.js',
                        dest: '../../extensions/endpoints/scpi-api',
                    },
                ],
                verbose: true,
            }),
        ],
    },
];
