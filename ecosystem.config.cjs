module.exports = {
  apps: [{
    name: 'pabling',
    script: 'server.js',
    cwd: __dirname,
    env: { NODE_ENV: 'production' },
    instances: 1,
    exec_mode: 'fork',
  }],
};
