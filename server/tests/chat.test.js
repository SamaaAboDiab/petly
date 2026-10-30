// Step 1 — chat: REST + Socket.IO, membership and validation.
const { io } = require("socket.io-client");
const { run, call, login, check, ORIGIN } = require("./helpers/harness");

const connect = (token) =>
  new Promise((resolve, reject) => {
    const socket = io(ORIGIN, { auth: { token }, transports: ["websocket"], reconnection: false });
    socket.on("connect", () => resolve(socket));
    socket.on("connect_error", (err) => reject(err));
  });

const nextEvent = (socket, event, ms = 3000) =>
  new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), ms);
    socket.once(event, (payload) => {
      clearTimeout(timer);
      resolve(payload);
    });
  });

run(async () => {
  const ahmed = await login("demo@petly.com");
  const mariam = await login("mariam@petly.com");
  const omar = await login("omar@petly.com");
  const chow = (await call("GET", "/pets/chow-chow")).json.data;
  const mariamId = chow.seller.id;

  // --- Socket auth ---
  let rejected = false;
  try {
    await connect("not-a-token");
  } catch {
    rejected = true;
  }
  check("socket rejects bad token", rejected);

  const mariamSocket = await connect(mariam.token);
  const ahmedSocket = await connect(ahmed.token);
  const omarSocket = await connect(omar.token);
  check("socket connects with valid token", mariamSocket.connected && ahmedSocket.connected);

  // --- Start conversation ---
  let r = await call("POST", "/conversations", { token: ahmed.token, body: { sellerId: mariamId, petId: chow.pet.id } });
  check("start conversation", r.status === 200 && r.json.data.conversation.other.name === "Mariam Adel" && r.json.data.conversation.pet.slug === "chow-chow", r.json);
  const convId = r.json.data.conversation.id;

  r = await call("POST", "/conversations", { token: ahmed.token, body: { sellerId: mariamId } });
  check("same pair reuses conversation", r.json.data.conversation.id === convId, r.json);

  r = await call("POST", "/conversations", { token: ahmed.token, body: { sellerId: ahmed.user.id } });
  check("cannot message yourself", r.status === 400, r.json);

  r = await call("GET", "/conversations", { token: mariam.token });
  check("empty conversation hidden from recipient", r.json.data.conversations.length === 0, r.json);

  r = await call("GET", "/conversations", { token: ahmed.token });
  check("initiator sees new conversation", r.json.data.conversations.length === 1, r.json);

  // --- Send + realtime delivery ---
  const mariamGets = nextEvent(mariamSocket, "message:new");
  const omarGets = nextEvent(omarSocket, "message:new", 1000);
  r = await call("POST", `/conversations/${convId}/messages`, { token: ahmed.token, body: { text: "  Hi! Is the Chow Chow still available?  " } });
  check("send message", r.status === 201 && r.json.data.message.text === "Hi! Is the Chow Chow still available?", r.json);

  const pushed = await mariamGets;
  check(
    "recipient receives message in real time",
    pushed?.message.text === "Hi! Is the Chow Chow still available?" && pushed.conversation.unread === 1 && pushed.conversation.other.name === "Ahmed Mohamed",
    pushed
  );
  check("outsider receives nothing", (await omarGets) === null);

  r = await call("GET", "/conversations/unread-count", { token: mariam.token });
  check("unread count", r.json.data.unread === 1, r.json);

  // --- Typing ---
  const typing = nextEvent(ahmedSocket, "typing");
  mariamSocket.emit("typing", { conversationId: convId });
  check("typing indicator relayed", (await typing)?.conversationId === convId);

  const omarTyping = nextEvent(ahmedSocket, "typing", 800);
  omarSocket.emit("typing", { conversationId: convId });
  check("outsider typing ignored", (await omarTyping) === null);
  omarSocket.emit("typing", { conversationId: { $ne: null } });
  omarSocket.emit("typing", null);
  check("bad typing payloads don't crash server", (await call("GET", "/pets?limit=1")).status === 200);

  // --- Reply, read, pagination ---
  await call("POST", `/conversations/${convId}/messages`, { token: mariam.token, body: { text: "Yes! Want to visit Saturday?" } });
  for (let i = 1; i <= 35; i++) {
    await call("POST", `/conversations/${convId}/messages`, { token: ahmed.token, body: { text: `msg ${i}` } });
  }

  r = await call("GET", `/conversations/${convId}/messages`, { token: mariam.token });
  const page1 = r.json.data;
  check("first page = newest 30, oldest first", page1.messages.length === 30 && page1.messages[29].text === "msg 35" && page1.hasMore === true, page1.messages.map((m) => m.text));

  r = await call("GET", `/conversations/${convId}/messages?before=${encodeURIComponent(page1.messages[0].createdAt)}`, { token: mariam.token });
  check("older page", r.json.data.messages.length === 7 && r.json.data.messages[0].text.startsWith("Hi!") && r.json.data.hasMore === false, r.json.data.messages.map((m) => m.text));

  r = await call("POST", `/conversations/${convId}/read`, { token: mariam.token });
  r = await call("GET", "/conversations/unread-count", { token: mariam.token });
  check("mark read resets unread", r.json.data.unread === 0, r.json);

  // --- Membership + validation ---
  r = await call("GET", `/conversations/${convId}/messages`, { token: omar.token });
  check("outsider cannot read thread (404)", r.status === 404, r.json);

  r = await call("POST", `/conversations/${convId}/messages`, { token: omar.token, body: { text: "sneaky" } });
  check("outsider cannot post (404)", r.status === 404, r.json);

  r = await call("POST", `/conversations/${convId}/messages`, { token: ahmed.token, body: { text: "   " } });
  check("empty message rejected", r.status === 400, r.json);

  r = await call("POST", `/conversations/${convId}/messages`, { token: ahmed.token, body: { text: "x".repeat(1001) } });
  check("too-long message rejected", r.status === 400, r.json);

  r = await call("GET", "/conversations");
  check("no token 401", r.status === 401, r.json);

  [mariamSocket, ahmedSocket, omarSocket].forEach((s) => s.close());
});
