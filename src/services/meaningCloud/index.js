const request = require('request');
const {createOptionsObject} = require('./utils');

const MCApi = {
    textClassification: (options) => new Promise((resolve) => {
        // Endpoint Url
        const endpoint = '/class-1.1';

        // Set options
        const requestOptions = createOptionsObject(options, endpoint);

        // Request
        request.post(requestOptions, (error, response, body) => {
            resolve(JSON.parse(body));
        });
    }),

    topicsExtraction: (options) => new Promise((resolve) => {
        // Endpoint Url
        const endpoint = '/topics-2.0';

        // Set options
        const requestOptions = createOptionsObject(options, endpoint);

        // Request
        request.post(requestOptions, (error, response, body) => {
            resolve(JSON.parse(body));
        });
    }),
};

module.exports = MCApi;