const { options, apiUrl } = require('./defaults');

module.exports = {
    // Extend default options creating the final options object
    createOptionsObject: (configOptions, endpoint) => {
        // Merge form options
        const form = Object.assign({}, options.form, configOptions);

        // Final options configuration
        return Object.assign({}, options, { url: apiUrl + endpoint, form: form });
    },
};