const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth.js");
const listingRoutes = require("./routes/listing.js");
const bookingRoutes = require("./routes/booking.js");
const userRoutes = require("./routes/user.js");
const { getCorsOrigin, isProduction, mongoUrl } = require("./utils/config");
const { attachGridFsBucket, streamUploadByFilename } = require("./utils/uploads");

app.use(
  cors({
    origin: getCorsOrigin(),
    credentials: true,
  })
);
app.use(express.json());
app.use("/uploads/:filename", streamUploadByFilename);

/* ROUTES */
app.use("/auth", authRoutes);
app.use("/properties", listingRoutes);
app.use("/bookings", bookingRoutes);
app.use("/users", userRoutes);

if (isProduction) {
  const clientBuildPath = path.join(__dirname, "..", "client", "build");
  app.use(express.static(clientBuildPath));

  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/auth") || req.path.startsWith("/properties") || req.path.startsWith("/bookings") || req.path.startsWith("/users") || req.path.startsWith("/uploads")) {
      return next();
    }

    return res.sendFile(path.join(clientBuildPath, "index.html"));
  });
}

/* MONGOOSE SETUP  */
const PORT = process.env.PORT || 3001;
mongoose
  .connect(mongoUrl, {
    dbName: "Dream_Nest",
  })
  .then(() => {
    attachGridFsBucket(mongoose.connection.db);
    app.listen(PORT, () => console.log(`Server Port : ${PORT}`));
  })
  .catch((err) => console.log(`${err} did not connect`));
