// Step 7 — admin dashboard API.
const { run, call, login, check } = require("./helpers/harness");

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

run(async () => {
  const admin = await login("admin@petly.com", "Admin123");
  const ahmed = await login("demo@petly.com");
  const a = admin.token;

  // Some activity
  const golden = (await call("GET", "/pets/chow-chow")).json.data.pet; // Mariam's pet
  await call("POST", "/orders", { token: ahmed.token, body: { items: [{ petId: golden.id }] } });
  const ticket = (await call("POST", "/support", { token: ahmed.token, body: { category: "order", subject: "Delivery question", message: "When will my golden retriever arrive?" } })).json.data.ticket;

  // Permissions
  for (const path of ["/admin/stats", "/admin/pets", "/admin/orders", "/admin/tickets", "/users"]) {
    const r = await call("GET", path, { token: ahmed.token });
    check(`non-admin blocked: ${path}`, r.status === 403, r.json);
  }

  // Stats
  let r = await call("GET", "/admin/stats", { token: a });
  const s = r.json.data;
  check("stats totals", s.totals.users === 4 && s.totals.pets === 13 && s.totals.orders === 1 && s.totals.openTickets === 1 && s.totals.revenue === 10600, s.totals);
  check("14-day series with today's order", s.ordersByDay.length === 14 && s.ordersByDay.at(-1).orders === 1, s.ordersByDay.slice(-2));
  check("pets by category", s.petsByCategory.reduce((sum, c) => sum + c.count, 0) === 13, s.petsByCategory);
  check("recent orders show buyer", s.recentOrders[0].buyer === "Ahmed Mohamed", s.recentOrders);

  // Users list
  r = await call("GET", "/users?search=mari", { token: a });
  check("search users", r.json.data.users.length === 1 && r.json.data.users[0].email === "mariam@petly.com" && r.json.data.users[0].listings === 5, r.json.data);
  check("admin user list hides private fields", !("favorites" in r.json.data.users[0]) && !("password" in r.json.data.users[0]), r.json.data.users[0]);
  r = await call("GET", "/users?search=.*", { token: a });
  check("search is literal (no regex injection)", r.json.data.users.length === 0, r.json.data);

  // Listings / orders
  r = await call("GET", "/admin/pets?search=husky", { token: a });
  check("admin pets search + seller", r.json.data.pets.length === 1 && r.json.data.pets[0].seller.name === "Ahmed Mohamed", r.json.data);
  r = await call("GET", "/admin/orders", { token: a });
  check("admin orders with buyer", r.json.data.orders.length === 1 && r.json.data.orders[0].user.name === "Ahmed Mohamed", r.json.data);

  // Tickets
  r = await call("GET", "/admin/tickets?status=open", { token: a });
  check("open tickets", r.json.data.tickets.length === 1 && r.json.data.tickets[0].user.email === "demo@petly.com", r.json.data);
  r = await call("PATCH", `/admin/tickets/${ticket.id}`, { token: a, body: { reply: "It ships tomorrow!", status: "resolved" } });
  check("reply + resolve ticket", r.json.data.ticket.status === "resolved" && r.json.data.ticket.reply === "It ships tomorrow!", r.json);
  await wait(300);
  r = await call("GET", "/support/mine", { token: ahmed.token });
  check("user sees reply", r.json.data.tickets[0].reply === "It ships tomorrow!", r.json.data);
  r = await call("GET", "/notifications", { token: ahmed.token });
  check("user notified of reply", r.json.data.notifications.some((n) => n.title === "Support replied to your request"), r.json.data.notifications);

  // Delete user cleans up
  const omarId = (await call("GET", "/users?search=omar", { token: a })).json.data.users[0].id;
  const omarPet = (await call("GET", "/pets/beagle")).json.data.pet;
  await call("POST", `/favorites/pets/${omarPet.id}`, { token: ahmed.token });
  await call("POST", `/favorites/sellers/${omarId}`, { token: ahmed.token });
  await call("POST", "/cart/items", { token: ahmed.token, body: { petId: omarPet.id } });

  r = await call("DELETE", `/users/${admin.user.id}`, { token: a });
  check("admin cannot delete self", r.status === 400, r.json);
  r = await call("DELETE", `/users/${omarId}`, { token: a });
  check("delete user", r.status === 200, r.json);
  r = await call("GET", "/pets/beagle");
  check("their listings removed", r.status === 404);
  r = await call("GET", "/favorites", { token: ahmed.token });
  check("removed from others' favorites", !r.json.data.pets.some((p) => p.id === omarPet.id) && !r.json.data.sellers.some((x) => x.id === omarId), r.json.data);
  r = await call("GET", "/cart", { token: ahmed.token });
  check("removed from others' carts", !r.json.data.cart.items.some((i) => i.pet.id === omarPet.id), r.json.data);
  r = await call("POST", "/auth/login", { body: { email: "omar@petly.com", password: "petly123" } });
  check("deleted user cannot sign in", r.status === 401);
});
