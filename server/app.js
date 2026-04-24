const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.js");
const listingRoutes = require("./routes/listing.js");
const bookingRoutes = require("./routes/booking.js");
const userRoutes = require("./routes/user.js");
const { getCorsOrigin } = require("./utils/config");
const { streamUploadByFilename } = require("./utils/uploads");

const app = express();

app.use(
  cors({
    origin: getCorsOrigin(),
    credentials: true,
  })
);
app.use(express.json());
app.use("/uploads/:filename", streamUploadByFilename);

app.use("/auth", authRoutes);
app.use("/properties", listingRoutes);
app.use("/bookings", bookingRoutes);
app.use("/users", userRoutes);

module.exports = app;
