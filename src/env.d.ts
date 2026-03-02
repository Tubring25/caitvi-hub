/// <reference types="astro/client" />

type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

interface Env {
  DB: D1Database;
}

declare namespace App {
  interface Locals extends Runtime {
    db: import("drizzle-orm/d1").DrizzleD1Database;
  }
}
