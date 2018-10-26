module.exports = function(error, req, res, next) {
  res.status(res.statusCode || 500);
  res.json({
    message: error.message
  });
};
