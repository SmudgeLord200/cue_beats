const axios = require('axios');
const { QLOO_API_URL, QLOO_API_KEY } = process.env;

async function qlooTags(query) {
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

async function qlooRecommendation(
  genreTagIds,
  tagIds,
  earliest,
  latest,
  gender,
  take = 50
) {
  const actorTags = 'urn:tag:occupation:person:actor';
  const tags = [...genreTagIds, tagIds].join(',');
  const url = `${QLOO_API_URL}/v2/insights`;
  const { data } = await axios.get(url, {
    headers: {
      accept: 'application/json',
      'X-Api-Key': QLOO_API_KEY,
    },
    params: {
      'filter.type': 'urn:entity:person',
      'filter.parents.types': 'urn:entity:actor',
      'filter.date_of_birth.min': earliest, // Oldest: 1965-07-01
      'filter.date_of_birth.max': latest, // Youngest: 1985-07-31
      'filter.gender': gender,
      'filter.tags': actorTags,
      'operator.filter.tags': 'intersection',
      'signal.interests.tags': tags,
      'signal.interests.tags.weight': 1,
      sort_by: 'affinity',
      take
    }
  });

  return data.results.entities.map(e => {
    const enDesc = (e.properties.short_descriptions || [])
      .find(desc => desc.language === 'en')?.value;
    const imdbId = e.external?.imdb_id?.[0]?.id;

    return {
      id: e.entity_id,
      name: e.name,
      citizenship: e.properties.citizenship,
      date_of_birth: e.properties.date_of_birth,
      gender: e.properties.gender,
      popularity: e.popularity,
      image: e.properties.image,
      imdb_id: imdbId || '',
      short_description: enDesc || '',
      nominated_for: e.properties.nominated_for,
      affinity: e.query.affinity
    };
  });
}

module.exports = { qlooRecommendation, qlooTags };
