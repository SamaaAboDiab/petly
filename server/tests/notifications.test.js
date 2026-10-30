// Step 2 — notifications: triggers, live push, dedupe, read state, privacy.
const { io } = require("socket.io-client");
const { run, call, login, check, ORIGIN } = require("./helpers/harness");

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const connect = (token) =>
  new Promise((resolve, reject) => {
    const s = io(ORIGIN, { auth: { token }, transports: ["websocket"], reconnection: false });
    s.on("connect", () => resolve(s));
    s.on("connect_error", reject);
  });
const nextEvent = (socket, event, ms = 3000) =>
  new Promise((resolve) => {
    const t = setTimeout(() => resolve(null), ms);
    socket.once(event, (p) => {
      clearTimeout(t);
      resolve(p);
    });
  });
const list = async (token) => (await call("GET", "/notifications", { token })).json.data;

run(async () => {
  const ahmed = await login("demo@petly.com");
  const admin = await login("admin@petly.com", "Admin123");
  const golden = (await call("GET", "/pets/golden-retriever")).json.data; // Ahmed's pet

  // Welcome on register
  const reg = (await call("POST", "/auth/register", { body: { name: "Sara Ali", email: "sara@test.com", password: "secret12" } })).json.data;
  await wait(300);
  let data = await list(reg.token);
  check("welcome notification on register", data.notifications.length === 1 && data.notifications[0].type === "system" && data.unread === 1, data);

  // Favorite -> live push to seller, deduped on re-favorite
  const ahmedSocket = await connect(ahmed.token);
  const pushed = nextEvent(ahmedSocket, "notification:new");
  await call("POST", `/favorites/pets/${golden.pet.id}`, { token: reg.token });
  const live = await pushed;
  check("seller gets live 'favorite' push", live?.type === "favorite" && live.title === "Sara Ali saved your Golden Retriever" && live.link === "/app/pets/golden-retriever", live);
  check("dedupeKey not exposed", live && !("dedupeKey" in live), live);

  await call("POST", `/favorites/pets/${golden.pet.id}`, { token: reg.token }); // unfavorite
  await call("POST", `/favorites/pets/${golden.pet.id}`, { token: reg.token }); // favorite again
  await wait(300);
  data = await list(ahmed.token);
  check("re-favorite is deduped", data.notifications.filter((n) => n.type === "favorite").length === 1, data.notifications);

  // Own pet favorite -> no notification
  await call("POST", `/favorites/pets/${golden.pet.id}`, { token: ahmed.token });
  await wait(300);
  data = await list(ahmed.token);
  check("no notification for favoriting your own pet", data.notifications.filter((n) => n.type === "favorite").length === 1, data.notifications);

  // Follow
  await call("POST", `/favorites/sellers/${golden.seller.id}`, { token: reg.token });
  await wait(300);
  data = await list(ahmed.token);
  check("follow notification", data.notifications.some((n) => n.type === "follow" && n.title.includes("Sara Ali")), data.notifications);

  // Order -> buyer 'order' + seller 'sale'
  await call("POST", "/orders", { token: reg.token, body: { items: [{ petId: golden.pet.id }] } });
  await wait(400);
  data = await list(reg.token);
  check("buyer gets order confirmation", data.notifications.some((n) => n.type === "order" && /^Order #PT-/.test(n.title)), data.notifications);
  data = await list(ahmed.token);
  check("seller gets sale notification", data.notifications.some((n) => n.type === "sale" && n.title === "Sara Ali ordered your Golden Retriever"), data.notifications);
  check("seller unread count", data.unread === 3, data.unread);

  // Verification
  await call("PATCH", `/users/${reg.user.id}/verify`, { token: admin.token, body: { verified: true } });
  await wait(300);
  data = await list(reg.token);
  check("verified notification", data.notifications.some((n) => n.type === "verified"), data.notifications);

  // Read state + privacy
  const someone = (await list(ahmed.token)).notifications[0];
  let r = await call("POST", `/notifications/${someone.id}/read`, { token: reg.token });
  check("cannot mark someone else's notification", r.status === 404, r.json);
  r = await call("POST", `/notifications/${someone.id}/read`, { token: ahmed.token });
  data = await list(ahmed.token);
  check("mark one read", r.status === 200 && data.unread === 2, data.unread);
  await call("POST", "/notifications/read-all", { token: ahmed.token });
  data = await list(ahmed.token);
  check("mark all read", data.unread === 0 && data.notifications.every((n) => n.read), data);

  r = await call("GET", "/notifications");
  check("no token 401", r.status === 401);

  ahmedSocket.close();
});
