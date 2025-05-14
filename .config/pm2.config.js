
module.exports = {
  apps: [
    {
      name: 'allora-os',
      script: 'npm',
      args: 'run start',
      instances: 'max',
      exec_mode: 'cluster',
      watch: false,
      env: {
        NODE_ENV: 'production',
      },
      env_staging: {
        NODE_ENV: 'staging',
      },
    },
  ],
};
