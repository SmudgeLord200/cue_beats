const axios = require('axios');
const { text } = require('express');
const { QLOO_API_URL, QLOO_API_KEY } = process.env;

async function searchQloo(query) {
  const url = `${QLOO_API_URL}/search`;
  const resp = await axios.get(url, {
    accept: 'application/json',
    params: { query: query, page: 1, take: 10 },
    headers: { 'X-Api-Key': QLOO_API_KEY }
  });
  return resp.data;
}


async function trendsQloo() {
  const url = `${QLOO_API_URL}/trends/category`;
  const resp = await axios.get(url, {
    headers: { 
      accept: 'application/json',
      'X-Api-Key': QLOO_API_KEY,
    },
    params: { type: 'urn:entity:actor', page: 1, take: 20 }
  });
  return resp.data;
}

// async function insightsQloo() {
//   const url = `${QLOO_API_URL}/v2/insights`;
//   const resp = await axios.get(url, {
//     headers: { 
//       accept: 'application/json',
//       'X-Api-Key': QLOO_API_KEY,
//     },
//     params: { 
//       'filter.type': 'urn:tag',
//       'filter.tag.types': 'urn:entity:media',
//       'filter.parents.types': 'urn:entity:movie, urn:entity:tv_show'
//   }
// });
//   return resp.data;
// }

async function insightsQloo() {
  const url = `${QLOO_API_URL}/v2/insights`;
  const resp = await axios.get(url, {
    headers: { 
      accept: 'application/json',
      'X-Api-Key': QLOO_API_KEY,
    },
    params: { 
      'filter.type': 'urn:entity:artist',
      'filter.results.entities.query': 'New York'
    }
});
  return resp.data;
}


async function getTags(query) {
  const url = `${QLOO_API_URL}/v2/tags`;
  const resp = await axios.get(url, {
    headers: { 
      accept: 'application/json',
      'X-Api-Key': QLOO_API_KEY,
    },
    params: { 
      'filter.typo_tolerance': 'true',
      'filter.query': query,
      'filter.parents.types': 'urn:entity:movie, urn:entity:tv_show'
    }
});
   return resp.data.results.tags.map(t => ({
    id:         t.id,
    name:       t.name,
    popularity: t.popularity
  }));
}

async function recommendFilmsByTags(tagIds, take = 20) {
  const url = `${QLOO_API_URL}/v2/insights`;
  const { data } = await axios.get(url, {
    headers: {
      accept: 'application/json',
      'X-Api-Key': QLOO_API_KEY,
    },
    params: {
      'filter.type':         'urn:entity:movie',
      'filter.tags':         tagIds.join(','),            
      'operator.filter.tags': 'union',                    
      take,                                               
      'feature.explainability': false                      
    }
  });
  
  return data.results.entities.map(e => ({
    title: e.name,
    id:    e.entity_id,
    score: e.score
  }));
}

  

async function seedEntityForStory(logline) {
  const url = `${QLOO_API_URL}/search`;
  const { data } = await axios.get(url, {
    headers: { 'X-Api-Key': QLOO_API_KEY },
    params: { 
      query: logline,
      types: 'urn:entity:movie',
      value: 'urn:tag:genre:crime'
    }
  });
  // data.results[0] might be { entity_id: "film::tt0105236", item:"The Silence of the Lambs", ... }
  return data.results;
}

module.exports = { searchQloo, trendsQloo, insightsQloo, seedEntityForStory, getTags, recommendFilmsByTags };
