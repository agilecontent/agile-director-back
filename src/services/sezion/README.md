SezionAPI++
=====
Module to help the creation of videos throught the SezionApi

##Dependencies
- "barrister": "^0.1.8"
- "lodash": "^4.17.4"

##Config:
Open httpClient file and set account credentials:
```javascript
const accountID = '56fa7d608d3414a9fa708553';
const accountSecret = 'zk8di2ma5UDpLi6xUABwJPipSnQvI8FkB3XARLGqGkk=';
```

##Methods:
Notice the use of './enum.js' for the types:
```javascript
const { type } = require('./enum');
```

#### New Video:
Create a new video from template
```javascript
const templateId = 'XXXX';
const videoData = {
    name: "Sezion video1",
    description: "Creating a new video",
    inputMedias: [{
        inputID: "video1",
        type: type.VIDEO,
        name: "Text for video",
        http: 'http://video.mp4',
    },
    {
        inputID: "text1",
        type: type.TEXT,
        name: "Text for video",
        text: 'Hi',
    }
    ],
};
sezionApi.newVideo(videoData, templateId);
```

#### Get Videos:
Get all all videos in your Sezion Account as an array
```javascript
sezionApi.getVideos();
```

#### Get Templates:
Get all templates as an array
```javascript
sezionApi.getTemplates();
```

#### Get video links by videoId:
Get a single object with all the links to access your video
```javascript
sezionApi.getVideoLinksById(videoId);
```

#### Create template:
Create a new template
```javascript
const templateData = {
    name: "Template Name 20",
    description: "Template Description",
    templateObjectsList: [
        {
            type: type.IMAGE,
            duration: 2000,
        },
        {
            type: type.TEXT,
            delay: 1000,
            duration: 5000,
        },
        {
            type: type.VIDEO,
        },
    ],
};
sezionApi.createTemplate(templateData);
```

#### Get all medias:
Get all medias in your Sezion account as an array
```javascript
sezionApi.getMedias();
```
