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
  return resp.data.results;
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
    id: t.id,
    name: t.name,
    popularity: t.popularity
  }));
}

async function recommendFilmsByTags(tagIds, take = 50) {
  const url = `${QLOO_API_URL}/v2/insights`;
  const { data } = await axios.get(url, {
    headers: {
      accept: 'application/json',
      'X-Api-Key': QLOO_API_KEY,
    },
    params: {
      'filter.type': 'urn:entity:movie',
      'filter.tags': tagIds.join(','),
      'operator.filter.tags': 'union',
      'signal.interests.tags': tagIds.join(','),
      'signal.interests.tags.weight': 1,
      take: take,
    }
  });

  return data.results.entities.map(e => ({
    title: e.name,
    id: e.entity_id,
    year: e.properties.release_year
  }));
}

async function recommendArtistByTags(genreTagIds,tagIds, minDob, maxDob, gender, take = 50) {
  const url = `${QLOO_API_URL}/v2/insights`;
  const { data } = await axios.get(url, {
    headers: {
      accept: 'application/json',
      'X-Api-Key': QLOO_API_KEY,
    },
     params: {
      'filter.type':                  'urn:entity:actor',
      'filter.date_of_birth.min':     minDob,
      'filter.date_of_birth.max':     maxDob,
      'filter.results.gender':        gender,
      'filter.results.tags':          genreTagIds.join(','),
      'operator.filter.results.tags': 'intersection',
      'signal.interests.tags':        tagIds.join(','),
      'signal.interests.tags.weight': 1,

      sort_by:                        'affinity',
      take
    }
  });

  return data;
}


async function getBroaderMatches(tagIds, take = 50) {
  const { data } = await axios.get(`${QLOO_API_URL}/v2/insights`, {
    headers: { accept: 'application/json', 'X-Api-Key': QLOO_API_KEY },
    params: {
      'filter.type': 'urn:entity:movie',
      'filter.tags': tagIds.join(','),
      'operator.filter.tags': 'union',
      'signal.interests.tags': tagIds.join(','),
      'signal.interests.tags.weight': 1,
      sort_by: 'affinity',
      take
    }
  });
  return data.results.entities.map(e => ({
    id: e.entity_id,
    title: e.name,
    score: e.score
  }));
}

async function fetchFilmTags(filmIds) {
  // Qloo’s “entities” endpoint returns metadata including .tags
  const { data } = await axios.get(`${QLOO_API_URL}/search`, {
    headers: { accept: 'application/json', 'X-Api-Key': QLOO_API_KEY },
    params: {
      type: 'urn:entity:movie',
      ids: filmIds.join(',')
    }
  });
  const map = {};
  for (const ent of data.results.entities) {
    map[ent.entity_id] = ent.tags.map(t => t.tag_id);
  }
  return map;
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
  return data.results;
}

module.exports = { searchQloo, trendsQloo, insightsQloo, seedEntityForStory, getTags, recommendFilmsByTags, getBroaderMatches, fetchFilmTags, recommendArtistByTags };
