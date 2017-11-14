const { type } = require('./enum');

module.exports.template = {
    videoOutput: { type: "sezion" },
    outProfiles: ["MP4_H264_AAC_1280x720_24fps", "WEBM_VP8_VORBIS_640x480_24fps"],
};

module.exports.text = {
    zIndex: 3,
    textLines: 2,
    textSizeFit: 'true',
    textAlignV: 'bottom',
    size: {
        h: 0.2,
        w: 0.9
    },
    "events": [
        {
            "start": {
                "imageFadeIn": 500
            }
        },
        {
            "end - 500": {
                "imageFadeOut": 500
            }
        }
    ],
    "position": {
        "x": 0.05,
        "y": 0.03
    },
};