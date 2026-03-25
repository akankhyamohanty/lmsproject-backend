const express = require('express');
const router = express.Router();
const batchController = require('../controllers/batchController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, batchController.getBatches);
router.get('/:id', verifyToken, batchController.getBatchById);
router.post('/', verifyToken, batchController.createBatch);
router.delete('/:id', verifyToken, batchController.deleteBatch);

module.exports = router;