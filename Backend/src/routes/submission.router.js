const express = require('express');
const { verifyToken, authorize } = require('../middlewares/auth.middleware');
const router = express.Router();
const controller = require('../controllers/submission.controller');

router.post('/', controller.create);
router.get('/', verifyToken, authorize(['admin', 'viewer']), controller.get);
router.get('/searchByAdmin', verifyToken, authorize(['admin', 'viewer']), controller.searchByAdmin);
router.post('/:id', verifyToken, authorize(['admin', 'viewer']), controller.Readed);
router.delete('/:id', verifyToken, authorize(['admin']), controller.delete);

module.exports = router;