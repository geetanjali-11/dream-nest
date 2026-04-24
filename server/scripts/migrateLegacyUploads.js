const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

require("dotenv").config();

const Listing = require("../models/Listing");
const User = require("../models/User");
const { attachGridFsBucket, saveUpload } = require("../utils/uploads");

const ROOT_DIR = path.join(__dirname, "..");

const normalizeLegacyPath = (storedPath) => {
  if (!storedPath || storedPath.startsWith("/uploads/")) {
    return null;
  }

  const relativePath = storedPath.replace(/^public[\\/]/, "public/");
  return path.join(ROOT_DIR, relativePath);
};

const toMulterLikeFile = (absolutePath) => {
  const buffer = fs.readFileSync(absolutePath);

  return {
    originalname: path.basename(absolutePath),
    mimetype: undefined,
    buffer,
  };
};

const migratePaths = async (paths, bucketName, label) => {
  const migratedPaths = [];
  let changed = false;

  for (const storedPath of paths) {
    if (storedPath.startsWith("/uploads/")) {
      migratedPaths.push(storedPath);
      continue;
    }

    const absolutePath = normalizeLegacyPath(storedPath);

    if (!absolutePath || !fs.existsSync(absolutePath)) {
      console.warn(`[skip] ${label}: missing file for ${storedPath}`);
      migratedPaths.push(storedPath);
      continue;
    }

    const uploaded = await saveUpload(toMulterLikeFile(absolutePath), bucketName);
    migratedPaths.push(uploaded.path);
    changed = true;
    console.log(`[migrated] ${label}: ${storedPath} -> ${uploaded.path}`);
  }

  return { migratedPaths, changed };
};

const migrateListings = async () => {
  const listings = await Listing.find({});
  let updatedCount = 0;

  for (const listing of listings) {
    const { migratedPaths, changed } = await migratePaths(
      listing.listingPhotoPaths || [],
      "listingPhotos",
      `listing ${listing._id}`
    );

    if (changed) {
      listing.listingPhotoPaths = migratedPaths;
      await listing.save();
      updatedCount += 1;
    }
  }

  console.log(`Listings updated: ${updatedCount}`);
};

const migrateUsers = async () => {
  const users = await User.find({});
  let updatedCount = 0;

  for (const user of users) {
    if (!user.profileImagePath || user.profileImagePath.startsWith("/uploads/")) {
      continue;
    }

    const absolutePath = normalizeLegacyPath(user.profileImagePath);

    if (!absolutePath || !fs.existsSync(absolutePath)) {
      console.warn(`[skip] user ${user._id}: missing file for ${user.profileImagePath}`);
      continue;
    }

    const uploaded = await saveUpload(
      toMulterLikeFile(absolutePath),
      "profileImages"
    );

    console.log(
      `[migrated] user ${user._id}: ${user.profileImagePath} -> ${uploaded.path}`
    );

    user.profileImagePath = uploaded.path;
    await user.save();
    updatedCount += 1;
  }

  console.log(`Users updated: ${updatedCount}`);
};

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, { dbName: "Dream_Nest" });
    attachGridFsBucket(mongoose.connection.db);

    await migrateListings();
    await migrateUsers();

    console.log("Legacy upload migration finished.");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();
