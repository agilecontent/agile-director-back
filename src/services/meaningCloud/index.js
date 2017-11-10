const request = require('request');
const {createOptionsObject} = require('./utils');

const MCApi = {
    textClassification: (options) => new Promise((resolve) => {
        console.log(options);
        if (!options.txt || options.txt === '') {
            resolve();
            return;
        }

        // Endpoint Url
        const endpoint = '/class-1.1';

        // Set options
        const requestOptions = createOptionsObject(options, endpoint);

        console.log('MCApi::requestOptions::', requestOptions);

        // Request
        request.post(requestOptions, (error, response, body) => {
            if (error) {
                reject(error);
            }

            console.log('MCApi::requestResult::', body);

            if (body) {
                resolve(JSON.parse(body).category_list);
            }
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