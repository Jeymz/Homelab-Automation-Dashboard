// src/routes/rabbitmqSnapshot.js
// Route for RabbitMQ snapshot collector
const express = require('express');
const router = express.Router();
const controller = require('../controllers').rabbitmq;

router.get('/snapshot', controller.getRabbitMQSnapshot);

module.exports = router;
