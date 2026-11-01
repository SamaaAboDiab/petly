const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const routes = require("./routes");
const { allowedOrigins } = require("./config/cors");
const sanitize = require("./middleware/sanitize");
const { apiLimiter } = require("./middleware/rateLimit");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// "simple" parses `?category[$ne]=x` as a plain key named "category[$ne]"
// instead of a nested object, so query strings can't smuggle Mongo operators
// into filters (NoSQL injection).
app.set("query parser", "simple");

// Behind the host's proxy (Render), so rate limiting sees the real client IP.
if (process.env.NODE_ENV === "production") app.set("trust proxy", 1);

// Uploaded images are loaded by the frontend from another origin in
// production, so allow cross-origin reads of static resources.
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

app.use(
  cors({
    origin: (origin, callback) => {
      // Requests without an Origin header (Postman, curl, same-origin) are allowed.
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error("Not allowed by CORS"));
    },
  })
);

app.use(express.json({ limit: "100kb" }));
app.use(sanitize);

// Serves uploaded pet images (see src/middleware/upload.js) at
// /uploads/pets/<filename> - the URL saved on Pet.images.
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    data: { message: "Petly API is running" },
  });
});

app.use("/api", apiLimiter, routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
