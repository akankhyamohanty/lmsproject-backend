const express = require('express');
const router  = express.Router();

const {
  getAllInstitutes,
  getInstituteById,
  addInstitute,
  updateInstitute,
  toggleStatus,
  deleteInstitute,
} = require('../controllers/institutecontroller');

const protect = require('../middlewares/authMiddlewares');

router.use(protect);

router.get('/',             getAllInstitutes);
router.get('/:id',          getInstituteById);
router.post('/',            addInstitute);
router.put('/:id',          updateInstitute);
router.patch('/:id/status', toggleStatus);
router.delete('/:id',       deleteInstitute);

module.exports = router;