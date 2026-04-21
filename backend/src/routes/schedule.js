const router = require('express').Router();
const { getSchedule } = require('../controllers/scheduleController');

router.get('/', getSchedule);

module.exports = router;
