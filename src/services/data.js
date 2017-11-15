'use strict';

var Promise = require('bluebird');
var elastic = Promise.promisifyAll(require('../elastic/data'));
var collectionService = require('../services/collection');
var slugs = require('../libs/slugs');
var async = require('async');
var _ = require('lodash');
var dataHelper = require('../helpers/data');
var collectionHelper = require('../helpers/collection');

var mediaService = require('./media');
var transcriptMediaService = require('./transcript');
var metasService = require('./metas');
var thumbnailsService = require('./thumbnails');
var randomstring = require('randomstring');
var MCApi = require('./meaningCloud');
var MCTopics = require('./meaningCloud/topics');
var MCModels = require('./meaningCloud/models');
var { extractCategoryLabels } = require('./meaningCloud/utils');
var logger = require('./../../config/logger');
var AuphonicApi = require('./auphonic');
const presets = require('./auphonic/presets');

exports.processItemAsync = function (mediaURL, language, typo, tags, description, filter) {
    return new Promise(function (resolve, reject) {
        const itemID = randomstring.generate(12);
        const data = {};
        data.typo = typo;
        data.description = description;

        async.waterfall([
            downloadMedia,
            processMedia,
            getThumbnail,
            getMetas,
            getDescription,
            getSubtitles,
            getIPTC,
            getTags,
        ], function (err, result) {
            if (err) {
                logger.info(err);
                return reject(err);
            }
            return resolve(result);
        });

        function downloadMedia(cb) {
            mediaService.getMediaAsync(itemID, mediaURL, {typo: typo}).then(function (result) {
                data.tmpFile = result.tmpFile;
                data.mediaURL = result.mediaURL;
                logger.info('downloadMedia', itemID, data.mediaURL);
                cb(null, data);
            }).catch(function (err) {
                cb(err);
            })
        }

        function processMedia(data, cb) {
            const hasFilter = !!filter;
            console.log('PROCESS MEDIA');
            console.log(filter);
            // try http://hwcdn.libsyn.com/p/f/1/f/f1fef1ebfd271dc7/17_Profesiones_y_Tipos_de_Personas_-_Zapp_Ingles_Listening_2.17.mp3
            if (typo === 'audio' && hasFilter) {
                logger.info('filtering audio...');
                console.log(filter);
                console.log(presets[filter]);
                AuphonicApi.audioTransform(data.mediaURL, itemID, presets[filter]).then(function (result) {
                    logger.info('AuphonicApi', result);
                    data.output_basename = result.output_basename;
                    data.uuid = result.uuid;
                    cb(null, data);
                }).catch(function (err) {
                    logger.info('AuphonicApi error', err);
                    // continue ...
                    // cb(err);
                    cb(null, data);
                })
            }
            else {
                // do nothing.
                cb(null, data);
            }
        }

        function getThumbnail(data, cb) {
            thumbnailsService.getThumbnailAsync(itemID, mediaURL, {typo: typo}).then(function (result) {
                data.image = result;
                logger.info('getThumbnail', itemID, result);
                cb(null, data);
            }).catch(function (err) {
                cb(err);
            })
        }

        function getDescription(data, cb) {
            transcriptMediaService.getTranscriptAsync(itemID, data.tmpFile, {
                language: language,
                format: 'raw',
                typo: typo
            }).then(function (result) {
                logger.info('getDescription', itemID, result);
                data.description = result ? data.description.concat(' ').concat(result) : data.description;
                cb(null, data);
            }).catch(function (err) {
                cb(err);
            })
        }

        function getMetas(data, cb) {
            metasService.getMetasAsync(itemID, data.tmpFile, {
                typo: typo
            }).then(function (result) {
                logger.info('getMetas', itemID, result);
                data.metas = result;
                cb(null, data);
            }).catch(function (err) {
                cb(err);
            })
        }

        function getSubtitles(data, cb) {
            transcriptMediaService.getTranscriptAsync(itemID, data.tmpFile, {
                language: language,
                typo: typo
            }).then(function (result) {
                logger.info('getSubtitles', itemID, result);
                data.transcript = result;
                cb(null, data);
            }).catch(function (err) {
                cb(err);
            })
        }

        function getIPTC(data, cb) {
            console.log('GET IPTC');
            try {
                MCApi.textClassification({
                    model: MCModels[language].IPTC,
                    txt: data.description
                }).then(function (result) {
                    logger.info('getIPTC', result);
                    data.iptc = extractCategoryLabels(result.category_list);
                    cb(null, data);
                }).catch(function (err) {
                    logger.info('ERROR getIPTC', err);
                    cb(null, data);
                });
            } catch (error) {
                logger.info('ERROR getIPTC', error);
                cb(null, data);
            }
        }

        function getTags(data, cb) {
            try {
                MCApi.topicsExtraction({
                    tt: MCTopics.concepts,
                    lang: language,
                    txt: data.description
                }).then(function (result) {
                    logger.info('getTags', itemID, result);
                    data.tags = result
                        ? _.union(tags, result.concept_list.map(({form}) => form))
                        : tags;
                    cb(null, data);

                }).catch(function (err) {
                    logger.info('ERROR getTags', err);
                    //cb(err);
                    data.tags = tags;
                    cb(null, data);
                });
            }
            catch (error) {
                logger.info('ERROR getTags', error);
                data.tags = tags;
                cb(null, data);
            }
        }

        /*function processSyntaxis(data, cb) {
            if (language !== 'en') { // only works 'en'
                cb(null, data);
            }
            else {
                linguabuzzService.getSyntaxisAsync(itemID, data, {
                    Thesaurus: '2000',
                    LangIn: '1',
                    LangOut: '1'
                }).then(function (data) {
                    cb(null, data);
                }).catch(function (err) {
                    cb(err);
                })
            }
        }

        function processSemantics(data, cb) {
            linguabuzzService.getSemanticsAsync(itemID, data, {
                Thesaurus: '573',
                LangIn: language === 'en' ? '7' : '2',
                LangOut: language === 'en' ? '7' : '2'
            }).then(function (data) {
                cb(null, data);
            }).catch(function (err) {
                cb(err);
            })
        }*/
    })
};


/**
 * get document
 */
exports.addDocumentAsync = function (data) {
    return exports.processItemAsync(
        data.body.videoURL,
        data.body.language,
        data.body.typo,
        data.body.tags,
        data.body.description,
        data.body['audio-filter']
    )
        .then(function (result) {
            data.body.mediaURL = result.mediaURL;
            data.body.image = result.image;
            data.body.transcript = result.transcript;
            data.body.description = result.description;
            data.body.metas = result.metas;
            data.body.typo = result.typo;
            data.body.tags = result.tags;
            data.body.metas = result.metas;

            collectionService.findCollectionAsync({
                name: data.collectionName,
                project: data.projectName
            })
            .then(function (collection) {
                var helper = collectionHelper(collection);

                return slugs.setSlugsAsync(
                    helper.getName(),
                    helper.getSlugs(),
                    dataHelper.inputMapper(data.body, collection)
                ).then(function (res) {
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
}

/**
 * update document
 */
exports.updateDocumentAsync = function (data) {
    return collectionService.findCollectionAsync({
        name: data.collectionName,
        project: data.projectName
    })
        .then(function (collection) {
            var helper = collectionHelper(collection);
            return slugs.setSlugsAsync(
                helper.getName(),
                helper.getSlugs(),
                dataHelper.inputMapper(data.body, collection)
            ).then(function (res) {

                // dirty hack
                // should be enabled should be ignored as additional configuratoin
                // i.e. ignoredFields object
                /*var temp = _.clone(collection);
                 if (temp.extraSchema && temp.extraSchema.enabled) {
                 delete temp.extraSchema.enabled;
                 }*/

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
}

/**
 * clean documents
 */
exports.cleanDocumentsAsync = function (data) {
    return collectionService.findCollectionAsync({
        name: data.collectionName,
        project: data.projectName
    })
        .then(function (collection) {
            var helper = collectionHelper(collection);
            return elastic.cleanDocumentsAsync({
                index: helper.getIndex(),
                type: helper.getType()
            });
        })
}

/**
 * delete document
 */
exports.deleteDocumentAsync = function (data) {
    return collectionService.findCollectionAsync({
        name: data.collectionName,
        project: data.projectName
    })
        .then(function (collection) {
            var helper = collectionHelper(collection);
            return elastic.deleteDocumentAsync({
                index: helper.getIndex(),
                type: helper.getType(),
                id: data.id
            })
        })
}

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
            var helper = collectionHelper(collection);
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
}

/**
 * get document
 */
exports.getDocumentAsync = function (data) {
    return collectionService.findCollectionAsync({
        name: data.collectionName,
        project: data.projectName
    })
        .then(function (collection) {
            var helper = collectionHelper(collection);
            return elastic.getDocumentAsync({
                index: helper.getIndex(),
                type: helper.getType(),
                id: data.id
            })
        })
        .then(function (res) {
            var output = res._source;
            //console.log(res);
            //console.log(output);
            if (output.body) {
                output.body.id = res._id;
            }
            return res._source;
        })
}

/**
 * add multiple documents elastic
 * @param {Array} data documents
 * @param {String} projectName
 * @param {String} collectionName
 */
exports.addDocumentsAsync = function (data) {
    return collectionService.findCollectionAsync({
        name: data.collectionName,
        project: data.projectName
    })
        .then(function (collection) {
            var helper = collectionHelper(collection);

            // adding slugs mapping to key value datastore
            return slugs.setSlugsAsync(
                helper.getName(),
                helper.getSlugs(),
                dataHelper.inputMapper(data.body, collection)
            ).then(function (res) {
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
}

/**
 * add all documents to elastic
 * @param {Array} documents full data
 * @param {String} projectName
 * @param {String} collectionName
 * @param {Integer} batchSize
 * @return {String} inserted documents count
 */
exports.addAllDocuments = function (data, callback) {

    var documents = data.body;
    var limit = documents.length;
    var length = documents.length;

    var batchSize = data.batchSize || 1000;

    var count = 0;

    // needs to be refactored
    var projectName = data.projectName;
    var collectionName = data.collectionName;

    async.whilst(
        function () {
            return length > 0;
        },
        function (callback) {

            var removed = documents.splice(0, batchSize);
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
            })
            length -= removed.length;
        },
        function (err, res) {
            if (err) {
                console.log(err);
            }
            callback(null, limit + ' documents added');
        }
    );
}
