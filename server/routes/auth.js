const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const { jwtSecret } = require("../utils/config");
const { sanitizeUser } = require("../utils/serializeUser");
const { saveUpload, upload } = require("../utils/uploads");

/* USER REGISTER */

router.post("/register", upload.single("profileImage"), async (req, res) => {
  try {
    /* Take all information from the form */
    const { firstName, lastName, email, password } = req.body;

    //  The uploaded file is available as req.file
    const profileImage = req.file;

    if (!firstName || !lastName || !email || !password || !profileImage) {
      return res.status(400).json({ message: "All fields are required!" });
    }
    /* path to the uploaded profile photo */
    const storedProfileImage = await saveUpload(profileImage, "profileImages");
    const profileImagePath = storedProfileImage.path;

    /* Check if the user already exists */
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists!" });
    }

    /* Hash the password 
    bcryptjs → password hashing */
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    /* Create a new User */
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      profileImagePath,
    });

    /* save new User */
    await newUser.save();

    /* send a successfull message response */
    res
      .status(200)
      .json({ message: "User registered successfully!", user: sanitizeUser(newUser) });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "Registration failed", error: err.message });
  }
});

/* USER LOGIN */

router.post("/login", async (req, res) => {
  try {
    /*Take the information from the form */
    const { email, password } = req.body;

    /* check if user already exists */
    const user = await User.findOne({ email }).populate({
      path: "wishList",
      populate: {
        path: "creator",
      },
    });
    if (!user) {
      return res.status(400).json({ message: "User doesn't exist!" });
    }

    /* Compare the password with the hashed password */
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }

    /* Generate a JWT token */
    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: "7d" });

    res.status(200).json({ token, user: sanitizeUser(user) });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;
