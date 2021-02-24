import axios from 'axios';

module.exports = function registerEndpoint(router, { services, exceptions, env }) {
    router.get('/products', async (req, res, next) => {
        const axios = require('axios');
        await axios
            .get('https://api-dev.sereniteo.fr/api/partners/products?isESignable=true&product=scpi', {
                headers: {
                    'X-SCORE-API-KEY': env.SCORE_API_KEY,
                },
            })
            .catch((error) => {
                res.send('an error occured.');
            })
            .then((response) => {
                res.send(response.data);
            });
    });
    router.get('/product/:id', async (req, res, next) => {
        const axios = require('axios');
        await axios
            .get(`https://api-dev.sereniteo.fr/api/partners/product/${req.params.id}`, {
                headers: {
                    'X-SCORE-API-KEY': env.SCORE_API_KEY,
                },
            })
            .catch((error) => {
                res.send('an error occured.');
            })
            .then((response) => {
                res.send(response.data);
            });
    });
    // TODO: send contact
    router.post('/contact', async (req, res, next) => {});
};
