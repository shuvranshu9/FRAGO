import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/avif",
  ]);

  if (file.mimetype?.startsWith("video/")) {
    const err = new Error("Video files are not allowed");
    err.statusCode = 400;
    return cb(err, false);
  }

  if (file.mimetype === "image/gif") {
    const err = new Error("GIF images are not allowed");
    err.statusCode = 400;
    return cb(err, false);
  }

  if (allowedMimeTypes.has(file.mimetype)) {
    return cb(null, true);
  }

  const err = new Error("Only JPG, PNG, WEBP, or AVIF images are allowed");
  err.statusCode = 400;
  return cb(err, false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export default upload;
