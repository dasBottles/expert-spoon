module.exports = {
  apps: [
    {
      name: 'expert-spoon',
      cwd: '/root/expert-spoon',
      script: 'npm',
      args: 'run start -- --hostname 127.0.0.1 --port 3001',
      env: {
        NODE_ENV: 'production',
        DATABASE_URL: 'file:./dev.db',
        SPOONACULAR_API_KEY: '74e5f64741c94307b185b342c33170e6',
        NEXT_PUBLIC_BASE_PATH: '/expert-spoon'
      }
    }
  ]
}
