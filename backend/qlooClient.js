const axios = require('axios');
const { QLOO_API_URL, QLOO_API_KEY } = process.env;

async function searchQloo(query) {
  const url = `${QLOO_API_URL}/search`;
  const resp = await axios.get(url, {
    params: { query },
    headers: { 'X-Api-Key': QLOO_API_KEY }
  });
  return resp.data;
}

module.exports = { searchQloo };
