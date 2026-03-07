const express = require ('express');
const { verifyToken, authorize } = require('../middlewares/auth.middleware');
const router = express.Router();
const controller = require ('../controllers/content.controller');

router.get('/', controller.get);
router.post('/:id', verifyToken, authorize(['admin']));
router.delete('/:id', verifyToken, authorize(['admin']));
router.patch('/', verifyToken, authorize(['admin']));

module.exports = router;