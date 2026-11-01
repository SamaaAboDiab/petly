const dns = require("dns");
const mongoose = require("mongoose");

// Some ISP/router DNS resolvers answer normal lookups fine but refuse SRV
// queries (`querySrv ECONNREFUSED`), which is what `mongodb+srv://` URIs
// need to find the Atlas cluster's hosts. Falling back to public DNS avoids
// that class of connection failure without requiring each student to change
// their OS network settings.
if (process.env.MONGO_URI?.startsWith("mongodb+srv://")) {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

// On Vercel every request calls connectDB, so warm function instances reuse
// one connection instead of opening a new one per request.
let connecting = null;

/** Connects once; rejects on failure (callers decide whether that's fatal). */
const connectDB = () => {
  if (mongoose.connection.readyState === 1) return Promise.resolve();
  connecting ??= mongoose
    .connect(process.env.MONGO_URI)
    .then((conn) => console.log(`MongoDB connected: ${conn.connection.host}`))
    .catch((error) => {
      connecting = null;
      console.error(`MongoDB connection error: ${error.message}`);
      throw error;
    });
  return connecting;
};

module.exports = connectDB;
