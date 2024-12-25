import { dirname, join } from 'path';
import { exec, getExecOutput } from '@actions/exec';

import packageJson from '../package.json' assert { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { version } = packageJson;
const tag = `v${version}`;
const releaseLine = `v${version.split('.')[0]}`;

process.chdir(join(__dirname, '..'));

(async () => {
    const { exitCode, stderr } = await getExecOutput(
        `git`,
        ['ls-remote', '--exit-code', 'origin', '--tags', `refs/tags/${tag}`],
        {
            ignoreReturnCode: true,
        },
    );
    if (exitCode === 0) {
        console.log(
            `Action is not being published because version ${tag} is already published`,
        );
        return;
    }
    if (exitCode !== 2) {
        throw new Error(`git ls-remote exited with ${exitCode}:\n${stderr}`);
    }

    await exec('git', ['checkout', '--detach']);
    await exec('git', ['add', '--force', 'dist']);
    await exec('git', ['commit', '-m', tag]);

    await exec('changeset', ['tag']);

    await exec('git', [
        'push',
        '--force',
        '--follow-tags',
        'origin',
        `HEAD:refs/heads/${releaseLine}`,
    ]);
})();
