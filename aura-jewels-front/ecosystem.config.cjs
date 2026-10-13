module.exports = {
  apps: [
    {
      name: "aura-jewels-storefront",
      script: "npm",
      args: "start",

      // Mode
      exec_mode: "fork",
      instances: 1,

      // Auto restart
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",

      // Environment
      env: {
        NODE_ENV: "production",
        PORT: 3000
      },

      // Logs
      log_date_format: "YYYY-MM-DD HH:mm:ss",

      // Restart control
      min_uptime: "10s",
      max_restarts: 10,

      // Kill timeout
      kill_timeout: 5000,

      // Time for graceful shutdown
      listen_timeout: 8000
    }
  ]
};
