const express = require('express');
const router = express.Router();
const dataController  = require('../controllers/coronaCases');

router.get('', dataController.getCorona);
router.get('/india', dataController.getCoronaIndia)

module.exports = router;