const express = require("express");
const router = express.Router();
const { auth, admin } = require("../middleware/auth");
const { upload } = require("../middleware/upload");
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

router.get("/", getProducts);
router.get("/:slug", getProduct);
router.post("/", [auth], createProduct);
router.put("/:slug", [auth], updateProduct);
router.delete("/:slug", [auth], deleteProduct);

module.exports = router;
