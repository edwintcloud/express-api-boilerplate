require('dotenv').config();
process.env.NODE_ENV = process.env.NODE_ENV || 'dev'; // if NODE_ENV not set, then assume we are in development
const express = require('express');
const helmet = require('helmet');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const controllers = require('./controllers');
const { db, _import } = require('./utils');
const { limiter, notFoundHandler, errorHandler } = require('./middlewares');
const app = express();

// Connect to MongoDB
const dbConnection = db.connect();

// Setup express to use our session - make sure to set your secure secret!
app.use(session({
    secret: '1Gc7a4"5/62k*x;>WpT[QVfJ!`0Wi#2o!e5f:XUooox[C[g$qx&F&^jSZ.UF)zj',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1800000  // 30 minutes (in ms) and our session will expire
    },
    store: new MongoStore({
        mongooseConnection: dbConnection
    })
}));

// Setup express to return json
app.use(express.json());

/*
>> Helmet sets various HTTP headers to make our app more secure <<
referrerPolicy() sets policy to no-referrer. This option is useful to hide that
the app is using nginx as a reverse proxy if configured in such a way (reccommended)
*/
app.use(helmet.referrerPolicy())

// Apply our rate limiter middleware to all routes
app.use(limiter);

/*
>> Import our controllers as routes to be used by Express <<
We must make sure the controller is not a destructured import
such as the model that we imported in the controller.
*/
for (var i in controllers) {
  if (Object.getPrototypeOf(controllers[i]) == express.Router) {
    app.use(controllers[i]);
  }
}

// If no routes found then send to notFoundHandler
app.use(notFoundHandler);

// All errors will be sent here and displayed to the user in json format
app.use(errorHandler);

// Export our express server to be used for tests
module.exports = app;
