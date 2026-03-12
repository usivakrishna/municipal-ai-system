const axios = require('axios');

const aiClient = axios.create({
  baseURL: process.env.AI_SERVICE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

module.exports = aiClient;
