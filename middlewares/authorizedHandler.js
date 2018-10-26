module.exports = function(level) {
  return function(req, res, next) {

    // if environment is development, allow access without login
    if(process.env.NODE_ENV == 'dev') return next();

    // if user is logged in and their role matches or is higher than specified, allow access
    if (req.session.user && req.session.user.role >= level) {
      return next();
    }

    // Otherwise forward error message to errorHandler and set http status to 401-Unauthorized
    res.status(401);
    return next(new Error(`Not Authorized - ${req.method} ${req.originalUrl}`));
  }
}
