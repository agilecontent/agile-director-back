const request = require('request');
const { createOptionsObject } = require('./utils');

const MCApi = {
    textClassification: (model, txt) => new Promise ((resolve) => {
        // Endpoint Url
        const endpoint = '/class-1.1';

        // Set options
        const options = createOptionsObject({ model, txt }, endpoint);

        // Request
        request.post(options, (error, response, body) => {
            resolve(body);
        });
    }),

    topicsExtraction: (tt, txt, lang) => new Promise ((resolve) => {
        // Endpoint Url
        const endpoint = '/topics-2.0';

        // Set options
        const options = createOptionsObject({ tt, txt, lang }, endpoint);

        // Request
        request.post(options, (error, response, body) => {
            resolve(body);
        });
    }),
};

module.exports = MCApi;