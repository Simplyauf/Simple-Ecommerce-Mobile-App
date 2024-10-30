const express = require("express");
const router = express.Router();
const { auth, admin } = require("../../Backend/middleware/auth");
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

router.get("/", getCategories);
router.get("/:slug", getCategory);
router.post("/", [auth], createCategory);
router.put("/:id", [auth], updateCategory);
router.delete("/:id", [auth], deleteCategory);

module.exports = router;
