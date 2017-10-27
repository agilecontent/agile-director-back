AuphonicApi
=====
Module to help the transformation of audios throught the Auphonic API

##Dependencies
- "request": "^2.72.0"

##Config:
Open index file and set account credentials:
```javascript
const username = 'marc.lopez@agilecontent.com';
const password = 'audioApiPassword';
```

##Methods:
Use the presets file './presets.js' to config your custom presets

#### Audio Transform:
Transform your audio with a specific transformation preset.
Will return the output_basename and the uuid
```javascript
const presets = require('./presets');
AuphonicApi.audioTransform('http://audio.mp3', 'My audio title', presets.removeBackgroundNoise);
```

#### Get Audio Data:
Get all information related to a specific transformed audio as a json
```javascript
AuphonicApi.getAudioData('PGXwUp4Hj6RRj6gxDXwUYM');
```

#### Get Audio:
Get the resource of the specific audio
```javascript
AuphonicApi.getAudio('4159_ldptxq.mp3' ,'PGXwUp4Hj6RRj6gxDXwUYM');
```
