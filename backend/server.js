require('dotenv').config();

const express = require('express');
const axios = require('axios');
const { searchQloo } = require('./qlooClient');
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});


app.get('/cate-blanchett', async (req, res) => {
  const q = req.query.q || 'cate-blanchett';
  try {
    const data = await searchQloo(q);
    res.json(data);
  } catch (err) {
    const status = err.response?.status || 500;
    const body   = err.response?.data   || err.message;
    res.status(status).json({ error: body });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});