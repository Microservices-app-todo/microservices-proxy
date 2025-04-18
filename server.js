const express = require('express');
const cors = require('cors');
const rateLimit = require('./middlewares/rateLimit');
const gatekeeper = require('./middlewares/gatekeeper');
const proxyRoute = require('./routes/proxy');

const app = express();
app.use(cors());
app.use(express.json());

app.use(rateLimit);
app.use('/proxy', gatekeeper, proxyRoute);

const PORT = process.env.PORT || 8085;
app.listen(PORT, () => {
  console.log(`Proxy service running on port ${PORT}`);
});
