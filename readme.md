# netlify-deploy Extension

## Config

### 1. On netlify.com

1. create a new application: https://app.netlify.com/user/applications

and use http://localhost:8055/admin/netlify-deploy/ (http://DIRECTUS_URL/admin/netlify-deploy/)

as Redirect URI.

2. create a deploy hook for your site (https://app.netlify.com/sites/YOURSITE/settings/deploys > Build Hook)

### 2. Create environment variables

-   Create a .env file at the root of the repository.

    **Make sure you add it to your .gitignore file**

-   Add the following vars to your .env:

```
NETLIFY_CLIENT_ID="..."
```

Fill with the Client ID of the netlify application you created earlier, can be found here: https://app.netlify.com/user/applications

```
NETLIFY_SITE_ID="..."
```

Fill with de id of your site, can be found here: https://app.netlify.com/sites/YOURSITE/settings/general > API ID

```
NETLIFY_TOKEN_STORAGE_ID="..."
```

The Key of the localStorage that will hold the access token in your browser. Should probably be obfuscated. ie: (sdifou0e4ut3wjnkl3q48r9)

### 3. _rollup.config.js:_

-   configure your output destination i.e::

```js
output: {
        format: 'es',
        file: 'dist/index.js',
    }
```

-   and the destination within your directus installation:

```js
copy({
            targets: [{ src: 'dist/index.js', dest: '../../directus/extensions/modules/netlify-deploy' }],
        }),
```

change the destination to fit your directus installation:

```html
[path-to]/directus/extensions/modules/netlify-deploy
```

```js
replace({
            // see .env
            CLIENT_ID: JSON.stringify(process.env.NETLIFY_CLIENT_ID),
            SITE_ID: JSON.stringify(process.env.NETLIFY_SITE_ID),
            NETLIFY_TOKEN_STORAGE_ID: JSON.stringify(process.env.NETLIFY_TOKEN_STORAGE_ID),
        }),
```

**CAUTION!**
During the build process Rollup will replace the Vars (ClientId and SiteId) used in module.vue with json.stringified values from your .env.
They will be visible in diretus sources even if NOT logged in! Search for it in index.js...

The Build Hook URL is not exposed because we load it from the netlify API.

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
Directus will automatically recognize and display the module.

## Usage

You will first need to authenticate the app with netlify.
Netlify will send back an access token that will be store in localStorage
