// Shared by the REST API (app.js) and Socket.IO (socket/index.js) so both
// accept exactly the same frontends.
const configured = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

// On Vercel the frontend and API share a domain; browsers still send an
// Origin header on POST/PUT, so allow the deployment's own URLs too.
const vercelHosts = [process.env.VERCEL_PROJECT_PRODUCTION_URL, process.env.VERCEL_BRANCH_URL, process.env.VERCEL_URL]
  .filter(Boolean)
  .map((host) => `https://${host}`);

const allowedOrigins = [...new Set([...configured, ...vercelHosts])];

/** Public frontend URL, used in links sent by email (password reset). */
const clientUrl = process.env.CLIENT_URL
  ? configured[0]
  : vercelHosts[0] || configured[0];

module.exports = { allowedOrigins, clientUrl };
