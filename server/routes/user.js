const router = require("express").Router();

const Booking = require("../models/Booking");
const User = require("../models/User");
const Listing = require("../models/Listing");
const { requireAuth, requireUserMatch } = require("../middleware/auth");

/* GET TRIP LIST */
router.get("/:userId/trips", requireAuth, requireUserMatch, async (req, res) => {
  try {
    const { userId } = req.params;
    const trips = await Booking.find({ customerId: userId }).populate("customerId hostId listingId");
    res.status(202).json(trips);
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "Can not find trips!", error: err.message });
  }
});

/* ADD LISTING TO WISHLIST */
router.patch("/:userId/:listingId", requireAuth, requireUserMatch, async (req, res) => {
  try {
    const { userId, listingId } = req.params;
    const user = await User.findById(userId);
    const listing = await Listing.findById(listingId).populate("creator");

    if (!user || !listing) {
      return res.status(404).json({ message: "User or listing not found." });
    }

    const favoriteListing = user.wishList.find((item) => item.toString() === listingId);

    if (favoriteListing) {
      user.wishList = user.wishList.filter((item) => item.toString() !== listingId);
      await user.save();
      const updatedUser = await User.findById(userId).populate({
        path: "wishList",
        populate: {
          path: "creator",
        },
      });
      res.status(200).json({ message: "Listing is removed from wish list", wishList: updatedUser.wishList });
    } else {
      user.wishList.push(listing._id);
      await user.save();
      const updatedUser = await User.findById(userId).populate({
        path: "wishList",
        populate: {
          path: "creator",
        },
      });
      res.status(200).json({ message: "Listing is added to wish list", wishList: updatedUser.wishList });
    }
  } catch (err) {
    console.log(err);
    res.status(404).json({ error: err.message });
  }
});

/* GET PROPERTY LIST */
router.get("/:userId/properties", requireAuth, requireUserMatch, async (req, res) => {
  try {
    const { userId } = req.params;
    const properties = await Listing.find({ creator: userId }).populate("creator");
    res.status(202).json(properties);
  } catch (err) {
    console.log(err);
    res
      .status(404)
      .json({ message: "Can not find properties!", error: err.message });
  }
});

/* GET RESERVATION LIST */
router.get("/:userId/reservations", requireAuth, requireUserMatch, async (req, res) => {
  try {
    const { userId } = req.params;
    const reservations = await Booking.find({ hostId: userId }).populate(
      "customerId hostId listingId"
    );
    res.status(202).json(reservations);
  } catch (err) {
    console.log(err);
    res
      .status(404)
      .json({ message: "Can not find reservations!", error: err.message });
  }
});

module.exports = router;
