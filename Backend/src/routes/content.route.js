const express = require ('express');
const { verifyToken, authorize } = require('../middlewares/auth.middleware');
const router = express.Router();
const controller = require ('../controllers/content.controller');

router.get('/', controller.get);
router.post('/:id', verifyToken, authorize(['admin']), controller.save);
router.delete('/:id', verifyToken, authorize(['admin']), controller.delete);
router.patch('/', verifyToken, authorize(['admin']), controller.orderUpdate);

module.exports = router;