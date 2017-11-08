const httpClient = require('./httpClient');
const { flatten } = require('lodash');
const utils = require('./utils');
const { template } = require('./defaults');

const SezionApi = {
    // Templates
    getTemplates: () => new Promise((resolve) => {
        httpClient.request((sezionAPI) => {
            sezionAPI.Template_List((err, result) => resolve(result));
        });
    }),
    createTemplate: ({ name, description, templateObjectsList }) => new Promise((resolve, reject) => {
        // Set correct template structure
        const inputScriptsConfig = utils.createTemplateFromList(templateObjectsList);
        const templateData = Object.assign({}, template, {
            name,
            description,
            inputScripts: utils.getTemplateShape(inputScriptsConfig),
            videoInputs: utils.getObjectsTypeCountFromList(templateObjectsList),
        });

        console.log('TEMPLATE DATA');
        console.log(templateData);

        httpClient.request((sezionAPI) => {
            sezionAPI.Template_New(
                templateData,
                (err, result) => {
                    err && reject(JSON.stringify(err));
                    resolve(result)
                }
            );
        });
    }),

    // Videos
    newVideo: (videoData, templateId) => new Promise((resolve) => {
        httpClient.request((sezionAPI) => {
            sezionAPI.Template_Video_New(
                templateId,
                videoData,
                (err, result) => resolve(result)
            );
        });
    }),
    getVideosFromTemplateId: (templateId) => new Promise((resolve) => {
        httpClient.request((sezionAPI) => {
            sezionAPI.Template_Video_List(templateId, (err, result) => resolve(result));
        });
    }),
    getVideos: () => new Promise((resolve) => {
        SezionApi.getTemplates().then((templates) => {
            const videosRequests = templates.map(({ id }) => SezionApi.getVideosFromTemplateId(id));
            Promise.all(videosRequests)
                .then((videos) => flatten(videos))

                // Set the video links
                .then((videos) => videos.map((video) => {
                    return SezionApi.getVideoLinksById(video.id).then((links) => {
                        video.links = links[0];
                        return video;
                    })}
                ))

                // Resolve and order videos
                .then((videosPromises) => {
                    Promise.all(videosPromises).then(videos => {
                        resolve(videos.sort(utils.orderVideosComparer));
                    })
                });
        });
    }),
    getVideoLinksById: (videoId) => new Promise((resolve) => {
        httpClient.request((sezionAPI) => {
            sezionAPI.Video_Get_Links(
                videoId,
                (err, result) => resolve(result)
            );
        });
    }),

    // Media
    getMedias: () => new Promise((resolve) => {
        httpClient.request((sezionAPI) => {
            sezionAPI.Media_List((err, result) => resolve(result));
        });
    }),
};

module.exports = SezionApi;
