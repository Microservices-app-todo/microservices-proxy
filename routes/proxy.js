const express = require('express');
const router = express.Router();
const axios = require('axios');
const serviceConfig = require('../config/services');

router.post('/', async (req, res) => {
  if (Array.isArray(req.body) && req.body.some(item => item.traceId)) {
    const zipkinUrl = `${serviceConfig['/zipkin']}/api/v2/spans`;

    try {
      const response = await axios.post(zipkinUrl, req.body, {
        headers: { 'Content-Type': 'application/json' },
      });
      return res.status(response.status).json(response.data);
    } catch (error) {
      const status = error.response?.status || 500;
      const data = error.response?.data || { error: 'Error sending to tracing system.' };
      return res.status(status).json(data);
    }
  }

  const { key, path, method = 'GET', requestData = {} } = req.body;
  const baseUrl = serviceConfig[key];
  if (!baseUrl) {
    return res.status(400).json({ error: `Unknown service key.` });
  }

  const url = `${baseUrl}${path}`;
  const headers = {};
  if (req.headers.authorization) headers['Authorization'] = req.headers.authorization;

  try {
    const response = await axios({ method, url, data: requestData, headers });
    res.status(response.status).json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const data = error.response?.data || { error: 'Internal request failed.' };
    res.status(status).json(data);
  }
});

module.exports = router;
