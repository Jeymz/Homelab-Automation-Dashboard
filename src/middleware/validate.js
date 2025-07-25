const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

/**
 * Return middleware validating req[property] against schema.
 * If invalid, respond with 400 and error details.
 * @param {object} schema Ajv schema
 * @param {string} [property='body'] Request property to validate
 */
module.exports = function validate(schema, property = 'body') {
  const validateFn = ajv.compile(schema);
  return (req, res, next) => {
    const valid = validateFn(req[property]);
    if (!valid) {
      return res.status(400).json({ success: false, error: validateFn.errors });
    }
    return next();
  };
};
