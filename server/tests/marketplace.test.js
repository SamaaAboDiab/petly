// Marketplace logic: one-of-a-kind pets, per-seller orders, order lifecycle, seller page.
const { run, call, login, check } = require("./helpers/harness");

run(async () => {
  const ahmed = await login("demo@petly.com"); // owns golden, macaw, husky, baladi
  const mariam = await login("mariam@petly.com"); // owns shorthair, shepherd, chow, parakeet, maine coon
  const omar = await login("omar@petly.com");
  const get = async (slug) => (await call("GET", `/pets/${slug}`)).json.data;

  const golden = (await get("golden-retriever")).pet;
  const chow = (await get("chow-chow")).pet;
  const shepherd = (await get("german-shepherd")).pet;
  const husky = (await get("siberian-husky")).pet;

  // ---- Own listing / race / split ----
  let r = await call("POST", "/orders", { token: ahmed.token, body: { items: [{ petId: golden.id }] } });
  check("cannot order own pet", r.status === 400, r.json);

  // Two buyers try to adopt the Chow Chow at the same moment.
  const [a, b] = await Promise.all([
    call("POST", "/orders", { token: ahmed.token, body: { items: [{ petId: chow.id }] } }),
    call("POST", "/orders", { token: omar.token, body: { items: [{ petId: chow.id }] } }),
  ]);
  const statuses = [a.status, b.status].sort();
  check("same pet can only be bought once (race)", statuses[0] === 201 && statuses[1] === 409, statuses);
  const chowOrder = (a.status === 201 ? a : b).json.data.orders[0];
  const chowBuyer = a.status === 201 ? ahmed : omar;
  const loser = a.status === 201 ? omar : ahmed;
  check("order starts pending with history", chowOrder.status === "pending" && chowOrder.statusHistory[0].status === "pending", chowOrder);
  check("created order includes seller details", chowOrder.seller?.name === "Mariam Adel", chowOrder.seller);

  // Sold pet disappears from the shop but its page still works.
  r = await call("GET", "/pets?search=chow");
  check("sold pet hidden from listings", r.json.data.pets.length === 0, r.json.data.pets);
  r = await call("GET", "/pets/categories");
  check("sold pet not counted", r.json.data.categories.find((c) => c.id === "dogs").count === 5, r.json.data);
  r = await call("GET", "/pets/chow-chow");
  check("sold pet page still loads, marked sold", r.status === 200 && r.json.data.pet.status === "sold", r.json.data.pet);
  r = await call("POST", "/cart/items", { token: loser.token, body: { petId: chow.id } });
  check("sold pet can't be added to cart", r.status === 409, r.json);

  // Pets from two sellers -> two orders, each with its own delivery + discount.
  r = await call("POST", "/orders", {
    token: omar.token,
    body: { items: [{ petId: husky.id }, { petId: shepherd.id }, { petId: husky.id }], promoCode: "PETLY10" },
  });
  const split = r.json.data?.orders ?? [];
  const huskyOrder = split.find((o) => o.items[0].name === "Siberian Husky");
  const shepherdOrder = split.find((o) => o.items[0].name === "German Shepherd");
  check(
    "one order per seller, duplicates ignored",
    r.status === 201 && split.length === 2 && huskyOrder.items.length === 1 && shepherdOrder.items.length === 1,
    r.json
  );
  check(
    "each order has its own discount + delivery",
    huskyOrder.total === 9200 - 920 + 100 && shepherdOrder.total === 5800 - 580 + 100,
    split.map((o) => o.total)
  );

  // ---- Sales / purchases lists ----
  r = await call("GET", "/orders/sales", { token: ahmed.token });
  check("seller sees sale with buyer", r.json.data.orders.length === 1 && r.json.data.orders[0].user.name === "Omar Khaled", r.json.data);
  r = await call("GET", "/orders/mine", { token: omar.token });
  check("buyer sees orders with seller", r.json.data.orders.every((o) => o.seller?.name), r.json.data);

  // ---- Lifecycle ----
  const patch = (order, token, status) => call("PATCH", `/orders/${order.id}/status`, { token, body: { status } });

  r = await patch(huskyOrder, omar.token, "confirmed");
  check("buyer cannot confirm", r.status === 400, r.json);
  r = await patch(huskyOrder, mariam.token, "confirmed");
  check("outsider gets 404", r.status === 404, r.json);
  r = await patch(huskyOrder, ahmed.token, "delivered");
  check("cannot skip confirm", r.status === 400, r.json);
  r = await patch(huskyOrder, ahmed.token, "confirmed");
  check("seller confirms", r.status === 200 && r.json.data.order.status === "confirmed", r.json);
  r = await patch(huskyOrder, omar.token, "cancelled");
  check("buyer cannot cancel after confirm", r.status === 400, r.json);
  r = await patch(huskyOrder, ahmed.token, "delivered");
  check("seller marks delivered", r.json.data.order.status === "delivered" && r.json.data.order.statusHistory.length === 3, r.json.data.order);
  r = await patch(huskyOrder, ahmed.token, "cancelled");
  check("delivered order is final", r.status === 400, r.json);

  r = await patch(shepherdOrder, omar.token, "cancelled");
  check("buyer cancels pending order", r.json.data.order.status === "cancelled", r.json);
  r = await call("GET", "/pets?search=shepherd");
  check("cancel puts pet back on sale", r.json.data.pets.length === 1 && r.json.data.pets[0].status === "available", r.json.data.pets);

  r = await call("GET", "/notifications", { token: mariam.token });
  check("seller notified of buyer cancel", r.json.data.notifications.some((n) => /cancelled/.test(n.title)), r.json.data.notifications.map((n) => n.title));
  r = await call("GET", "/notifications", { token: omar.token });
  check("buyer notified of confirm + delivery", ["confirmed", "delivered"].every((s) => r.json.data.notifications.some((n) => n.title.endsWith(s))), r.json.data.notifications.map((n) => n.title));

  // ---- Editing ----
  r = await call("PUT", `/pets/${chow.id}`, { token: mariam.token, body: { price: 1 } });
  check("sold listing can't be edited", r.status === 400, r.json);
  r = await call("PUT", `/pets/${shepherd.id}`, { token: mariam.token, body: { price: 5500, age: "4 months", vaccinated: false } });
  check("edit listing keeps photos", r.status === 200 && r.json.data.pet.price === 5500 && r.json.data.pet.features.vaccinated === false && r.json.data.pet.images.length === 1, r.json);

  // ---- Seller page ----
  r = await call("GET", `/sellers/${mariam.user.id}`);
  const page = r.json.data;
  check(
    "seller page: profile, available pets, sold count",
    r.status === 200 && page.seller.name === "Mariam Adel" && page.pets.length === 4 && page.pets.every((p) => p.status !== "sold") && page.seller.soldCount === 1,
    { seller: page?.seller, pets: page?.pets?.map((p) => p.name) }
  );
  check("seller page hides private fields", !("email" in page.seller) && !("favorites" in page.seller), page.seller);
  r = await call("GET", "/sellers/000000000000000000000000");
  check("unknown seller 404", r.status === 404);
  r = await call("GET", "/sellers/not-an-id");
  check("invalid seller id 400", r.status === 400);

  void chowBuyer;
});
