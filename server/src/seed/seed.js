require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Pet = require("../models/Pet");
const { users, pets } = require("./data");

// Re-runnable: only removes the seed users (by email) and the pets they own,
// so listings created by real users are never touched.
const seed = async () => {
  await connectDB();

  const emails = users.map((u) => u.email);
  const oldSeedUsers = await User.find({ email: { $in: emails } }).select("_id");
  await Pet.deleteMany({ seller: { $in: oldSeedUsers.map((u) => u._id) } });
  await User.deleteMany({ email: { $in: emails } });

  // Passwords are hashed automatically by the User model's pre-save hook.
  const created = await User.create(users.map(({ key, ...user }) => user));
  const idByKey = Object.fromEntries(users.map((u, i) => [u.key, created[i]._id]));

  // Pet.create() (not insertMany) so the pre-save slug hook runs for each pet.
  // Sequential so slugs are generated deterministically.
  for (const { sellerKey, ...pet } of pets) {
    await Pet.create({ ...pet, seller: idByKey[sellerKey] });
  }

  console.log("Seed data created:");
  users.forEach((u) => console.log(`  - ${(u.role || "user").padEnd(5)} ${u.email} / ${u.password}`));
  console.log(`\n${pets.length} pets created.`);

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
