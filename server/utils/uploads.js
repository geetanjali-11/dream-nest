const crypto = require("crypto");
const path = require("path");
const { Readable } = require("stream");
const multer = require("multer");
const { GridFSBucket } = require("mongodb");

let gridFsBucket;

const upload = multer({ storage: multer.memoryStorage() });

const getFileUrl = (filename) => `/uploads/${filename}`;

const attachGridFsBucket = (db) => {
  gridFsBucket = {
    db,
    listingPhotos: new GridFSBucket(db, { bucketName: "listingPhotos" }),
    profileImages: new GridFSBucket(db, { bucketName: "profileImages" }),
  };
};

const generateFilename = (originalname) =>
  new Promise((resolve, reject) => {
    crypto.randomBytes(16, (error, buffer) => {
      if (error) {
        return reject(error);
      }

      return resolve(
        `${buffer.toString("hex")}${path.extname(originalname || "")}`
      );
    });
  });

const saveUpload = async (file, bucketName) => {
  if (!gridFsBucket || !file) {
    throw new Error("File storage is not ready yet.");
  }

  const filename = await generateFilename(file.originalname);
  const bucket =
    bucketName === "listingPhotos"
      ? gridFsBucket.listingPhotos
      : gridFsBucket.profileImages;

  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: file.mimetype,
      metadata: {
        originalName: file.originalname,
      },
    });

    Readable.from(file.buffer)
      .pipe(uploadStream)
      .on("error", reject)
      .on("finish", () => {
        resolve({
          filename,
          id: uploadStream.id,
          path: getFileUrl(filename),
        });
      });
  });
};

const streamUploadByFilename = async (req, res) => {
  try {
    if (!gridFsBucket) {
      return res.status(503).json({ message: "File storage is not ready yet." });
    }

    const filename = req.params.filename;
    const filesCollection = gridFsBucket.db.collection("listingPhotos.files");
    const profileFilesCollection = gridFsBucket.db.collection("profileImages.files");

    let file = await filesCollection.findOne({ filename });
    let bucketName = "listingPhotos";

    if (!file) {
      file = await profileFilesCollection.findOne({ filename });
      bucketName = "profileImages";
    }

    if (!file) {
      return res.status(404).json({ message: "File not found." });
    }

    res.set("Content-Type", file.contentType || "application/octet-stream");
    const bucket = bucketName === "listingPhotos" ? gridFsBucket.listingPhotos : gridFsBucket.profileImages;
    return bucket.openDownloadStreamByName(filename).pipe(res);
  } catch (error) {
    return res.status(500).json({ message: "Failed to load file.", error: error.message });
  }
};

module.exports = {
  attachGridFsBucket,
  getFileUrl,
  saveUpload,
  streamUploadByFilename,
  upload,
};
