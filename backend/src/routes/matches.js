const router = require('express').Router();
const { listMatches, getLiveMatches, updateMatch, createMatch, deleteMatch } = require('../controllers/matchController');

router.get('/live',  getLiveMatches);
router.get('/',      listMatches);
router.post('/',     createMatch);
router.post('/:id',  updateMatch);
router.delete('/:id',deleteMatch);

module.exports = router;
