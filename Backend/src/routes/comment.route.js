const express = require ('express');
const { verifyTokenOption, verifyToken, authorize } = require('../middlewares/auth.middleware');
const router = express.Router();
const controller = require ('../controllers/comment.controller');

router.post('/event/:eId', verifyToken, controller.create);
router.post('/artwork/:aId', verifyToken, controller.create);
router.get('/event/:eId', verifyTokenOption, controller.get);
router.get('/artwork/:aId', verifyTokenOption, controller.get);
router.get('/:id/replies', verifyTokenOption, controller.getRep);
router.post('/:id/like', verifyToken, controller.toggleLikeComment);
router.delete('/:id', verifyToken, controller.delete);
router.post('/:id/pin', verifyToken, authorize(['admin']), controller.pin);

module.exports = router;