const suspiciousPatterns = [
    /\$ne/i,
    /\$or/i,
    /select\s+.*\s+from/i,
    /insert\s+into/i,
    /eval\(/i,
    /<script>/i,
    /onerror\s*=/i,
    /--/g,
    /\.\.\//,
    /[\{\}\[\]]/,
  ];
  
  const scanObject = (obj) => {
    if (typeof obj === 'string') {
      return suspiciousPatterns.some(pattern => pattern.test(obj));
    }
    if (typeof obj === 'object' && obj !== null) {
      return Object.values(obj).some(scanObject);
    }
    return false;
  };
  
  module.exports = (req, res, next) => {
    if (scanObject(req.body.requestData)) {
      return res.status(400).json({ error: 'Invalid request payload.' });
    }
    next();
  };
  