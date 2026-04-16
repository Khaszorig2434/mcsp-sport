const router = require('express').Router();
const { listTournaments, getTournament } = require('../controllers/tournamentController');

router.get('/',    listTournaments);
router.get('/:id', getTournament);

module.exports = router;
