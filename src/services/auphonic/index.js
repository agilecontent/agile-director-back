const request = require('request');
var fs = require('fs');
var os = require('os');
var path = require('path');
var cloudinary = require('./../cloudinary');

// Credentials
const username = 'marc.lopez@agilecontent.com';
const password = 'audioApiPassword';
const auphonicAPIUrl = `https://${username}:${password}@auphonic.com/api`;

var DEFAULT_OPTIONS = {
    output: os.tmpdir() + '/audiophonic'
}

const AuphonicApi = {
    audioTransform: (audio, title, preset) => new Promise((resolve) => {
        const options = {
            url: `${auphonicAPIUrl}/simple/productions.json`,
            form: {
                title,
                preset,
                input_file: audio,
                action: 'start',
            }
        };

        request.post(options, (err, response, body) => {
            console.log('AUDIO TRANSFORM');
            console.log(JSON.parse(body).data);
            const {output_basename, uuid} = JSON.parse(body).data;
            resolve({output_basename, uuid});
        });
    }),
    getAudioData: (uuid) => new Promise((resolve) => {
        const options = {
            url: `${auphonicAPIUrl}/production/${uuid}.json`,
            headers: {
                'content-type': 'application/json',
            },
        };
        request.post(options, (err, response, body) => {
            resolve(body);
        });
    }),
    getAudio: (audioName, uuid) => new Promise((resolve, reject) => {
        console.log(`getAudio ${audioName} ${uuid}`);
        if (!fs.existsSync(DEFAULT_OPTIONS.output)) {
            fs.mkdirSync(DEFAULT_OPTIONS.output);
        }

        const filename = path.resolve(DEFAULT_OPTIONS.output, uuid);

        const options = {
            url: `${auphonicAPIUrl}/download/audio-result/${uuid}/${audioName}`,
        };

        request(options).pipe(fs.createWriteStream(filename))
            .on('end', function () {
                logger.info('calling cloudinary', filename);
                cloudinary.upload(filename, {typo: 'audio'}).then(function (result) {
                    resolve(result);
                }).catch(function (err) {
                    logger.info(err);
                    reject(err);
                });
            })
            .on('error', function error(err) {
                logger.info(err);
                reject(err);
            });
    }),
};

module.exports = AuphonicApi;