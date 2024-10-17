import multer from "multer";

const storage = multer.memoryStorage(); // Store files in memory as Buffer

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "application/pdf" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const uploadMiddleware = multer({ storage, fileFilter });

export default uploadMiddleware;
