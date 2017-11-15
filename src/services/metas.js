'use strict';

var logger = require('./../../config/logger');
var assign = require('object-assign');
var Promise = require('bluebird');
var fs = require('fs');
var exec = require('child_process').exec;
var DEFAULT_OPTIONS = {};
var probe = require('node-ffprobe');

exports.getMetasAsync = function (itemID, input, options) {

    options = assign({}, DEFAULT_OPTIONS, options);

    return new Promise(function (resolve, reject) {

        if (options.typo === 'image') {
            resolve();
            return;
        }

        if (!fs.existsSync(input)) {
            reject(new Error(`${input} not found.`))
        }

        logger.info('Getting metadata from ', input);

        probe(input, function (err, probeData) {
            if (err) {
                reject(err);
            }
            resolve(JSON.stringify(probeData.format));
        });
    });
}