const { type } = require('./enum');

module.exports = {
    createDelayedStart: (start, delay) => [start, delay],
    getObjectsTypeCountFromList: (objectsList) => {
        const typesCount = {
            [type.AUDIO]: 0,
            [type.VIDEO]: 0,
            [type.IMAGE]: 0,
            [type.TEXT]: 0,
        };
        objectsList.forEach(({ type }) => typesCount[type]++);
        return typesCount;
    },
    getTemplateShape: (template) => [JSON.stringify(template)],
    createTemplateFromList: (objectsList) => {
        objectsList.push({
            [type.IMAGE]: {
                id: 'object0',
                sezionID: '5a09c02e077d087843ecb8ad',
                name: 'first',
                duration: 3000,
            },
        });
        const config = objectsList.reduce((template, obj, index) => {
            console.log(obj);
            const getPrevObjectType = (prevObject) => Object.keys(prevObject)[0];

            // Get previous object
            const prevObject = index > 0 ? template[index - 1] : null;

            // Set start property depending on previous objects
            const play = prevObject ? `${prevObject[getPrevObjectType(prevObject)].id}.end` : 0;

            // Create object configuration
            const objectConfig = {
                [obj.type]: {
                    id: `object${index}`,
                    play,
                },
            };

            // Set object duration
            if (obj.duration) {
                objectConfig[obj.type].duration = parseInt(obj.duration);
            }

            template.push(objectConfig);

            // Add text object
            if(obj.text) {
                // Set play property depending on delay configuration
                const play = `object${index}.start`;

                // Create object configuration
                const objectConfig = {
                    [type.TEXT]: {
                        id: `object${index}text`,
                        play,
                        zIndex: 3,
                        duration: obj.textDuration ? parseInt(obj.textDuration) : `object${index}.duration`,
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

                    },
                };

                if(obj.textDuration) {
                    objectConfig[type.TEXT].duration = parseInt(obj.textDuration);
                }

                template.push(objectConfig);
            }

        return template;
    }, []);
        config.push({
            [type.IMAGE]: {
                id: 'object0',
                sezionID: '5a09c02e077d087843ecb8ad',
                name: 'last',
                duration: 3000,
            },
        });
        return config;
    },
    orderVideosComparer: (a, b) => {
        a = new Date(a.date);
        b = new Date(b.date);
        return a > b ? -1 : a < b ? 1 : 0;
    },
    createInputMediasShape: (items) => items.reduce((inputMedias, item, index) => {
        console.log(item);
        const itemConfig = {
            inputID: `object${index}`,
            http: item.http,
            type: item.type,
            name: item.type + 'item'
        };

        inputMedias.push(itemConfig);

        if(item.text) {
            const itemTextConfig = {
                inputID: `object${index}text`,
                text: item.text,
                type: type.TEXT,
                name: type.TEXT + 'item'
            };
            inputMedias.push(itemTextConfig);
        }

        return inputMedias;
    }, []),
};