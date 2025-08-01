// src/controllers/rabbitmqSnapshotController.js
// Controller for RabbitMQ snapshot collection
const { collectQueueSnapshot } = require('../services/rabbitmq');

exports.getRabbitMQSnapshot = async function getRabbitMQSnapshot(req, res, next) {
  try {
    const result = await collectQueueSnapshot();
    res.status(200).json(result);
  } catch (err) {
    // Redact error details for security
    res.status(500).json({ error: 'Failed to collect RabbitMQ snapshot.' });
    next(err);
  }
};
