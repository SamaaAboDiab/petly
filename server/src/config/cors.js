// Shared by the REST API (app.js) and Socket.IO (socket/index.js) so both
// accept exactly the same frontends.
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

module.exports = { allowedOrigins };
