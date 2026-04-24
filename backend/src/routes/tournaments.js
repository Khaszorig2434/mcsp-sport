const router = require('express').Router();
const { listTournaments, getTournament, updateTournament, getIndividualPlacements, setIndividualPlacements, clearIndividualPlacements, listTeams, updateTeam } = require('../controllers/tournamentController');

router.get('/teams',                          listTeams);
router.patch('/teams/:id',                    updateTeam);
router.get('/',                               listTournaments);
router.get('/:id',                            getTournament);
router.patch('/:id',                          updateTournament);
router.get('/:id/individual-placements',      getIndividualPlacements);
router.post('/:id/individual-placements',     setIndividualPlacements);
router.delete('/:id/individual-placements',   clearIndividualPlacements);

module.exports = router;
