const { RateLimiterMemory } = require('rate-limiter-flexible');

/*
set options for the rate limiter below, each request consumes 1 point
duration is also the expire time once a client has been limited
*/
const opts = {
  points: 200, //  points
  duration: 60 // Per 60 seconds
};

const rateLimiter = new RateLimiterMemory(opts);

module.exports = (req, res, next) => {
rateLimiter.consume(req.ip) // each request consumes 1 point
  .then(() => {
    next();
  })
  .catch(() => {
    // TODO: add ip and time to database collection
    console.log('\x1b[35m%s\x1b[0m',`[${new Date().toLocaleTimeString()}] ${req.ip} has been rate limited`);
    res.status(429);
    next(new Error(
      `You have made excessive requests to the server and have therefore ` +
      `been delayed from sending additional requests temporarily. This incident ` +
      `has been reported and your IP address has been logged!`
    ));
  });
  }
