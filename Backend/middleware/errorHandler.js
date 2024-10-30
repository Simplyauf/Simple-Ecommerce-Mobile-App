const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === "ValidationError") {
    return res.error(400, "Validation Error", err.errors);
  }

  if (err.name === "UnauthorizedError") {
    return res.error(401, "Invalid token", err.message);
  }

  return res.error(
    500,
    "Something went wrong!",
    process.env.NODE_ENV === "development" ? err.message : undefined
  );
};

module.exports = errorHandler;
