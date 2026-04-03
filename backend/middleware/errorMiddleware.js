const notFound = (req, res, next) => {
  res.status(404);
  throw new Error("Route Not Found");
};

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
  });
};

module.exports = { notFound, errorHandler };

