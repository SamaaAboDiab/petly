require("dotenv").config();

// Fail fast with a clear message instead of crashing later on the first
// login (jwt.sign) or the first query (mongoose.connect).
const REQUIRED_ENV = ["MONGO_URI", "JWT_SECRET"];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Missing environment variables: ${missing.join(", ")}. See README`);
  process.exit(1);
}

const http = require("http");
const app = require("./src/app");
const connectDB = require("./src/config/db");
const { initSocket } = require("./src/socket");
const { allowedOrigins } = require("./src/config/cors");

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    // Express and Socket.IO share one HTTP server (and one port).
    const server = http.createServer(app);
    initSocket(server, allowedOrigins);

    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch(() => process.exit(1));
