# Netlify-deploy module for directus 9

## Config

### `1. On netlify.com`

1. create a new application here: https://app.netlify.com/user/applications

    use http://DIRECTUS_URL/admin/netlify-deploy/ as Redirect URI.

2. create a deploy hook for your site (https://app.netlify.com/sites/YOURSITE/settings/deploys > Build Hook)

### `2. Create environment variables`

-   Add the following vars to directus/.env:

    -   Holds the Client ID of your netlify application you created earlier, can be found here: https://app.netlify.com/user/applications

        ```
        NETLIFY_CLIENT_ID="..."
        ```

    -   ID of your site, can be found here: https://app.netlify.com/sites/YOURSITE/settings/general > API ID

        ```
        NETLIFY_SITE_ID="..."
        ```

    -   Build Hook Url:

        ```
        NETLIFY_BUILD_HOOK="..."
        ```

### `3. rollup.config.js`:

-   configure your output destination i.e::

```js
output: {
    format: 'es',
    file: 'dist/index.js',
}
```

-   and the destination to your directus installation

    [path-to]/directus/extensions/modules/netlify-deploy

```js
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
```

---

## Build and install

Install dependencies:

```
yarn
```

Build for production:

```
yarn rollup -c
```

Watch for developping

```
yarn rollup -c -w
```

Rollup will copy the built index.js to directus/extensions/modules/netlify-deploy.

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
