const router = require('express').Router();
const {
  getTTGroups, createTTGroup, deleteTTGroup,
  listTTMatches, updateTTMatch, createTTMatch, deleteTTMatch,
  getTTBracket, getTTStandings,
} = require('../controllers/ttController');

router.get('/groups',         getTTGroups);
router.post('/groups',        createTTGroup);
router.delete('/groups/:id',  deleteTTGroup);

router.get('/matches',        listTTMatches);
router.post('/matches',       createTTMatch);
router.post('/matches/:id',   updateTTMatch);
router.delete('/matches/:id', deleteTTMatch);

router.get('/bracket',        getTTBracket);
router.get('/standings',      getTTStandings);

module.exports = router;
