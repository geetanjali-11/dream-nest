require("dotenv").config();
const path = require("path");
const fs = require("fs");
const app = require("./app");
const { isProduction } = require("./utils/config");
const { connectToDatabase } = require("./utils/db");

if (isProduction) {
  const clientBuildPath = path.join(__dirname, "..", "client", "build");
  if (fs.existsSync(clientBuildPath)) {
    const express = require("express");
    app.use(express.static(clientBuildPath));

    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/auth") || req.path.startsWith("/properties") || req.path.startsWith("/bookings") || req.path.startsWith("/users") || req.path.startsWith("/uploads")) {
        return next();
      }

      return res.sendFile(path.join(clientBuildPath, "index.html"));
    });
  }
}

/* MONGOOSE SETUP  */
const PORT = process.env.PORT || 3001;
connectToDatabase()
  .then(() => {
    app.listen(PORT, () => console.log(`Server Port : ${PORT}`));
  })
  .catch((err) => console.log(`${err} did not connect`));
