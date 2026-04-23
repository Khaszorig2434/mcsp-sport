const router = require('express').Router();
const { listGroups, createGroup, deleteGroup } = require('../controllers/groupsController');

router.get('/',     listGroups);
router.post('/',    createGroup);
router.delete('/:id', deleteGroup);

module.exports = router;
