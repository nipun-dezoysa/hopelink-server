import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const parts = file.originalname.split(".");
    const ext = parts[parts.length - 1];
    cb(null, `${Date.now()}-${Math.floor(Math.random() * 100) + 1}.${ext}`); 
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype == "application/pdf" ||
    file.mimetype == "image/png" ||
    file.mimetype == "image/jpeg" ||
    file.mimetype == "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const uploadMiddleware = multer({ storage: storage, fileFilter });

export default uploadMiddleware;
