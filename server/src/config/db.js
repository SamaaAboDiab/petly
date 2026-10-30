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

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
