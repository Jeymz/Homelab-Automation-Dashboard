const helmet = require('helmet');

module.exports = function security() {
  return helmet();
};
