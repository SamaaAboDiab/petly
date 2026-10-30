// Runs the API against a throwaway in-memory MongoDB, seeded with the demo
// data. Useful for demos or trying changes without touching Atlas:
//   npm run dev:memory
// Everything is lost when the process stops.
const path = require("path");
const { spawn, execFileSync } = require("child_process");
const { MongoMemoryServer } = require("mongodb-memory-server");

const SERVER_DIR = path.resolve(__dirname, "..");

(async () => {
  const mongo = await MongoMemoryServer.create();
  // Explicit env wins over .env (dotenv never overrides existing variables).
  const env = {
    ...process.env,
    MONGO_URI: mongo.getUri("petly"),
    JWT_SECRET: process.env.JWT_SECRET || "dev-memory-secret",
    PORT: process.env.PORT || "5000",
  };

  execFileSync(process.execPath, ["src/seed/seed.js"], { cwd: SERVER_DIR, env, stdio: "inherit" });
  const server = spawn(process.execPath, ["server.js"], { cwd: SERVER_DIR, env, stdio: "inherit" });

  const stop = async () => {
    server.kill();
    await mongo.stop();
    process.exit(0);
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
})();
