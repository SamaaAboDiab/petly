const mongoose = require("mongoose");
const { CATEGORIES, GENDERS, PET_STATUSES } = require("../config/constants");

// Minimal, dependency-free slugify (avoids pulling in an extra package just
// for this one string transform).
const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

const petSchema = new mongoose.Schema(
  {
    // Breed or display name, e.g. "Golden Retriever".
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    // Readable id used in URLs (/app/pets/golden-retriever).
    slug: {
      type: String,
      unique: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: { values: CATEGORIES, message: "Category must be one of: " + CATEGORIES.join(", ") },
    },
    age: {
      type: String,
      required: [true, "Age is required"],
      trim: true,
    },
    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: { values: GENDERS, message: "Gender must be Male or Female" },
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [1, "Price must be greater than 0"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      minlength: [20, "Description must be at least 20 characters"],
    },
    images: {
      type: [String],
      validate: [(list) => list.length > 0, "At least one image is required"],
    },
    features: {
      vaccinated: { type: Boolean, default: false },
      dewormed: { type: Boolean, default: false },
      healthCheck: { type: Boolean, default: false },
      pedigree: { type: Boolean, default: false },
    },
    popular: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 5,
      min: 0,
      max: 5,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: PET_STATUSES,
      default: "available",
    },
    soldAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

petSchema.index({ status: 1, category: 1, popular: -1, rating: -1 });

// Regenerate the slug whenever the name changes, and guarantee uniqueness
// by appending -1, -2, ... if the base slug is already taken by another pet
// (many sellers list "Golden Retriever").
petSchema.pre("save", async function (next) {
  if (!this.isModified("name")) return next();

  const baseSlug = slugify(this.name) || "pet";
  let slug = baseSlug;
  let counter = 1;

  while (await mongoose.models.Pet.exists({ slug, _id: { $ne: this._id } })) {
    slug = `${baseSlug}-${counter++}`;
  }

  this.slug = slug;
  next();
});

petSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.__v;
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

module.exports = mongoose.model("Pet", petSchema);
