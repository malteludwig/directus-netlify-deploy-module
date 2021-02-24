# scpi-api module for Directus 9

can list deploys, launch a live-preview and trigger a build.

<br>

---

## Config

<br>

## 1. Add environment variables

Add the following vars to directus/.env:

```
SCORE_API_KEY=""
```

<br>

## 2. rollup.config.js:

-   configure your output destination i.e::

```js
output: {
    format: 'es',
    file: 'dist/index.js',
}
```

-   and the destination to your directus installation

    [path-to-directus]/extensions/modules/scpi-api

```js
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
    }),
```

<br>

---

## 3. Build and install

Install dependencies:

```
yarn
```

Build for production:

```
yarn build
```

Watch for developing:

```
yarn watch
```

Rollup will copy the built index.js to directus/extensions/modules/scpi-api.

**Restart Directus**

```
yarn directus start
```

Directus will automatically recognize and display the module.

<br>
