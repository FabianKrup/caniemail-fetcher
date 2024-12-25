const path = require('path');
const { exec } = require('@actions/exec');

process.chdir(path.join(__dirname, '..'));

(async () => {
    await exec('changeset', ['version']);
})();
