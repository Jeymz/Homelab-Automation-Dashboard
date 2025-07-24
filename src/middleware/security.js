const helmet = require('helmet');

function security() {
  return helmet();
}

module.exports = security;
