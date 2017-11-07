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
    createTemplateFromList: (objectsList) => objectsList.reduce((template, obj, index) => {
        const getPrevObjectType = (prevObject) => Object.keys(prevObject)[0];

        // Get previous object
        const prevObject = index > 0 ? template[index - 1] : null;

        // Set start property depending on previous objects
        const start = prevObject ? `${prevObject[getPrevObjectType(prevObject)].id}.end` : 0;

        // Set play property depending on delay configuration
        const play = obj.delay ? [start, obj.delay] : start;

        // Create object configuration
        const objectConfig = {
            [obj.type]: {
                id: `object-${index}`,
                play,
            },
        };

        // Set object duration
        if (obj.duration) {
            objectConfig[obj.type].duration = obj.duration;
        }

        template.push(objectConfig);
        return template;
    }, []),
    orderVideosComparer: (a, b) => {
        a = new Date(a.date);
        b = new Date(b.date);
        return a > b ? -1 : a < b ? 1 : 0;
    },
    createInputMediasShape: (items) => items.reduce((inputMedias, item, index) => {
        const itemConfig = {
            inputID: `object-${index}`,
            http: item.http,
            type: item.type
        };
        inputMedias.push(itemConfig);
        return inputMedias;
    }, []),
};