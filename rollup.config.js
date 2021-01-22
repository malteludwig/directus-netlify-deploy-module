import { terser } from 'rollup-plugin-terser';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import vue from 'rollup-plugin-vue';
import json from 'rollup-plugin-json';
import copy from 'rollup-plugin-copy';
import replace from '@rollup/plugin-replace';
import dotenv from 'dotenv';
dotenv.config();

export default [
    {
        input: 'src/index.js',
        output: {
            format: 'es',
            file: 'dist/modules/netlify-deploy/index.js',
        },
        plugins: [json(), terser(), resolve({ jsnext: true, preferBuiltins: true, browser: true }), commonjs(), vue()],
    },
    {
        input: 'src/endpoints/netlify-deploy/index.js',
        output: {
            file: 'dist/endpoints/netlify-deploy/index.js',
        },
        plugins: [
            resolve({ jsnext: true, preferBuiltins: true, browser: true }),
            commonjs(),
            copy({
                targets: [
                    {
                        src: 'dist/modules/netlify-deploy/index.js',
                        dest: '../../directus/extensions/modules/netlify-deploy',
                    },
                    {
                        src: 'dist/endpoints/netlify-deploy/index.js',
                        dest: '../../directus/extensions/endpoints/netlify-deploy',
                    },
                ],
            }),
        ],
    },
];
