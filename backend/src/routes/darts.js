const router = require('express').Router();
const {
  getDartsGroups, createDartsGroup, deleteDartsGroup,
  listDartsMatches, updateDartsMatch, createDartsMatch, deleteDartsMatch,
  getDartsBracket, getDartsStandings,
} = require('../controllers/dartsController');

router.get('/groups',          getDartsGroups);
router.post('/groups',         createDartsGroup);
router.delete('/groups/:id',   deleteDartsGroup);

router.get('/matches',         listDartsMatches);
router.post('/matches',        createDartsMatch);
router.post('/matches/:id',    updateDartsMatch);
router.delete('/matches/:id',  deleteDartsMatch);

router.get('/bracket',         getDartsBracket);
router.get('/standings',       getDartsStandings);

module.exports = router;
