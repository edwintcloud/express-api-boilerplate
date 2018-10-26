const router = require('express').Router();

router.get('/', (req, res) => {
  res.json({
    message: `Welcome to my api! 🎉`
  });
});

module.exports = router;
