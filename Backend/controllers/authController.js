const pool = require("../config/database");
const bcrypt = require("bcryptjs");
const { createSession } = require("../middleware/session");

exports.register = async (req, res) => {
  try {
    const { email, password, full_name } = req.body;

    // Check if user exists
    const userExists = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.error(400, "Email already registered");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const { rows } = await pool.query(
      `INSERT INTO users (email, password, full_name) 
       VALUES ($1, $2, $3) 
       RETURNING id, email, full_name`,
      [email, hashedPassword, full_name]
    );

    // Create session token
    const token = createSession(rows[0]);

    // Return success response
    return res.status(201).json({
      message: "Registration successful",
      user: rows[0],
      token,
    });
  } catch (error) {
    console.error(error);

    if (error.code === "42P01") {
      return res.error(
        500,
        "Database setup incomplete",
        "Users table not found"
      );
    }

    if (error.code === "23505") {
      return res.error(400, "Email already registered");
    }

    return res.error(
      500,
      "Registration failed",
      process.env.NODE_ENV === "development" ? error.message : undefined
    );
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check user exists
    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (rows.length === 0) {
      return res.error(400, "Invalid credentials");
    }

    // Check password
    const isMatch = await bcrypt.compare(password, rows[0].password);
    if (!isMatch) {
      return res.error(400, "Invalid credentials");
    }

    const { password: _, ...user } = rows[0];
    const token = createSession(user);

    return res.json({
      message: "Login successful",
      user,
      token,
    });
  } catch (error) {
    if (error.code === "42P01") {
      return res.error(
        500,
        "Database setup incomplete",
        "Users table not found"
      );
    }
    return res.error(500, "Login failed", error.message);
  }
};

exports.getMe = async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, email, full_name, role FROM users WHERE id = $1",
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
