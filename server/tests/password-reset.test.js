// Step 5 — forgot / reset password.
const { run, call, check, serverOutput } = require("./helpers/harness");

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const lastResetToken = () => {
  const links = [...serverOutput.text.matchAll(/\/reset-password\/([a-f0-9]{64})/g)];
  return links.at(-1)?.[1];
};

run(async () => {
  let r = await call("POST", "/auth/forgot-password", { body: { email: "nobody@petly.com" } });
  const unknownMessage = r.json.data?.message;
  await wait(200);
  check("unknown email: same 200 answer, no email sent", r.status === 200 && !lastResetToken(), r.json);

  r = await call("POST", "/auth/forgot-password", { body: { email: "DEMO@petly.com" } });
  await wait(300);
  const token = lastResetToken();
  check("known email: same answer + reset link emailed (dev console)", r.status === 200 && r.json.data.message === unknownMessage && Boolean(token), r.json);
  check("email link points at the frontend", serverOutput.text.includes(`http://localhost:5173/reset-password/${token}`));

  r = await call("POST", "/auth/forgot-password", { body: { email: "not-an-email" } });
  check("invalid email rejected", r.status === 400, r.json);

  r = await call("POST", "/auth/reset-password", { body: { token: "a".repeat(64), password: "brandnew1" } });
  check("wrong token rejected", r.status === 400 && /invalid or has expired/.test(r.json.message), r.json);

  r = await call("POST", "/auth/reset-password", { body: { token, password: "123" } });
  check("short password rejected", r.status === 400, r.json);

  r = await call("POST", "/auth/reset-password", { body: { token, password: "brandnew1" } });
  check("reset succeeds and signs in", r.status === 200 && r.json.data.token && r.json.data.user.email === "demo@petly.com", r.json);

  r = await call("POST", "/auth/reset-password", { body: { token, password: "another12" } });
  check("link works only once", r.status === 400, r.json);

  r = await call("POST", "/auth/login", { body: { email: "demo@petly.com", password: "petly123" } });
  check("old password rejected", r.status === 401);
  r = await call("POST", "/auth/login", { body: { email: "demo@petly.com", password: "brandnew1" } });
  check("new password works", r.status === 200);

  r = await call("GET", "/auth/me", { token: r.json.data.token });
  check("reset fields never exposed", !("passwordResetToken" in r.json.data.user) && !("passwordResetExpires" in r.json.data.user), r.json);
});
