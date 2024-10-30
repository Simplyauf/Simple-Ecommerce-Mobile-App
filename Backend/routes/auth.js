const express = require("express");
const router = express.Router();
const { register, login, getMe } = require("../controllers/authController");
const { auth } = require("../../Backend/middleware/auth");
const {
  registerValidation,
  loginValidation,
  validateRequest,
} = require("../middleware/validate");

router.post("/register", registerValidation, validateRequest, register);
router.post("/login", loginValidation, validateRequest, login);
router.get("/me", auth, getMe);

module.exports = router;
