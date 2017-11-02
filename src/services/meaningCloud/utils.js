const { options, apiUrl } = require('./defaults');
const { flatten } = require('lodash');

module.exports = {
    // Extend default options creating the final options object
    createOptionsObject: (configOptions, endpoint) => {
        // Merge form options
        const form = Object.assign({}, options.form, configOptions);

        // Final options configuration
        return Object.assign({}, options, { url: apiUrl + endpoint, form: form });
    },
    extractCategoryLabels: (categoriesList) => {
        const categories = categoriesList.map(({ label }) => label.split(/\s-\s/));
        const removeArrayDuplicatesPredicate = (elem, pos, arr) => arr.indexOf(elem) === pos;

        // Array with all categories
        return flatten(categories).filter(removeArrayDuplicatesPredicate);
    },
};