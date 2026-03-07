const express = require ('express');
const { verifyToken, authorize } = require('../middlewares/auth.middleware');
const router = express.Router();
const controller = require('../controllers/event.controller');
const { uploadCMS } = require('../middlewares/upload.middleware');

router.get('/', controller.get);
router.post('/', verifyToken, authorize(['admin']), uploadCMS.single('image'), controller.create);
router.patch('/:id', verifyToken, authorize(['admin']), uploadCMS.single('image'), controller.update);
router.delete('/:id', verifyToken, authorize(['admin']), controller.delete);
router.get('/:slug', controller.getBySlug);

module.exports = router;