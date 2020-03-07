module.exports = {
  apps: [{
    name: 'Black Angus',
    script: 'ts-node',
    args: 'src/index.ts',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      CONFIG_FILE: './env/config.json'
    }
  }]
}
