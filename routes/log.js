const express = require('express');
const router = express.Router();
const logger = require('./logger');
const fs = require('fs');

var log = new logger();

router.post('/logs', function(req, res, next) {
    log.fnWriteLogs(req.body.data);
    res.json({ 'message': 'Success', 'status': 200, 'data': '' });
});

module.exports = router;
