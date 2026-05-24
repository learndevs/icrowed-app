// PM2 process manifest for the iCrowd web app.
//
// Usage on the VPS (run as the `icrowd` user):
//   cd /var/www/icrowed-app
//   pm2 start ecosystem.config.cjs --env production
//   pm2 save
//
// Why this exists:
//   - Runs the Next.js server **directly via node**, not via `npm start`.
//     `npm` as the PM2 entry process swallows signals → zombie node
//     processes and `EADDRINUSE :3000` loops on restart.
//   - `max_memory_restart` recycles the worker before OOM kills it.
//   - `kill_timeout` gives in-flight requests time to finish on deploy.
//   - `instances: 1` is safe with Supabase's shared pooler. Bump to "max"
//     ONLY after you've raised DATABASE_POOL_MAX accordingly.
const path = require("path");

const APP_ROOT = path.resolve(__dirname, "apps/web");
const NEXT_BIN = path.join(APP_ROOT, "node_modules/next/dist/bin/next");

module.exports = {
  apps: [
    {
      name: "icrowed-web",
      cwd: APP_ROOT,
      script: NEXT_BIN,
      args: ["start", "-p", process.env.PORT || "3000"],
      interpreter: "node",
      node_args: ["--enable-source-maps"],
      instances: Number(process.env.PM2_INSTANCES || 1),
      exec_mode: "fork",
      max_memory_restart: process.env.PM2_MAX_MEMORY || "768M",
      // Give the server time to drain HTTP requests before SIGKILL.
      kill_timeout: 10_000,
      listen_timeout: 15_000,
      // Restart loop protection — bail after 10 quick crashes.
      max_restarts: 10,
      restart_delay: 4_000,
      min_uptime: "30s",
      autorestart: true,
      watch: false,
      merge_logs: true,
      time: true,
      out_file: "/var/log/icrowed/out.log",
      error_file: "/var/log/icrowed/err.log",
      env: {
        NODE_ENV: "production",
        PORT: process.env.PORT || "3000",
        // Set DATABASE_POOL_MAX = pooler_limit / instances. Keep headroom for
        // queue workers and admin migrations.
        DATABASE_POOL_MAX: process.env.DATABASE_POOL_MAX || "10",
      },
    },
  ],
};
