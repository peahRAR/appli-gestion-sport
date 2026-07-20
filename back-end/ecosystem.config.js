const path = require('path');

module.exports = {
    apps: [{
        name: "api-start",
        // Deployed to appli-gestion-sport/ecosystem.config.js (the deploy
        // workflow's `pm2 start` command targets that exact path, with
        // strip_components stripping the "back-end/" prefix on copy — see
        // deploy-back.yaml) — so __dirname is appli-gestion-sport/, and the
        // app itself lives one level down in appli-gestion-sport/back-end/.
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
