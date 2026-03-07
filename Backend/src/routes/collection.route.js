const express = require ('express');
const router = express.Router();
const controller = require ('../controllers/collection.controller');
const { verifyToken, verifyTokenOption } = require('../middlewares/auth.middleware');

router.post('/', verifyToken, controller.create);
router.get('/mine', verifyToken, controller.getMine);
router.get('/:id', verifyTokenOption, controller.getDetail);
router.post('/add-art/:id', verifyToken, controller.add);
router.delete('/:id/remove', verifyToken, controller.remove);
router.delete('/:id', verifyToken, controller.delete);
router.patch('/:id', verifyToken, controller.update);

module.exports = router;