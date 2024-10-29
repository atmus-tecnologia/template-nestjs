module.exports = {
  apps: [
    {
      name: 'smartlytics-api',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'cluster',
      max_memory_restart: '1024M',
      watch: false,
      ignore_watch: ['node_modules', 'public'],
      node_args: '--no-warnings',
    },
  ],
};
