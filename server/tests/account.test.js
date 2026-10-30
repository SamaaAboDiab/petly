// Step 3 — account settings, preferences, support tickets.
const { run, call, login, check, ORIGIN } = require("./helpers/harness");

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64"
);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

run(async () => {
  const sara = (await call("POST", "/auth/register", { body: { name: "Sara Ali", email: "sara@test.com", password: "secret12" } })).json.data;
  const t = sara.token;

  // Profile
  const form = new FormData();
  form.append("name", "Sara Mostafa");
  form.append("location", "Giza, Egypt");
  form.append("avatar", new Blob([PNG], { type: "image/png" }), "me.png");
  let r = await call("PATCH", "/account/profile", { token: t, form });
  const avatar = r.json.data?.user?.avatar;
  check("update name, location, avatar", r.status === 200 && r.json.data.user.name === "Sara Mostafa" && /^\/uploads\/avatars\/.+\.png$/.test(avatar), r.json);
  const img = await fetch(ORIGIN + avatar);
  check("avatar served", img.status === 200 && img.headers.get("content-type") === "image/png", img.status);

  r = await call("PATCH", "/account/profile", { token: t, body: { removeAvatar: true } });
  check("remove avatar", r.json.data.user.avatar === null, r.json);
  check("old avatar file deleted", (await fetch(ORIGIN + avatar)).status === 404);

  r = await call("PATCH", "/account/profile", { token: t, body: { name: "Al" } });
  check("short name rejected", r.status === 400, r.json);

  r = await call("PATCH", "/account/profile", { token: t, body: { role: "admin", email: "x@x.com", verified: true } });
  check("cannot change role/email/verified", r.json.data.user.role === "user" && r.json.data.user.email === "sara@test.com" && r.json.data.user.verified === false, r.json);

  r = await call("GET", "/auth/me", { token: t });
  check("me reflects profile + preferences", r.json.data.user.name === "Sara Mostafa" && r.json.data.user.preferences.notifications.activity === true, r.json);

  // Password
  r = await call("PATCH", "/account/password", { token: t, body: { currentPassword: "wrong", newPassword: "newpass12" } });
  check("wrong current password", r.status === 400 && r.json.errors[0].field === "currentPassword", r.json);
  r = await call("PATCH", "/account/password", { token: t, body: { currentPassword: "secret12", newPassword: "secret12" } });
  check("same password rejected", r.status === 400, r.json);
  r = await call("PATCH", "/account/password", { token: t, body: { currentPassword: "secret12", newPassword: "newpass12" } });
  check("change password", r.status === 200, r.json);
  r = await call("POST", "/auth/login", { body: { email: "sara@test.com", password: "secret12" } });
  check("old password no longer works", r.status === 401);
  r = await call("POST", "/auth/login", { body: { email: "sara@test.com", password: "newpass12" } });
  check("new password works", r.status === 200);

  // Preferences respected at send time
  r = await call("PATCH", "/account/preferences", { token: t, body: { notifications: { activity: false } } });
  check("update preferences", r.json.data.user.preferences.notifications.activity === false && r.json.data.user.preferences.notifications.orders === true, r.json);
  r = await call("PATCH", "/account/preferences", { token: t, body: { notifications: { activity: "nope" } } });
  check("bad preference value rejected", r.status === 400, r.json);

  const ahmed = await login("demo@petly.com");
  await call("POST", `/favorites/sellers/${sara.user.id}`, { token: ahmed.token });
  await wait(300);
  r = await call("GET", "/notifications", { token: t });
  check("muted 'activity' notifications are not sent", !r.json.data.notifications.some((n) => n.type === "follow"), r.json.data.notifications);

  // Support
  r = await call("POST", "/support", { token: t, body: { category: "order", subject: "Where is my pet?", message: "My order hasn't arrived yet, can you help?" } });
  check("create ticket", r.status === 201 && r.json.data.ticket.status === "open", r.json);
  r = await call("POST", "/support", { token: t, body: { category: "hack", subject: "x", message: "short" } });
  check("invalid ticket rejected", r.status === 400 && r.json.errors.length === 3, r.json);
  r = await call("GET", "/support/mine", { token: t });
  check("my tickets", r.json.data.tickets.length === 1, r.json);
  r = await call("GET", "/support/mine", { token: ahmed.token });
  check("tickets are private", r.json.data.tickets.length === 0, r.json);
});
