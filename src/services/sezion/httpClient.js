const barrister = require('barrister');
const accountID = '56fa7d608d3414a9fa708553';
const accountSecret = 'zk8di2ma5UDpLi6xUABwJPipSnQvI8FkB3XARLGqGkk=';

const client = barrister.httpClient(`https://sezion.com/api?accountID=${accountID}&accountSecret=${accountSecret}`);
client.enableTrace();

const httpClient = {
    request: (request) => {
        client.loadContract(() => {
            const sezionAPI = client.proxy("SezionAPI");
            request(sezionAPI);
        });
    },
};

module.exports = httpClient;
