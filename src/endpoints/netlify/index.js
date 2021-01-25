// extensions/endpoints/netlify/index.js
import axios from 'axios';

module.exports = function registerEndpoint(router, { services, exceptions, env }) {
    const { AuthenticationService } = services;
    const { ServiceUnavailableException } = exceptions;

    router.get('/', async (req, res, next) => {
        var ms = require('ms');
        console.log('req', req.accountability);
        try {
            if (req.accountability.user) {
                res.json({
                    netlifyClientID: env.NETLIFY_CLIENT_ID,
                    netlifySiteId: env.NETLIFY_SITE_ID,
                    netlifyTokenStorageId: env.NETLIFY_TOKEN_STORAGE_ID,
                });
            } else {
                res.send('You must be authorized to do this.');
            }
        } catch (error) {
            // Passes errors into the error handler
            // res.send(e);
            return next(error);
        }
    }),
        router.get('/deploys', async (req, res, next) => {
            var axios = require('axios');

            await axios
                .get(
                    'https://api.netlify.com/api/v1/sites/' +
                        env.NETLIFY_SITE_ID +
                        '/deploys?access_token=' +
                        env.NETLIFY_ACCESS_TOKEN
                )
                .then((response) => {
                    res.send(response.data);
                });
        }),
        router.get('/deploy', async (req, res, next) => {
            var axios = require('axios');

            const response = await axios.get(
                'https://api.netlify.com/api/v1/sites/' +
                    env.NETLIFY_SITE_ID +
                    '/deploys/' +
                    req.query.id +
                    '?access_token=' +
                    env.NETLIFY_ACCESS_TOKEN
            );

            res.send(response.data);
        }),
        router.get('/url', async (req, res, next) => {
            var axios = require('axios');
            await axios
                .get(
                    'https://api.netlify.com/api/v1/sites/' +
                        env.NETLIFY_SITE_ID +
                        '?access_token=' +
                        env.NETLIFY_ACCESS_TOKEN
                )
                .then((response) => {
                    // res.send(response.data.url);
                    res.json({
                        site_url: response.data.url,
                    });
                });
        }),
        router.post('/build', async (req, res, next) => {
            var axios = require('axios');
            const post = axios.post(env.NETLIFY_BUILD_HOOK);
            res.send(post);
        });
};