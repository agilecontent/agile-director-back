'use strict';
const Promise = require('bluebird');
const MCApi = require('./meaningCloud');
const MCModels = require('./meaningCloud/models');
const { extractCategoryLabels } = require('./meaningCloud/utils');
const elastic = Promise.promisifyAll(require('../elastic/data'));
const collectionService = require('./collection');
const slugs = require('../libs/slugs');
const async = require('async');
const _ = require('lodash');
const dataHelper = require('../helpers/data');
const collectionHelper = require('../helpers/collection');

const mediaService = require('./media');
const transcriptMediaService = require('./transcript');
const linguabuzzService = require('./linguabuzz');
const thumbnailsService = require('./thumbnails');
const randomstring = require('randomstring');

// Default language
const language = 'es';

exports.processItemAsync = function (mediaURL, type) {
    return new Promise(function (resolve, reject) {
        const itemID = randomstring.generate(12);
        const data = {};

        const processList = [
            downloadMedia,
            getThumbnail,
            getDescription,
            getTags,
            getSubtitles
        ];

        // Process Media
        async.waterfall(processList, (err, result) => err ? reject(err) : resolve(result));

        function downloadMedia(cb) {
            mediaService.getMediaAsync(itemID, mediaURL).then(function (result) {
                data.tmpFile = result.tmpFile;
                data.mediaURL = result.mediaURL;
                cb(null, data);
            }).catch(function (err) {
                cb(err);
            })
        }

        function getThumbnail(data, cb) {
            thumbnailsService.getThumbnailAsync(itemID, mediaURL).then(function (result) {
                data.image = result;
                cb(null, data);
            }).catch(function (err) {
                cb(err);
            })
        }

        function getDescription(data, cb) {
            transcriptMediaService.getTranscriptAsync(itemID, data.tmpFile, {
                language: language,
                format: 'raw'
            }).then(function (result) {
                data.description = result;
                cb(null, data);
            }).catch(function (err) {
                cb(err);
            })
        }

        function getTags(data, cb) {
            const txt = data.description;
            MCApi.textClassification({ model: MCModels.spanish.IPTC, txt }).then(function (result) {
                data.tags = _.union(data.tags, extractCategoryLabels(result.categories_labels));
                cb(null, data);
            }).catch(function (err) {
                cb(err);
            });
        }

        function getSubtitles(data, cb) {
            transcriptMediaService.getTranscriptAsync(itemID, data.tmpFile, {
                language: language
            }).then(function (result) {
                data.transcript = result;
                cb(null, data);
            }).catch(function (err) {
                cb(err);
            })
        }
    })
};

/**
 * get document
 */
exports.addDocumentAsync = function (data) {
    return exports.processItemAsync(data.body.mediaURL, data.body.type).then(function (result) {
        data.body.mediaURL = result.mediaURL;
        data.body.image = result.image;
        data.body.transcript = result.transcript;
        data.body.description = result.description;
        data.body.metas = result.metas;

        collectionService.findCollectionAsync({
                name: data.collectionName,
                project: data.projectName
            })
            .then(function (collection) {
                const helper = collectionHelper(collection);

                return slugs.setSlugsAsync(
                    helper.getName(),
                    helper.getSlugs(),
                    dataHelper.inputMapper(data.body, collection)
                ).then(function () {
                    return elastic.addDocumentAsync({
                        index: helper.getIndex(),
                        type: helper.getType(),
                        refresh: data.refresh,
                        body: dataHelper.inputMapper(data.body, collection),
                        id: data.body.id
                    })
                })

            }).then(function (res) {
            return {
                id: res._id,
                collection: res._type,
                project: res._index
            }
        })
    }).catch(function (err) {
        console.log(err);
    })
};

/**
 * update document
 */
exports.updateDocumentAsync = function (data) {
    return collectionService.findCollectionAsync({
            name: data.collectionName,
            project: data.projectName
        })
        .then(function (collection) {
            const helper = collectionHelper(collection);
            return slugs.setSlugsAsync(
                helper.getName(),
                helper.getSlugs(),
                dataHelper.inputMapper(data.body, collection)
            ).then(function () {
                return elastic.updateDocumentAsync({
                    index: helper.getIndex(),
                    type: helper.getType(),
                    //body: data.body,
                    refresh: data.refresh,
                    body: dataHelper.inputMapper(data.body, collection, {
                        check_fields: ['array']
                    }),
                    id: data.id
                })
            })
        }).then(function (res) {
            return res;
        })
};

/**
 * clean documents
 */
exports.cleanDocumentsAsync = function (data) {
    return collectionService.findCollectionAsync({
            name: data.collectionName,
            project: data.projectName
        })
        .then(function (collection) {
            const helper = collectionHelper(collection);
            return elastic.cleanDocumentsAsync({
                index: helper.getIndex(),
                type: helper.getType()
            });
        })
};

/**
 * delete document
 */
exports.deleteDocumentAsync = function (data) {
    return collectionService.findCollectionAsync({
            name: data.collectionName,
            project: data.projectName
        })
        .then(function (collection) {
            const helper = collectionHelper(collection);
            return elastic.deleteDocumentAsync({
                index: helper.getIndex(),
                type: helper.getType(),
                id: data.id
            })
        })
};

/**
 * enable / disable item / document
 */
exports.enableDocumentAsync = function (data) {
    if (!data.id) {
        throw new Error('item id is missing')
    }
    return collectionService.findCollectionAsync({
            name: data.name
        })
        .then(function (collection) {
            const helper = collectionHelper(collection);
            return elastic.updateDocumentAsync({
                index: helper.getIndex(),
                type: helper.getType(),
                refresh: data.refresh,
                body: {
                    enabled: data.enabled
                },
                id: data.id
            })
        })
        .then(function (res) {
            return res;
        })
};

/**
 * get document
 */
exports.getDocumentAsync = function (data) {
    return collectionService.findCollectionAsync({
            name: data.collectionName,
            project: data.projectName
        })
        .then(function (collection) {
            const helper = collectionHelper(collection);
            return elastic.getDocumentAsync({
                index: helper.getIndex(),
                type: helper.getType(),
                id: data.id
            })
        })
        .then(function (res) {
            const output = res._source;
            if (output.body) {
                output.body.id = res._id;
            }
            return res._source;
        })
};

/**
 * add multiple documents elastic
 * @param {Array} data documents
 * @param {object} data
 */
exports.addDocumentsAsync = function (data) {
    return collectionService.findCollectionAsync({
            name: data.collectionName,
            project: data.projectName
        })
        .then(function (collection) {
            const helper = collectionHelper(collection);

            // adding slugs mapping to key value datastore
            return slugs.setSlugsAsync(
                helper.getName(),
                helper.getSlugs(),
                dataHelper.inputMapper(data.body, collection)
            ).then(function () {
                return elastic.addDocumentsAsync({
                    index: helper.getIndex(),
                    type: helper.getType(),
                    refresh: data.refresh,
                    body: dataHelper.inputMapper(data.body, collection),
                })
            })
        }).then(function (res) {
            return _.pick(_.extend(res, {
                ids: _.map(res.items, function (val) {
                    return val.create._id;
                }),
                //project: project,
                collection: data.collectionName
            }), 'took', 'errors', 'ids', 'collection');
        })
};

/**
 * add all documents to elastic
 * @param {Array} data full data
 * @param {Function} callback
 * @return {String} inserted documents count
 */
exports.addAllDocuments = function (data, callback) {
    const documents = data.body;
    const limit = documents.length;
    let length = documents.length;

    const batchSize = data.batchSize || 1000;

    // needs to be refactored
    const projectName = data.projectName;
    const collectionName = data.collectionName;

    async.whilst(
        function () {
            return length > 0;
        },
        function (callback) {
            const removed = documents.splice(0, batchSize);
            exports.addDocumentsAsync({
                // needs to be refactored
                projectName: projectName,
                collectionName: collectionName,
                refresh: data.refresh,
                body: removed
            }).then(function (res) {
                return callback(null, res);
            }).catch(function (err) {
                return callback(err);
            });
            length -= removed.length;
        },
        function (err) {
            if (err) {
                console.log(err);
            }
            callback(null, limit + ' documents added');
        }
    );
};
