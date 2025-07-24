const helmet = require('helmet');

function security() {
  const directives = helmet.contentSecurityPolicy.getDefaultDirectives();
  directives['script-src-attr'] = ["'unsafe-inline'"];
  return helmet({
    contentSecurityPolicy: { directives },
  });
}

module.exports = security;
