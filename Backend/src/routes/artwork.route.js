const express = require('express');
const router = express.Router();
const { uploadArtwork } = require('../middlewares/upload.middleware');
const { verifyToken, authorize } = require('../middlewares/auth.middleware');
const controller = require('../controllers/artwork.controller');

router.post('/', verifyToken, authorize(['admin']), uploadArtwork.single('image'), controller.create);
router.get('/', controller.getAll);
router.get('/getByAdmin', verifyToken, authorize(['admin']), controller.getByAdmin);
router.get('/getById/:id', verifyToken, authorize(['admin']), controller.getById);
router.patch('/:id', verifyToken, authorize(['admin']), uploadArtwork.single('image'), controller.update);
router.delete('/:id', verifyToken, authorize(['admin']), controller.delete);
router.patch('/:id/3D-config', verifyToken, authorize(['admin']), controller.update3D);
router.post('/:id/annotation', verifyToken, authorize(['admin']), controller.addAnnotations);
router.get('/:slug', controller.getBySlug);

module.exports = router;