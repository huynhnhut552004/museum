const express = require ('express');
const router = express.Router();
const controller = require ('../controllers/search.controller');

router.post('/', controller.Click);
router.get('/', controller.getHot);

module.exports = router;