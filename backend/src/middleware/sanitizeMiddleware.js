/**
 * Middleware to sanitize inputs against NoSQL Injection and XSS
 */

const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    // Strip keys starting with '$' or containing '.' (NoSQL operator injection prevention)
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }

    if (typeof value === 'object' && value !== null) {
      cleaned[key] = sanitizeObject(value);
    } else if (typeof value === 'string') {
      // Basic XSS sanitization for string fields: neutralize dangerous script tags
      cleaned[key] = value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
};

const sanitizeInput = (req, res, next) => {
  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  if (req.params) req.params = sanitizeObject(req.params);
  next();
};

module.exports = sanitizeInput;
