const express = require('express');
const { verifyToken, authorize } = require('../middlewares/auth.middleware');
const router = express.Router();
const { uploadCMS } = require('../middlewares/upload.middleware');
const controller = require('../controllers/content.controller');

router.get('/', controller.get);
router.post('/:id', verifyToken, authorize(['admin']), uploadCMS.single('file'), controller.save);
router.delete('/:id', verifyToken, authorize(['admin']), controller.delete);
router.patch('/', verifyToken, authorize(['admin']), controller.orderUpdate);

module.exports = router;