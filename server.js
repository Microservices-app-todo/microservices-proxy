// server.js
const express = require('express');
const axios = require('axios');
const app = express();
const cors = require('cors'); // Importa el paquete cors

app.use(cors());
app.use(express.json());

const serviceConfig = {
  '/api/auth': 'http://auth-api:80',
  '/api/todos': 'http://todos-api:80',
  '/zipkin': 'http://zipkin:80',
};

app.post('/proxy', async (req, res) => {
  if (Array.isArray(req.body) && req.body.some(item => item.traceId)) {
    const zipkinUrl = `${serviceConfig['/zipkin']}/api/v2/spans`;

    try {
      const response = await axios.post(zipkinUrl, req.body, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return res.status(response.status).json(response.data);
    } catch (error) {
      const status = error.response?.status || 500;
      const data = error.response?.data || { error: 'Error sending to Zipkin' };
      return res.status(status).json(data);
    }
  }


  const { key, path, method = 'GET', requestData = {} } = req.body;


  const baseUrl = serviceConfig[key];
  if (!baseUrl) {
    return res.status(400).json({ error: `Unknown service key: ${key}` });
  }

  const url = `${baseUrl}${path}`;

  // Capturar el header Authorization si existe
  const headers = {};
  if (req.headers.authorization) {
    headers['Authorization'] = req.headers.authorization;
  }

  try {
    const response = await axios({
      method,
      url,
      data: requestData,
      headers,
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const data = error.response?.data || { error: 'Internal Error' };
    res.status(status).json(data);
  }
});

const PORT = process.env.PORT || 8085;
app.listen(PORT, () => {
  console.log(`Proxy service running on port ${PORT}`);
});
