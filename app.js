'use strict';

var server = require('./server');
var config = require('./config/index').get()
var logger = require('./config/logger')
var colors = require('colors')
//var figlet = require('figlet')
var statusHelper = require('./src/helpers/status');

console.log('Welcome'.green);
console.log()

server.init({
  elasticsearch: config.elasticsearch
})

server.start(function serverStart(serverInstance) {
  var host = serverInstance.address().address;
  var port = serverInstance.address().port;

  if (!host || host === '::') {
    host = '127.0.0.1'
  }

  return statusHelper.elasticsearch(config.elasticsearch.host)
  .then(function(result) {
    logger.info('started!'.green)

    if (result.elasticsearch_status === 200) {
      if (result.version >= '2.0') {
        logger.info('Your Elasticsearch version: %s is not recommended'.yellow, result.version)
        logger.info('Your api might not work properly'.yellow)
      } else {
        logger.info('Elasticsearch status -', 'OK'.green)
      }

      server.get('logger').info('Your API url - http://%s:%s/api/v1'.green, host, port)
    } else {
      logger.info('Elasticsearch status -', config.elasticsearch.host.red + ' is unavailable.'.red)
      logger.info('Your application might not work properly'.red)
      logger.info('Instructions about how to run Elasticsearch - https://github.com/server/server/blob/master/ELASTICSEARCH.md'.red)
      logger.info('To start app with your custom elasticsearch url:'.red)
      logger.info('ELASTICSEARCH_URL=http://localhost:9200 npm start'.red)
    }
  })
});
