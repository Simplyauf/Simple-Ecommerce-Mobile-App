const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const { upload, handleUploadError } = require("../middleware/upload");

router.post("/", auth, async (req, res) => {
  //   console.log("File details:", {
  //     file: req.file,
  //     filename: req?.file?.filename,
  //     path: req?.file?.path,
  //     mimetype: req?.file?.mimetype,
  //     size: req?.file?.size,
  //     uri: req?.uri,
  //   });
  console.log("File details:", req.files);

  try {
    if (!req.files.image.mimetype.includes("image")) {
      throw CustomErrorHandler(415, "invalid image type");
    }
    if (!req.files) {
      throw CustomErrorHandler(400, "No image waas uploaded");
    }
    if (req.files.image.size > 3 * 1024 * 1024) {
      throw CustomErrorHandler(400, "Image size has exceeded the limit");
    }
    const result = await cloudinary.uploader.upload(
      req.files.image.tempFilePath,
      {
        use_filename: true,
        folder: "file-Auffur",
      }
    );
    fs.unlinkSync(req.files.image.tempFilePath);

    return res.status(201).json({ image: result.secure_url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
