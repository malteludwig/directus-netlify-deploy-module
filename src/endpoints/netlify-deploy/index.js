// extensions/endpoints/netlify-deploy/index.js
import axios from 'axios';

module.exports = function registerEndpoint(router, { services, exceptions, env }) {
    const { AuthenticationService } = services;
    const { ServiceUnavailableException } = exceptions;

    router.get('/', async (req, res, next) => {
        var ms = require('ms');

        try {
            // check request cookie vor refresh token
            if (req.headers.cookie && req.headers.cookie.split('=')[0] === 'directus_refresh_token') {
                // request a refresh
                const authService = new AuthenticationService({
                    accountability: req.accountability,
                    schema: req.schema,
                });
                const auth = await authService.refresh(req.headers.cookie.split('=')[1]);

                if (auth.accessToken) {
                    // go on with the new token
                    const refreshToken = auth.refreshToken;

                    // store token in cookie
                    res.cookie('directus_refresh_token', refreshToken, {
                        httpOnly: true,
                        maxAge: ms(env.REFRESH_TOKEN_TTL),
                        secure: env.REFRESH_TOKEN_COOKIE_SECURE === 'true' ? true : false,
                        sameSite: env.REFRESH_TOKEN_COOKIE_SAME_SITE || 'strict',
                    });

                    // respond with vars
                    res.json({
                        netlifyClientID: env.NETLIFY_CLIENT_ID,
                        netlifySiteId: env.NETLIFY_SITE_ID,
                        netlifyTokenStorageId: env.NETLIFY_TOKEN_STORAGE_ID,
                    });
                }
                next();
            } else {
                // request has no cookie: request not authorized
                res.send('You must be authorized to do this.');
            }
        } catch (error) {
            // Passes errors into the error handler
            // res.send(e);
            return next(error);
        }
    });
};
