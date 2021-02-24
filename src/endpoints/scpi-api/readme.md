# Netlify endpoint for Directus 9 API

## Endpoints

<br />

`GET: /custom/scpi-api/products`

gets list of SCPI from https://api-dev.sereniteo.fr/api/partners/products?isESignable=true&product=scpi
<br />
<br />

`POST: /contact`

posts contact request to https://api-dev.sereniteo.fr/api/partners/contactRequest

```js

// Params:
name*: string // Name of the client
phone: string // Phone in international format
email*: string
message: string // Message of the client

```
