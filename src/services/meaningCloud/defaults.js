// Credentials
const MCKey = '0676500cf1371972cc707010b3f456ca';

module.exports = {
    options: {
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        form: {
            key: MCKey,
        },
    },
    apiUrl: 'http://api.meaningcloud.com',
};