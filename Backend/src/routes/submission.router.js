const express = require ('express');
const { verifyToken, authorize } = require('../middlewares/auth.middleware');
const router = express.Router();
const controller = require ('../controllers/submission.controller');

router.post('/', controller.create);
router.get('/',verifyToken, authorize(['admin']), controller.get);
router.post('/:id',verifyToken, authorize(['admin']), controller.Readed);
router.delete('/:id',verifyToken, authorize(['admin']), controller.delete);

module.exports = router;