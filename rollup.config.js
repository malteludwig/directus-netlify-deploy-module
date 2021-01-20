import { terser } from 'rollup-plugin-terser';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import vue from 'rollup-plugin-vue';
import json from 'rollup-plugin-json';
import copy from 'rollup-plugin-copy';
import replace from '@rollup/plugin-replace';
import dotenv from 'dotenv';
dotenv.config();

export default {
    input: 'src/index.js',
    output: {
        format: 'es',
        file: 'dist/index.js',
    },
    plugins: [
        // fill-in vars in module.vue
        replace({
            // see .env
            CLIENT_ID: JSON.stringify(process.env.NETLIFY_CLIENT_ID),
            SITE_ID: JSON.stringify(process.env.NETLIFY_SITE_ID),
            NETLIFY_TOKEN_STORAGE_ID: JSON.stringify(process.env.NETLIFY_TOKEN_STORAGE_ID),
        }),
        json(),
        terser(),
        resolve({ jsnext: true, preferBuiltins: true, browser: true }),
        commonjs(),
        vue(),

        copy({
            targets: [{ src: 'dist/index.js', dest: '../../directus/extensions/modules/netlify-deploy' }],
        }),
    ],
};
