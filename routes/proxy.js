const express = require('express');
const router = express.Router();
const axios = require('axios');
const serviceConfig = require('../config/services');

router.post('/', async (req, res) => {
  const startTime = Date.now();

  console.log('📥 Incoming Request');
  console.log('➡️  Method:', req.method);
  console.log('➡️  URL:', req.originalUrl);
  console.log('➡️  IP:', req.ip);
  console.log('➡️  Headers:', req.headers);
  console.log('➡️  Body:', req.body);
  console.log('➡️  Query Params:', req.query);
  console.log('➡️  Route Params:', req.params);

  try {
    // 🚨 Si es un trace (Zipkin)
    if (Array.isArray(req.body) && req.body.some(item => item.traceId)) {
      const zipkinUrl = `${serviceConfig['/zipkin']}/api/v2/spans`;

      const response = await axios.post(zipkinUrl, req.body, {
        headers: { 'Content-Type': 'application/json' },
      });

      const duration = Date.now() - startTime;
      console.log(`✅ Sent tracing data to Zipkin. Status: ${response.status}. Duration: ${duration}ms`);
      return res.status(response.status).json(response.data);
    }

    // 🧩 Petición proxy normal
    const { key, path, method = 'GET', requestData = {} } = req.body;
    const baseUrl = serviceConfig[key];

    if (!baseUrl) {
      console.warn('⚠️ Unknown service key:', key);
      return res.status(400).json({ error: 'Unknown service key.' });
    }

    const url = `${baseUrl}${path}`;
    const headers = {};

    if (req.headers.authorization) headers['Authorization'] = req.headers.authorization;

    const response = await axios({ method, url, data: requestData, headers });

    const duration = Date.now() - startTime;
    console.log(`✅ Proxy request successful. ${method} ${url} → ${response.status}. Duration: ${duration}ms`);

    return res.status(response.status).json(response.data);
  } catch (error) {
    const duration = Date.now() - startTime;
    const status = error.response?.status || 500;
    const message = error.response?.data || error.message || 'Internal error';

    console.error(`❌ Proxy request failed after ${duration}ms`);
    console.error('Status:', status);
    console.error('Error message:', message);
    if (error.config) {
      console.error('Request:', {
        method: error.config.method,
        url: error.config.url,
        headers: error.config.headers,
        data: error.config.data,
      });
    }

    return res.status(status).json({ error: 'Internal request failed.' });
  }
});

module.exports = router;
