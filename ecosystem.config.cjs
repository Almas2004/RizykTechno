module.exports = {
  apps: [
    {
      name: "rizyktechno",
      script: "dist-server/index.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
