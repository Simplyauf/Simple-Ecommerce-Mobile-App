const responseHandler = (req, res, next) => {
  const originalJson = res.json;
  res.json = function (data) {
    const standardResponse = {
      errors: false,
      message: data.message || "Success",
      data: data,
      token: data.token,
      timestamp: new Date().toISOString(),
    };

    let finalResponse = data?.errors ? data : standardResponse;

    Object.keys(finalResponse).forEach(
      (key) => finalResponse[key] === undefined && delete finalResponse[key]
    );

    return originalJson.call(this, finalResponse);
  };

  res.error = function (statusCode, message, error = null) {
    const errorResponse = {
      errors: true,
      message: message,
      error: process.env.NODE_ENV === "development" ? error : undefined,
      timestamp: new Date().toISOString(),
    };

    return res.status(statusCode).json(errorResponse);
  };

  next();
};

module.exports = responseHandler;
