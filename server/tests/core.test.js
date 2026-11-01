// End-to-end API check against an in-memory MongoDB (never touches Atlas).
const { MongoMemoryServer } = require("mongodb-memory-server");
const { spawn, execFileSync } = require("child_process");

const path = require("path");
const SERVER_DIR = path.resolve(__dirname, "..");
const PORT = 5055;
const API = `http://localhost:${PORT}/api`;

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

// 1x1 transparent PNG
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64"
);

(async () => {
  const mongo = await MongoMemoryServer.create();
  const env = {
    ...process.env,
    MONGO_URI: mongo.getUri("petly"),
    JWT_SECRET: "e2e-test-secret",
    JWT_EXPIRE: "1h",
    PORT: String(PORT),
    NODE_ENV: "test",
    CLIENT_URL: "http://localhost:5173",
  };

  execFileSync(process.execPath, ["src/seed/seed.js"], { cwd: SERVER_DIR, env, stdio: "inherit" });

  const server = spawn(process.execPath, ["server.js"], { cwd: SERVER_DIR, env, stdio: ["ignore", "pipe", "inherit"] });
  await new Promise((resolve) => server.stdout.on("data", (d) => String(d).includes("Server running") && resolve()));

  try {
    // ---------- Pets (public) ----------
    let r = await call("GET", "/pets");
    check("list pets", r.status === 200 && r.json.data.pets.length === 19, r.json);

    r = await call("GET", "/pets?category=cats");
    check("filter by category", r.json.data.pets.length === 4 && r.json.data.pets.every((p) => p.category === "cats"), r.json);

    r = await call("GET", "/pets?search=husk");
    check("partial search", r.json.data.pets.length === 1 && r.json.data.pets[0].name === "Siberian Husky", r.json);

    r = await call("GET", "/pets?sort=price-asc");
    check("sort by price", r.json.data.pets[0].price === 450, r.json.data.pets[0]);

    r = await call("GET", "/pets?category[$ne]=dogs");
    check("query operator injection ignored", r.status === 200 && r.json.data.pets.length === 19, r.json);

    r = await call("GET", "/pets?category=fish");
    check("unknown category rejected", r.status === 400, r.json);

    r = await call("GET", "/pets/categories");
    const counts = Object.fromEntries(r.json.data.categories.map((c) => [c.id, c.count]));
    check("category counts", counts.dogs === 6 && counts.cats === 4 && counts.birds === 9, counts);

    r = await call("GET", "/pets/golden-retriever");
    check(
      "pet by slug + seller + related",
      r.status === 200 && r.json.data.seller.name === "Ahmed Mohamed" && r.json.data.seller.listings === 6 && r.json.data.related.length === 4,
      r.json
    );
    const golden = r.json.data.pet;
    const ahmedId = r.json.data.seller.id;

    r = await call("GET", `/pets/${golden.id}`);
    check("pet by id", r.status === 200 && r.json.data.pet.slug === "golden-retriever", r.json);

    r = await call("GET", "/pets/does-not-exist");
    check("missing pet 404", r.status === 404, r.json);

    // ---------- Auth ----------
    r = await call("POST", "/auth/login", { body: { email: "demo@petly.com", password: "wrong" } });
    check("wrong password 401", r.status === 401, r.json);

    r = await call("POST", "/auth/login", { body: { email: { $gt: "" }, password: "petly123" } });
    check("body operator injection blocked", r.status === 400, r.json);

    r = await call("POST", "/auth/login", { body: { email: "demo@petly.com", password: "petly123" } });
    check("demo login", r.status === 200 && r.json.data.token && !("password" in r.json.data.user), r.json);
    const ahmedToken = r.json.data.token;

    r = await call("POST", "/auth/register", { body: { name: "Sara Ali", email: "sara@test.com", password: "secret12" } });
    check("register", r.status === 201 && r.json.data.user.role === "user", r.json);
    const saraToken = r.json.data.token;
    const saraId = r.json.data.user.id;

    r = await call("POST", "/auth/register", { body: { name: "Sara Two", email: "sara@test.com", password: "secret12" } });
    check("duplicate email rejected", r.status === 400, r.json);

    r = await call("POST", "/auth/register", { body: { name: "Hacker", email: "h@test.com", password: "secret12", role: "admin" } });
    check("cannot self-assign admin", r.status === 201 && r.json.data.user.role === "user", r.json);

    r = await call("GET", "/auth/me", { token: saraToken });
    check("me", r.json.data.user.email === "sara@test.com", r.json);

    r = await call("GET", "/cart");
    check("no token 401", r.status === 401, r.json);

    // ---------- Create listing with upload ----------
    const form = new FormData();
    Object.entries({
      name: "Golden Retriever",
      category: "dogs",
      age: "2 months",
      gender: "Female",
      location: "Cairo, Egypt",
      price: "7000",
      description: "Sweet puppy, very playful and loves kids a lot.",
      vaccinated: "true",
      pedigree: "false",
    }).forEach(([k, v]) => form.append(k, v));
    form.append("images", new Blob([PNG], { type: "image/png" }), "evil-name.html");

    r = await call("POST", "/pets", { token: saraToken, form });
    const saraPet = r.json?.data?.pet;
    check(
      "create listing with photo",
      r.status === 201 &&
        saraPet.slug === "golden-retriever-1" &&
        /^\/uploads\/pets\/.+\.png$/.test(saraPet.images[0]) &&
        saraPet.features.vaccinated === true &&
        saraPet.features.pedigree === false &&
        saraPet.seller === saraId,
      r.json
    );

    const img = await fetch(`http://localhost:${PORT}${saraPet.images[0]}`);
    check("uploaded image served as png", img.status === 200 && img.headers.get("content-type") === "image/png", img.status);

    const badForm = new FormData();
    badForm.append("name", "X");
    badForm.append("images", new Blob(["<script>alert(1)</script>"], { type: "text/html" }), "x.html");
    r = await call("POST", "/pets", { token: saraToken, form: badForm });
    check("non-image upload rejected", r.status === 400, r.json);

    r = await call("POST", "/pets", { token: saraToken, body: { name: "Cat", category: "cats" } });
    check("invalid listing rejected with field errors", r.status === 400 && r.json.errors.length >= 3, r.json);

    r = await call("POST", "/pets", {
      token: saraToken,
      body: { name: "Default Pic Cat", category: "cats", age: "1 year", gender: "Male", location: "Giza", price: 500, description: "Lovely calm cat that likes naps." },
    });
    check("listing without photo gets default", r.status === 201 && r.json.data.pet.images[0].includes("unsplash"), r.json);
    const saraCat = r.json.data.pet;

    r = await call("GET", "/pets/mine", { token: saraToken });
    check("my listings", r.json.data.pets.length === 2, r.json);

    r = await call("DELETE", `/pets/${saraPet.id}`, { token: ahmedToken });
    check("cannot delete someone else's listing", r.status === 403, r.json);

    r = await call("PUT", `/pets/${saraPet.id}`, { token: saraToken, body: { price: 6500 } });
    check("owner can update", r.status === 200 && r.json.data.pet.price === 6500, r.json);

    // Replacing the photo deletes the old file from disk.
    const oldImage = saraPet.images[0];
    const photoForm = new FormData();
    photoForm.append("images", new Blob([PNG], { type: "image/png" }), "new.png");
    r = await call("PUT", `/pets/${saraPet.id}`, { token: saraToken, form: photoForm });
    const newImage = r.json.data?.pet?.images?.[0];
    await new Promise((res) => setTimeout(res, 200));
    check(
      "replaced photo: new one served",
      r.status === 200 && newImage !== oldImage && (await fetch(`http://localhost:${PORT}${newImage}`)).status === 200,
      r.json
    );
    check("replaced photo: old file deleted", (await fetch(`http://localhost:${PORT}${oldImage}`)).status === 404);
    saraPet.images = [newImage];

    // ---------- Favorites ----------
    r = await call("POST", `/favorites/pets/${golden.id}`, { token: saraToken });
    check("favorite pet", r.json.data.favorited === true, r.json);

    r = await call("POST", `/favorites/sellers/${ahmedId}`, { token: saraToken });
    check("favorite seller", r.json.data.favorited === true, r.json);

    r = await call("POST", `/favorites/sellers/${saraId}`, { token: saraToken });
    check("cannot favorite yourself", r.status === 400, r.json);

    r = await call("GET", "/favorites", { token: saraToken });
    check(
      "get favorites",
      r.json.data.pets.length === 1 && r.json.data.sellers[0].name === "Ahmed Mohamed" && r.json.data.sellers[0].listings === 6,
      r.json
    );

    r = await call("POST", `/favorites/pets/${golden.id}`, { token: saraToken });
    check("unfavorite pet", r.json.data.favorited === false, r.json);

    r = await call("POST", `/favorites/pets/${saraCat.id}`, { token: ahmedToken });
    r = await call("DELETE", `/pets/${saraCat.id}`, { token: saraToken });
    r = await call("GET", "/favorites", { token: ahmedToken });
    check("deleted pet removed from others' favorites", r.json.data.pets.length === 0, r.json);

    // ---------- Cart + orders ----------
    const husky = (await call("GET", "/pets/siberian-husky")).json.data.pet;
    await call("POST", "/cart/items", { token: saraToken, body: { petId: golden.id } });
    r = await call("POST", "/cart/items", { token: saraToken, body: { petId: golden.id } });
    check("adding the same pet twice keeps one line", r.json.data.cart.items.length === 1, r.json.data.cart);
    r = await call("POST", "/cart/items", { token: saraToken, body: { petId: husky.id } });
    check("cart totals", r.json.data.cart.totalItems === 2 && r.json.data.cart.totalPrice === 8500 + 9200, r.json.data.cart);

    r = await call("POST", "/cart/items", { token: saraToken, body: { petId: saraPet.id } });
    check("cannot add own listing to cart", r.status === 400, r.json);

    r = await call("POST", "/orders/promo", { token: saraToken, body: { code: "petly10" } });
    check("valid promo", r.json.data.code === "PETLY10" && r.json.data.rate === 0.1, r.json);

    r = await call("POST", "/orders/promo", { token: saraToken, body: { code: "FREE100" } });
    check("invalid promo", r.status === 400, r.json);

    r = await call("POST", "/orders", {
      token: saraToken,
      body: { items: [{ petId: golden.id, price: 1 }], promoCode: "PETLY10", total: 1 },
    });
    check(
      "order uses server prices (ignores client price/total)",
      r.status === 201 && r.json.data.orders[0].total === 8500 - 850 + 100 && /^PT-[0-9A-F]{6}$/.test(r.json.data.orders[0].orderNumber),
      r.json
    );

    r = await call("GET", "/cart", { token: saraToken });
    check("ordered pet removed from cart, rest kept", r.json.data.cart.items.length === 1 && r.json.data.cart.items[0].pet.slug === "siberian-husky", r.json);

    r = await call("GET", "/orders/mine", { token: saraToken });
    check("my orders", r.json.data.orders.length === 1, r.json);

    r = await call("GET", "/orders/mine", { token: ahmedToken });
    check("orders are private per user", r.json.data.orders.length === 0, r.json);

    // ---------- Admin ----------
    r = await call("PATCH", `/users/${saraId}/verify`, { token: saraToken, body: { verified: true } });
    check("non-admin blocked from admin routes", r.status === 403, r.json);

    const adminToken = (await call("POST", "/auth/login", { body: { email: "admin@petly.com", password: "Admin123" } })).json.data.token;
    r = await call("PATCH", `/users/${saraId}/verify`, { token: adminToken, body: { verified: true } });
    check("admin verifies seller", r.status === 200 && r.json.data.user.verified === true, r.json);

    r = await call("DELETE", `/pets/${saraPet.id}`, { token: adminToken });
    check("admin can delete any listing", r.status === 200, r.json);
    await new Promise((res) => setTimeout(res, 200));
    check("deleted listing's photos removed from disk", (await fetch(`http://localhost:${PORT}${saraPet.images[0]}`)).status === 404);
  } finally {
    console.log(`\n${pass} passed, ${fail} failed`);
    server.kill();
    await mongo.stop();
    process.exit(fail ? 1 : 0);
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
