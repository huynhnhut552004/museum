const express = require ('express');
const router = express.Router();
const controller = require ('../controllers/category.controller');
const {verifyToken, authorize} = require ('../middlewares/auth.middleware');

router.post('/', verifyToken, authorize(['admin']), controller.create);
router.get('/', controller.getAll);
router.get('/Layout', controller.getByLayout);
router.patch('/:id', verifyToken, authorize(['admin']), controller.update);
router.patch('/:id/3D-config', verifyToken, authorize(['admin']), controller.update3D);
router.delete('/:id', verifyToken, authorize(['admin']), controller.delete);
router.get('/:slug', controller.getBySlug);

module.exports= router;