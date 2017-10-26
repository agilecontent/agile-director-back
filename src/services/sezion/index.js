const httpClient = require('./httpClient');
const { flatten } = require('lodash');

const SezionApi = {
    // Templates
    getTemplates: () => new Promise((resolve) => {
        httpClient.request((sezionAPI) => {
            sezionAPI.Template_List((err, result) => resolve(result));
        });
    }),
    createTemplate: (templateData) => new Promise((resolve, reject) => {
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
            Promise.all(videosRequests).then((videos) => resolve(flatten(videos)));
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
