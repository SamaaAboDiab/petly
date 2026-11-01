// Vercel serverless entry: the whole Express API runs as one function.
// vercel.json rewrites /api/* here, and Express still sees the original URL.
// Socket.IO needs a long-running server, so on Vercel the frontend falls back
// to polling for chat and notifications (see SocketContext).
import app from '../server/src/app.js';
import connectDB from '../server/src/config/db.js';

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch {
    return res.status(503).json({ success: false, message: 'Database unavailable, please try again shortly' });
  }
  return app(req, res);
}
