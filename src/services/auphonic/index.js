const request = require('request');

// Credentials
const username = 'marc.lopez@agilecontent.com';
const password = 'audioApiPassword';
const auphonicAPIUrl = `https://${username}:${password}@auphonic.com/api`;

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
            const { output_basename, uuid } = JSON.parse(body).data;
            resolve({ output_basename, uuid });
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
    getAudio: (audioName, uuid) => new Promise((resolve) => {
        const options = {
            url: `${auphonicAPIUrl}/download/audio-result/${uuid}/${audioName}`,
        };
        request(options, (err, response, body) => {
            resolve(body);
        });
    }),
};

module.exports = AuphonicApi;