const router = require('express').Router();
const { getStandings } = require('../controllers/standingsController');

router.get('/', getStandings);

module.exports = router;
