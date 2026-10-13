module.exports = {
  apps: [
    {
      name: "aura-jewels-admin",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3001",

      exec_mode: "fork",
      instances: 1,

      autorestart: true,
      watch: false,
      max_memory_restart: "500M",

      env: {
        NODE_ENV: "production"
      },

      log_date_format: "YYYY-MM-DD HH:mm:ss",

      min_uptime: "10s",
      max_restarts: 10,

      kill_timeout: 5000,
      listen_timeout: 8000
    }
  ]
};
