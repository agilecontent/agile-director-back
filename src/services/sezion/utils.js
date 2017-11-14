const { type } = require('./enum');
const defaults = require('./defaults');

module.exports = {
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

        // Get previous and next objects
        const prevObject = index > 0 ? template[index - 1] : null;
        const prevObjType = prevObject && getPrevObjectType(prevObject);

        // Set start property depending on previous objects
        const play = prevObject
            ? (prevObjType === type.AUDIO)
                ? `${prevObject[prevObjType].id}.start`
                : `${prevObject[prevObjType].id}.end`
            : 0;

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

            // Create text object configuration
            const objectConfig = Object.assign({}, defaults.text, {
                id: `object${index}text`,
                play,
            });

            const textItem = {
                [type.TEXT]: objectConfig,
            };

            if (obj.textDuration) {
                textItem[type.TEXT].duration = parseInt(obj.textDuration);
            }

            template.push(textItem);
        }

        return template;
    }, []),
    orderVideosComparer: (a, b) => {
        a = new Date(a.date);
        b = new Date(b.date);
        return a > b ? -1 : a < b ? 1 : 0;
    },
    createInputMediasShape: (items) => {
        // Presentation
        items.unshift({
            http: 'http://res.cloudinary.com/dnmfgg5t7/image/upload/v1510589398/first_upgoyv.png',
            type: type.IMAGE,
            duration: 3000,
        });

        // Last
        items.push({
            http: 'http://res.cloudinary.com/dnmfgg5t7/image/upload/v1510589377/last_rauez3.png',
            type: type.IMAGE,
            duration: 3000,
        });

        return items.reduce((inputMedias, item, index) => {
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
        }, []);
    }
};