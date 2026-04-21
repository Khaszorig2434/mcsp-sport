const router = require('express').Router();
const { listTournaments, getTournament, setPlacements } = require('../controllers/tournamentController');

router.get('/',             listTournaments);
router.get('/:id',          getTournament);
router.post('/:id/placements', setPlacements);

module.exports = router;
