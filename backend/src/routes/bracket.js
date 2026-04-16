const router = require('express').Router();
const { getBracket } = require('../controllers/bracketController');

router.get('/', getBracket);

module.exports = router;
