require('dotenv').config({ quiet: true });

exports.getRabbitMQConfig = function getRabbitMQConfig() {
  return {
    protocol: 'amqp',
    hostname: process.env.RABBITMQ_HOST,
    port: process.env.RABBITMQ_PORT || 5672,
    username: process.env.RABBITMQ_USERNAME,
    password: process.env.RABBITMQ_PASSWORD,
    vhost: process.env.RABBITMQ_VHOST || '/',
  };
};
