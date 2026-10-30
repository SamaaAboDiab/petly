// Strips keys that start with "$" or contain "." from JSON bodies,
// recursively. Without this, a body like { "email": { "$gt": "" } }
// would reach Mongoose as a query operator (NoSQL injection). Query strings
// are already safe thanks to the "simple" query parser set in app.js.
const isUnsafeKey = (key) => key.startsWith("$") || key.includes(".");

const clean = (value) => {
  if (Array.isArray(value)) return value.map(clean);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !isUnsafeKey(key))
        .map(([key, val]) => [key, clean(val)])
    );
  }
  return value;
};

const sanitize = (req, res, next) => {
  if (req.body) req.body = clean(req.body);
  next();
};

module.exports = sanitize;
