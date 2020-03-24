const express = require('express');
const router = express.Router();
const dataController  = require('../controllers/coronaCases');

router.get('', dataController.getCorona)

module.exports = router;