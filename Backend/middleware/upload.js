const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { config } = require("../config/config");

// Add debug logging for Cloudinary config
console.log("Cloudinary Config:", {
  cloud_name: config.cloudinaryName ? "Set" : "Not Set",
  api_key: config.cloudinaryApiKey ? "Set" : "Not Set",
  api_secret: config.cloudinaryApiSecret ? "Set" : "Not Set",
});

cloudinary.config({
  cloud_name: config.cloudinaryName,
  api_key: config.cloudinaryApiKey,
  api_secret: config.cloudinaryApiSecret,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "products",
    allowed_formats: ["jpg", "jpeg", "png"],
    transformation: [
      { width: 500, height: 500, crop: "limit" },
      { quality: "auto" },
      { fetch_format: "auto" },
    ],
  },
});

// Debug the file filter
const fileFilter = (req, file, cb) => {
  console.log("Received file:", {
    fieldname: file.fieldname,
    originalname: file.originalname,
    mimetype: file.mimetype,
    file: file,
  });

  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png"
  ) {
    cb(null, true);
  } else {
    cb(
      new Error("Unsupported file format. Please upload a JPEG or PNG image."),
      false
    );
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Enhanced error handling
const handleUploadError = (error, req, res, next) => {
  console.error("Upload Error:", error);

  if (error instanceof multer.MulterError) {
    console.log("Multer Error:", error.code);
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.error(400, "File size is too large. Maximum size is 5MB.");
    }
    return res.error(400, error.message);
  }

  if (
    error.message ===
    "Unsupported file format. Please upload a JPEG or PNG image."
  ) {
    return res.error(400, error.message);
  }

  next(error);
};

module.exports = {
  upload,
  handleUploadError,
};
