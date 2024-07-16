module.exports = {
    apps: [{
        name: "api-start",
        script: "./back-end/dist/main.js",
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',
        env: {
            NODE_ENV: 'development'
        },
        env_production: {
            NODE_ENV: 'production',
            GOOGLE_APPLICATION_CREDENTIALS: '/home/${{ secrets.SERVER_USER }}/appli-gestion-sport/back-end/mma-baisieux-f9fcae8661ce.json'
        }
    }]
};
