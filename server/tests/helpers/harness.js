// Shared test harness: starts a seeded in-memory MongoDB and the real server
// process, runs the checks, then tears everything down. Never touches Atlas:
// MONGO_URI is overridden here, and dotenv does not override existing vars.
const path = require("path");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { spawn, execFileSync } = require("child_process");

const PORT = 5055;
const ORIGIN = `http://localhost:${PORT}`;
const API = `${ORIGIN}/api`;

let pass = 0;
let fail = 0;
const check = (name, cond, extra = "") => {
  cond ? pass++ : fail++;
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}${cond ? "" : "  -> " + JSON.stringify(extra).slice(0, 300)}`);
};

const call = async (method, path, { body, token, form } = {}) => {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers["Content-Type"] = "application/json";
  const res = await fetch(API + path, { method, headers, body: form ?? (body ? JSON.stringify(body) : undefined) });
  return { status: res.status, json: await res.json().catch(() => null) };
};

const login = async (email, password = "petly123") =>
  (await call("POST", "/auth/login", { body: { email, password } })).json.data;

const SERVER_DIR = path.resolve(__dirname, "..", "..");

async function run(tests, extraEnv = {}) {
  const serverDir = SERVER_DIR;
  const mongo = await MongoMemoryServer.create();
  const env = {
    ...process.env,
    MONGO_URI: mongo.getUri("petly"),
    JWT_SECRET: "e2e-test-secret",
    JWT_EXPIRE: "1h",
    PORT: String(PORT),
    NODE_ENV: "test",
    CLIENT_URL: "http://localhost:5173",
    ...extraEnv,
  };
  execFileSync(process.execPath, ["src/seed/seed.js"], { cwd: serverDir, env, stdio: "ignore" });
  const server = spawn(process.execPath, ["server.js"], { cwd: serverDir, env, stdio: ["ignore", "pipe", "inherit"] });
  server.stdout.on("data", (d) => (serverOutput.text += String(d)));
  await new Promise((resolve) => server.stdout.on("data", (d) => String(d).includes("Server running") && resolve()));

  try {
    await tests();
  } catch (error) {
    fail++;
    console.log("FAIL  test crashed:", error);
  } finally {
    console.log(`\n${pass} passed, ${fail} failed`);
    server.kill();
    await mongo.stop();
    process.exit(fail ? 1 : 0);
  }
}

// Everything the server printed (e.g. dev-mode emails).
const serverOutput = { text: "" };

module.exports = { run, call, login, check, ORIGIN, API, serverOutput };
