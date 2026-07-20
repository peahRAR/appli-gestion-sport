const path = require('path');

module.exports = {
    apps: [{
        name: "api-start",
        // Resolved relative to this file's own location on disk, so it's
        // correct regardless of the shell's cwd when `pm2 reload` runs.
        cwd: path.join(__dirname, 'back-end'),
        // nest build emits dist/src/main.js here (data-source.ts at the repo
        // root makes tsc infer a rootDir that preserves the src/ folder),
        // not dist/main.js.
        script: 'dist/src/main.js',
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',
        env: {
            NODE_ENV: 'production',
        },
    }]
};
