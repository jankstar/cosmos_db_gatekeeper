var express = require('express');
var router = express.Router();
const { TITLE } = require('../config.js');

/* GET home page. */
router.get('/',
  async (req, res, next) => {
    var msg = '';
    if (res.locals.messages && res.locals.messages[0]) {
      msg = res.locals.messages[0];
    }
    res.render('index', { title: TITLE, message: msg });
  });

router.post('/api',
  async (req, res, next) => {
    try {
      if (!req.body.username) { throw "User not valide." }
      if (!req.body.bearer) { throw "Bearer not valide." }
      //if (!req.user || !req.user.role || !req.user.role.includes('api')) { throw "Wrong role." }
      const { resource: user } = await db.User.item(req.body.username, req.body.username).read();
      if (!user) { throw "User not valide." }
      if (user.bearer != req.body.bearer) { throw "Bearer not valide." }
      var lToken = user.token || '';
      if (!lToken) {
        //new Token
        var newToken = crypto.randomBytes(265);
        lToken = newToken.toString('base64')
        user.token = lToken;
        db.User.items.upsert(user);
      }
      res.json({ data: lToken })
    } catch (err) {
      res.status(400).json({ data: err.message })
    }
  });

module.exports = router;
