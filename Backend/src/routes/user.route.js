const express = require ('express');
const { verifyToken, authorize } = require('../middlewares/auth.middleware');
const router = express.Router();
const controller = require ('../controllers/user.controller');

router.get('/', verifyToken, controller.get);
router.get('/getAll', verifyToken, authorize(['admin']), controller.getUser);
router.post('/getByEmail', controller.getByEmail);
router.patch('/update', verifyToken, controller.update);
router.post('/changeEmail', verifyToken, controller.changeEmail);
router.post('/verifyEmail', verifyToken, controller.verifyChangeEmail);
router.post('/changePassword', verifyToken, controller.changePassword);
router.post('/createUser', verifyToken, controller.createUser);
router.patch('/ban/:id', verifyToken, authorize(['admin']), controller.Ban);

module.exports = router;