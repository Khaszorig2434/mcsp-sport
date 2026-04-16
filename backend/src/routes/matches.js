const router = require('express').Router();
const { listMatches, getLiveMatches, updateMatch } = require('../controllers/matchController');

router.get('/live', getLiveMatches);
router.get('/',     listMatches);
router.post('/:id', updateMatch);

module.exports = router;
