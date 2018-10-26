const { db } = require('../utils');

module.exports = function(paths) {

  return function(req, res, next) {

    // if query terms specified
    if (Object.keys(req.query).length > 0) {

      // for each query term
      for(var i in req.query) {

        // if query term is not part of the model or query term is not set to a value
        if(!paths.includes(i) || req.query[i] == '') {
          res.status(400);
          return next(new Error(`Invalid query term for controller - ${req.method} ${req.originalUrl}`));
        }

        // else if query term is _id and has a value
        else if(i == '_id' && req.query[i] != '') {

          // if query term _id is a valid mongoose objectid return no errors
          if (db.isValidObjectId(req.query._id)) {
            return next();
          }

          // return error otherwise
          res.status(400);
          return next(new Error(`Invalid value for query term _id - ${req.method} ${req.originalUrl}`));
        }
      }
    }

    // return no errors if no query terms or if query term is part of the model, set to a value, and not _id
    return next();

  }
}
