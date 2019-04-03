module.exports = {
  apps : [{
    name: "app2",
    script: "./app2.js",
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
    }
  }]
}