const jwt = require("jsonwebtoken");
const { config } = require("../config/config");

exports.createSession = (user) => {
  // Create session token
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      session: Date.now(), // Add session identifier
    },
    config.jwtSecret,
    { expiresIn: "30d" }
  );

  return token;
};

exports.validateSession = (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.error(401, "No token provided");
    }

    const decoded = jwt.verify(token, config.jwtSecret);

    // Add session validation logic here if needed
    // For example, check against a blacklist of revoked tokens

    req.user = decoded;
    next();
  } catch (error) {
    return res.error(401, "Invalid or expired session");
  }
};
