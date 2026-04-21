const router = require('express').Router();
const { listTournaments, getTournament, getIndividualPlacements, setIndividualPlacements, clearIndividualPlacements } = require('../controllers/tournamentController');

router.get('/',                               listTournaments);
router.get('/:id',                            getTournament);
router.get('/:id/individual-placements',      getIndividualPlacements);
router.post('/:id/individual-placements',     setIndividualPlacements);
router.delete('/:id/individual-placements',   clearIndividualPlacements);

module.exports = router;
