# Directus 9 Netlify module for deploys and builds

## Config

## 1. Add environment variables

-   Add the following vars to directus/.env:

    -   Your Netlify API Access token. Create one here for your site: https://app.netlify.com/user/applications#personal-access-tokens

        ```
        NETLIFY_ACCESS_TOKEN
        ```

    -   ID of your site, can be found here: https://app.netlify.com/sites/YOURSITE/settings/general > API ID

        ```
        NETLIFY_SITE_ID="..."
        ```

    -   Build Hook Url. Create one here: (https://app.netlify.com/sites/YOURSITE/settings/deploys > Build Hook)

        ```
        NETLIFY_BUILD_HOOK="..."
        ```

## 2. rollup.config.js:

-   configure your output destination i.e::

```js
output: {
    format: 'es',
    file: 'dist/index.js',
}
```

-   and the destination to your directus installation

    [path-to]/directus/extensions/modules/netlify

```js
 copy({
        targets: [
            {
                src: 'dist/modules/netlify/index.js',
                dest: '../../directus/extensions/modules/netlify',
            },
            {
                src: 'dist/endpoints/netlify/index.js',
                dest: '../../directus/extensions/endpoints/netlify',
            },
        ],
    }),
```

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

Rollup will copy the built index.js to directus/extensions/modules/netlify.

Restart Directus

```
yarn directus start
```

Directus will automatically recognize and display the module.

---

## Usage

Clicking the Deploy button to trigger the BuildHook on netlify.

## Preview changes

Preview button will call your site as preview

```html
https://YOURSITE.netlify.app/?preview
```

the preview param can be used to enable preview mode in your application.

I.e. enable nuxt preview mode for static sites:

`plugins/preview.client.js`

```js
export default ({ query, enablePreview }) => {
    if (typeof query.preview !== 'undefined') {
        console.log('PREVIEW MODE ENABLED');
        enablePreview();
    }
};
```

`nuxt.config.js`

```js
 plugins: [
    { src: '~/plugins/preview.client.js' },
],

```

in preview mode nuxt will excecute API calls.

see: https://nuxtjs.org/docs/2.x/features/live-preview/
