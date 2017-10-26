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
        const prevObject = index > 0 ? template[index - 1] : null;
        const start = prevObject ? `${prevObject[getPrevObjectType(prevObject)].id}.end` : 0;
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
    }, [])
};