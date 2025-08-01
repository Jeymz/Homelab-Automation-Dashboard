const amqp = require('amqplib');
const fs = require('fs/promises');
const path = require('path');

const { getRabbitMQConfig } = require('../utils/rabbitmq');

const QUEUES = [
  'base-uri', 'child-src', 'connect-src', 'default-src', 'font-src', 'form-action', 'frame-src', 'img-src', 'manifest-src', 'media-src', 'navigate-to', 'no-directive', 'object-src', 'prefetch-src', 'require-trusted-types-for', 'sandbox', 'script-src', 'script-src-attr', 'script-src-elem', 'style-src', 'style-src-attr', 'style-src-elem', 'trusted-types', 'upgrade-insecure-requests', 'worker-src'
];

const RABBIT_CONFIG = getRabbitMQConfig();

exports.collectQueueSnapshot = async function collectQueueSnapshot() {
  const results = {};
    let connection;
    try {
      connection = await amqp.connect(RABBIT_CONFIG);
      const channel = await connection.createChannel();
      for (const queue of QUEUES) {
        try {
          // Get queue message count
          const q = await channel.checkQueue(queue);
          const messages = [];
          for (let i = 0; i < q.messageCount; i++) {
            // Get message non-destructively (peek)
            const msg = await channel.get(queue, { noAck: true });
            if (msg && msg.content) {
              let body;
              try {
                body = JSON.parse(msg.content.toString());
                if (body.timestamp) {
                  delete body.timestamp; // Remove timestamp for deduplication
                }
              } catch {
                body = msg.content.toString();
              }
              messages.push(body);
            }
          }
          // Deduplicate and count
          const counts = {};
          for (const m of messages) {
            const key = JSON.stringify(m);
            counts[key] = (counts[key] || 0) + 1;
          }
          results[queue] = Object.entries(counts).map(([message, count]) => ({ message: JSON.parse(message), count }));
        } catch (err) {
          results[queue] = { error: err.message };
        }
      }
      await channel.close();
    } catch (err) {
      throw new Error('RabbitMQ connection failed: ' + err.message);
    } finally {
      if (connection) await connection.close();
    }
    // Write only latest snapshot to a single file, no timestamp
    const filePath = path.join(__dirname, '../../snapshots', 'queue_report.json');
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify({ queueResults: results }, null, 2));
    return { filePath, queueResults: results };
};
