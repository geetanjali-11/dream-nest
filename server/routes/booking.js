const router = require("express").Router();

const Booking = require("../models/Booking");
const Listing = require("../models/Listing");
const { requireAuth } = require("../middleware/auth");

/* CREATE BOOKING */
router.post("/create", requireAuth, async (req, res) => {
  try {
    const { listingId, startDate, endDate, totalPrice } =
      req.body;
    const customerId = req.auth.id;
    const listing = await Listing.findById(listingId);

    if (!listing) {
      return res.status(404).json({ message: "Listing not found." });
    }

    const newBooking = new Booking({
      customerId,
      hostId: listing.creator,
      listingId,
      startDate,
      endDate,
      totalPrice,
    });
    await newBooking.save();
    res.status(200).json(newBooking);
  } catch (err) {
    console.log(err);
    res
      .status(400)
      .json({ message: "Fail to create a new Booking!", error: err.message });
  }
});

module.exports = router;
