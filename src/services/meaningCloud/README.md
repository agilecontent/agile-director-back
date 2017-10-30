AuphonicApi
=====
Module to help the use of meaningCloud api

##Dependencies
- "request": "^2.72.0"

##Config:
Open defaults file and set account credentials:
```javascript
const MCKey = '0676500cf1371972cc707010b3f456ca';
```

##Methods:
Use the models file './models.js' to get the models types

#### Text Classification:
Text Classification assigns one or more classes to a document according to their content. 
```javascript
const MCModels = require('./models');
MCApi.textClassification(MCModels.spanish.IPTC, text);
```

#### Topics Extraction:
Topics Extraction is MeaningCloud's solution for extracting the different elements present in sources of information.
```javascript
const MCTopics = require('./topics');
MCApi.topicsExtraction(MCTopics.all, text, 'es');
```

