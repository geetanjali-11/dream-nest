const router = require("express").Router();

const Listing = require("../models/Listing");
const User = require("../models/User");
const { requireAuth } = require("../middleware/auth");
const { saveUpload, upload } = require("../utils/uploads");

const creatorPopulate = {
  path: "creator",
  select: "-password",
};

/* CREATING LISTING */
router.post("/create", requireAuth, upload.array("listingPhotos"), async (req, res) => {
  try {
    /* Take information from the form */
    const {
      category,
      type,
      streetAddress,
      aptSuite,
      city,
      province,
      country,
      guestCount,
      bedroomCount,
      bedCount,
      bathroomCount,
      amenities,
      title,
      description,
      highlight,
      highlightDesc,
      price,
    } = req.body;
    const creator = req.auth.id;
    const user = await User.findById(creator);

    if (!user) {
      return res.status(404).json({ message: "Creator not found." });
    }

    const listingPhotos = req.files;

    if (!listingPhotos || listingPhotos.length === 0) {
      return res.status(400).send("No file uploaded.");
    }
    const storedListingPhotos = await Promise.all(
      listingPhotos.map((file) => saveUpload(file, "listingPhotos"))
    );
    const listingPhotoPaths = storedListingPhotos.map((file) => file.path);

    const newListing = new Listing({
      creator,
      category,
      type,
      streetAddress,
      aptSuite,
      city,
      province,
      country,
      guestCount,
      bedroomCount,
      bedCount,
      bathroomCount,
      amenities,
      listingPhotoPaths,
      title,
      description,
      highlight,
      highlightDesc,
      price,
    });

    await newListing.save();

    res.status(201).json(newListing);
  } catch (err) {
    res
      .status(409)
      .json({ message: "Fail to create Listing", error: err.message });
    console.log(err);
  }
});

/* GET LISTING BY CATEGORY */
router.get("/", async (req, res) => {
  const qCategory = req.query.category;

  try {
    let listings;
    if (qCategory) {
      listings = await Listing.find({ category: qCategory }).populate(creatorPopulate);
    } else {
      listings = await Listing.find().populate(creatorPopulate);
    }

    res.status(200).json(listings);
  } catch (err) {
    res
      .status(404)
      .json({ message: "Fail to fetch listings", error: err.message });
    console.log(err);
  }
});

/* GET LISTINGS BY SEARCH */
router.get("/search/:search", async (req, res) => {
  const { search } = req.params;

  try {
    let listings = [];

    if (search === "all") {
      listings = await Listing.find().populate(creatorPopulate);
    } else {
      listings = await Listing.find({
        $or: [
          { category: { $regex: search, $options: "i" } },
          { title: { $regex: search, $options: "i" } },
        ],
      }).populate(creatorPopulate);
    }
    res.status(200).json(listings);
  } catch (err) {
    res.status(404).json({ message: "Fail to fetch listings", error: err.message });
    console.log(err);
  }
});
/* LISTING DETAILS */
router.get("/:listingId", async (req, res) => {
  try {
    const { listingId } = req.params;
    const listing = await Listing.findById(listingId).populate(creatorPopulate);
    res.status(202).json(listing);
  } catch (err) {
    res
      .status(404)
      .json({ message: "Listing can not found!", error: err.message });
  }
});

module.exports = router;
