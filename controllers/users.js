const router = require('express').Router();
const { authorizedHandler, validQueryHandler } = require('../middlewares');
const { db } = require('../utils');
const { user } = require('../models');

// routes below
router.route('/users')

  // all routes should run these middlewares first
  .all(validQueryHandler(Object.keys(user.schema.paths)))

  // GET/READ
  .get(authorizedHandler(3), (req, res, next) => {
    if(Object.keys(req.query).length == 0) {
      user.find().lean().then(users => {
        res.json(users);
      }).catch(error => {
        res.status(400);
        next(new Error(error));
      });
    } else {
      let query = db.queryToAndDbQuery(req.query);
      user.find(query).lean().then(users => {
        if(users.length == 1) {
          res.json(users[0]);
        } else {
          res.json(users);
        }
      }).catch(error => {
        res.status(400);
        next(new Error(error.message));
      });
    }
  })

  // POST/CREATE - REGISTER
  .post((req, res, next) => {
    if(Object.keys(req.query).length == 0) {
      user.create(req.body).then(user => {
        user.password = undefined;
        user.__v = undefined;
        req.session.user = user;
        res.status(201);  // http status created
        res.json(user);
      }).catch(error => {
        if(error.code == 11000) {
          res.status(409);  // conflict oh no
          next(new Error(`User already registered with specified username or email!`));
        } else {
          res.status(400);
          next(new Error(error.message));
        }

      });
    } else {
      res.status(400);
      next(new Error(`Route does not accept query parameters - ${req.method} ${req.originalUrl}`));
    }
  })

  // PUT/UPDATE
  .put(authorizedHandler(3), (req, res, next) => {
    if(Object.keys(req.query).length == 1) {
      user.findOneAndUpdate(req.query, req.body, { new: true }).lean().then(user => {
        user.password = undefined;
        user.__v = undefined;
        res.json(user);
      }).catch(error => {
        res.status(400);
        next(new Error(error.message));
      });
    } else {
      res.status(400);
      next(new Error(`Route requires a single query parameter - ${req.method} ${req.originalUrl}`));
    }
  })

  // DELETE/REMOVE
  .delete(authorizedHandler(3), (req, res, next) => {
    if(Object.keys(req.query).length == 1) {

      user.findOneAndDelete(req.query).lean().then(user => {
        user.password = undefined;
        user.__v = undefined;
        res.json(user);
      }).catch(error => {
        res.status(400);
        next(new Error(error.message));
      });
    } else {
      res.status(400);
      next(new Error(`Route requires a single query parameter - ${req.method} ${req.originalUrl}`));
    }
  });

// get current logged in user
router.get(`/users/current`, (req, res, next) => {
  if(req.session.user) {
    res.json(req.session.user);
  } else {
    res.status(401);
    next(new Error(`You are not currently logged in! Please login again.`));
  }
});

// login user and set session
router.post(`/users/login`, (req, res, next) => {
  user.authenticate(req.body.email, req.body.password).then(user => {
    req.session.user = user;
    res.json(user);
  }).catch(error => {
    res.status(401);
    next(new Error(error.message));
  });
});

// logout user by destroying session
router.post(`/users/logout`, (req, res, next) => {
  req.session.destroy();
  res.json({
    message: `User successfully logged out!`
  });
});

// make updates to currently logged in user
router.put(`/users/update`, (req, res, next) => {
  // paths allowed to be updated by user
  let paths = ['username', 'password', 'email'];
  for (var i in req.body) {
    if(!paths.includes(i)) {
      res.status(400);
      return next(new Error(`Unable to update!`));
    }
  }
  
  if(req.session.user) {
    user.findOneAndUpdate({ _id: req.session.user._id }, req.body, { new: true }).lean().then(user => {
      user.password = undefined;
      user.__v = undefined;
      res.json(user);
    }).catch(error => {
      res.status(400);
      next(new Error(error.message));
    });
  } else {
    res.status(400);
    next(new Error(`You must be logged in to do that!`));
  }
});

// delete currently logged in user
router.delete(`/users/delete`, (req, res, next) => {
  if(req.session.user) {
    user.findOneAndDelete({ _id: req.session.user._id }).lean().then(user => {
      req.session.destroy();
      res.json({
        message: `You have been logged out!`
      });
    }).catch(error => {
      res.status(400);
      next(new Error(error.message));
    });
  } else {
    res.status(400);
    next(new Error(`You must be logged in to do that!`));
  }
});

module.exports = router;
