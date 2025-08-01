require('dotenv').config();

const express = require('express');
const axios = require('axios');
const { searchQloo, trendsQloo, insightsQloo, seedEntityForStory, getTags, recommendFilmsByTags, getBroaderMatches, fetchFilmTags, recommendArtistByTags } = require('./qlooClient');
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});


app.get('/searchQloo', async (req, res) => {
  const q = req.query.q || 'cate-blanchett';
  try {
    const data = await searchQloo(q);
    res.json(data);
  } catch (err) {
    const status = err.response?.status || 500;
    const body = err.response?.data || err.message;
    res.status(status).json({ error: body });
  }
});

app.get('/trendsQloo', async (req, res) => {
  try {
    const data = await trendsQloo();
    res.json(data);
  } catch (err) {
    const status = err.response?.status || 500;
    const body = err.response?.data || err.message;
    res.status(status).json({ error: body });
  }
});

app.get('/insightsQloo', async (req, res) => {
  try {
    const data = await insightsQloo();
    res.json(data);
  } catch (err) {
    const status = err.response?.status || 500;
    const body = err.response?.data || err.message;
    res.status(status).json({ error: body });
  }
});

app.get('/getTags', async (req, res) => {
  const setOfTags = [
    "female protagonist",
    "orchestra conductor",
    "composer as protagonist",
    "power dynamics",
    "psychological drama",
    "commanding presence",
    "artistic integrity",
    "emotional intensity",
    "complex morality",
    "character study"
  ];

  try {
    const uniqueTags = await fetchUniqueTagsWithPopularity(setOfTags);
    return res.json(uniqueTags);
  } catch (err) {
    const status = err.response?.status || 500;
    const body = err.response?.data || err.message;
    res.status(status).json({ error: body });
  }
});

app.get('/Tar', async (req, res) => {
  const logline = req.query.logline || 'TÁR';
  try {
    const data = await seedEntityForStory(logline);
    res.json(data);
  } catch (err) {
    const status = err.response?.status || 500;
    const body = err.response?.data || err.message;
    res.status(status).json({ error: body });
  }
});

app.get('/seedEntityForStory', async (req, res) => {
  const logline = req.query.logline || 'TÁR';
  try {
    const data = await seedEntityForStory(logline);
    res.json(data);
  } catch (err) {
    const status = err.response?.status || 500;
    const body = err.response?.data || err.message;
    res.status(status).json({ error: body });
  }
});

app.get('/deprecatedCueBeats', async (req, res) => {
  const logline = 'A renowned conductor at the height of her career faces internal struggles and external pressures, challenging her grip on reality, power, and artistic integrity.';
  const synopsis = 'TÁR follows the story of Lydia Tár, a celebrated classical music conductor and composer known globally for her musical brilliance and influential career. As Lydia prepares for a milestone live recording of Mahler’s Symphony No. 5 with the Berlin Philharmonic, she begins to confront mounting tensions within her personal and professional worlds. Haunted by unresolved relationships, unspoken rivalries, and internal battles with anxiety, Lydia struggles to maintain control over her meticulously curated life. Throughout the narrative, Lydia faces accusations, personal betrayals, and the resurfacing of past indiscretions, causing her carefully constructed world to slowly unravel. Her interactions with colleagues, students, her assistant Francesca, and her family, especially her partner Sharon and daughter Petra, amplify her internal crisis, ultimately questioning the balance between ambition and humanity, genius and morality. The film delves into the psychological complexity of an artist who simultaneously inspires awe and controversy, probing the intense demands of artistry, power dynamics, identity, and self-destruction.'

  const wholeStory = logline + ' ' + synopsis;

  // LLM provides a set of tags based on the logline and synopsis
  // For example: ['power imbalance', 'artistic integrity', 'personal crisis', '
  const setOfTags = [
    "drama",
    "classical music",
    "female protagonist",
    "composer as protagonist",
    "identity crisis",
    "psychological drama",
    "anxiety",
    "self-destruction",
    "family relationships",
    "professional rivalry"
  ];

  try {
    // Fetch unique tags from Qloo API based on the set of tags
    // Example: ['urn:tag:archetype:qloo:betrayal', 'urn:tag:keyword:qloo:psychological_drama', 'urn:tag:keyword:media:classical_music']
    const uniqueTags = await fetchUniqueTagsWithPopularity(setOfTags);
    const tagIds = uniqueTags
      .map(t => t.id);

    // console.log('tagIds:', uniqueTags);
    // return res.json(uniqueTags);

    const data = await recommendFilmsByTags(tagIds);
    return res.json(data);
    // const broad = await getBroaderMatches(tagIds, 50);

    // const topMatches = await filterByMinTagMatches(broad, tagIds, 5);

    // return res.json(topMatches)

  } catch (err) {
    console.error('Error fetching tags:', err);
    return res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

app.get('/recommendFilmsByTags', async (req, res) => {

  // LLM provides a set of tags based on the logline and synopsis
  // For example: ['power imbalance', 'artistic integrity', 'personal crisis']
  const tagIds = [
    'urn:tag:genre:media:drama',
    'urn:tag:keyword:media:bullying',
    'urn:tag:keyword:media:classical_music',
    'urn:tag:keyword:media:orchestra',
    'urn:tag:keyword:media:female_protagonist',
    'urn:tag:keyword:media:mental_breakdown',
    'urn:tag:keyword:media:composer_as_protagonist',
    'urn:tag:keyword:media:female_conductor'
  ];


  try {
    const data = await recommendFilmsByTags(tagIds);
    res.json(data);
  } catch (err) {
    const status = err.response?.status || 500;
    const body = err.response?.data || err.message;
    res.status(status).json({ error: body });
  }

});

app.get('/recommendArtistByTags', async (req, res) => {

  // LLM provides a set of tags based on the character from the logline and synopsis
  //You are a tag‑generation assistant trained on Qloo’s media schema.   
  // Given only a film’s logline and synopsis, return nothing but a JavaScript array of Qloo tag “names” (human‑readable, e.g. "Adventure", "Documentary", "Comedy") that best capture character Lydia Tar from the story. 
  // The tags should be just the genre of the film.  Do not output any commentary—just the array literal. 
  const genreTags = [
    "drama"
  ];

  // LLM provides a set of tags based on the character from the logline and synopsis
  //You are a tag‑generation assistant trained on Qloo’s media schema.   
  // Given only a film’s logline and synopsis, return nothing but a JavaScript array of Qloo tag “names” (human‑readable, e.g. "Adventure", "Documentary", "Comedy") that best capture character Lydia Tar from the story. 
  // The tags should be just the characteristic of the character.  Do not output any commentary—just the array literal. 

  const setOfTags = [
    "female protagonist",
    "psychological drama"
  ];

  const combineTags = [...new Set([...genreTags, ...setOfTags])];

  const minAge = 40;
  const maxAge = 60;
  const gender = 'female';

  const earliest = birthDate(maxAge); // Oldest: 1965-07-01
  const latest = birthDate(minAge); // Youngest: 1985-07-31

  try {
    // Fetch unique tags from Qloo API based on the set of tags
    // Example: ['urn:tag:archetype:qloo:betrayal', 'urn:tag:keyword:qloo:psychological_drama', 'urn:tag:keyword:media:classical_music']
    const uniqueTags = await fetchUniqueTagsWithPopularity(setOfTags);
    const uniqueTagsIds = uniqueTags
      .map(t => t.id);
    const uniqueGenreTags = await fetchUniqueTagsWithPopularity(genreTags);

    // Example: ['urn:tag:genre:media:drama'] 
    const uniqueGenreTagsIds = uniqueGenreTags
      .filter(tag => tag.id.startsWith('urn:tag:genre:media:'))
      .map(tag => tag.id);
    // const uniqueGenreTagsIds = ['urn:tag:genre:media:drama']
    const data = await recommendArtistByTags(
      uniqueGenreTagsIds,
      uniqueTagsIds,
      earliest,
      latest,
      gender
    );
    console.log('uniqueGenreTagsIds:', uniqueGenreTagsIds);
    console.log('uniqueTagsIds:', uniqueTagsIds);
    console.log('EARLIEST:', earliest);
    console.log('LATEST:', latest);
    console.log('gender:', gender);
    return res.json(data);
  } catch (err) {
    const status = err.response?.status || 500;
    const body = err.response?.data || err.message;
    return res.status(status).json({ error: body });
  }

});

function birthDate(age) {
  const d = new Date();
  d.setFullYear(d.getFullYear() - age);
  return d.toISOString().slice(0, 10);  // "YYYY-MM-DD"
}

function normalize(str) {
  return str.toLowerCase().replace(/[\W_]+/g, ' ').trim();
}

async function fetchUniqueTagsWithPopularity(keywords) {
  const tagMap = {};

  for (const kw of keywords) {
    let tags;
    try {
      tags = await getTags(kw);
    } catch (err) {
      console.warn(`Error fetching tags for "${kw}": ${err.message}`);
      continue;
    }
    if (!tags.length) {
      console.warn(`No tags for "${kw}", skipping.`);
      await new Promise(r => setTimeout(r, 200));
      continue;
    }

    const normKw = normalize(kw);

    // find all containing matches
    const matched = tags.filter(t => {
      const normName = normalize(t.name);
      return normName.includes(normKw) || normKw.includes(normName);
    });

    // find exact equals
    const exact = matched.filter(t => normalize(t.name) === normKw);

    const loose = matched.length
      ? matched
      : [tags.reduce((best, t) => t.popularity > best.popularity ? t : best, tags[0])];

    //  // **only** keep exact matches; if none, skip this keyword entirely
    //  if (exact.length === 0) {
    //    console.warn(`No exact matches for "${kw}", skipping.`);
    //    await new Promise(r => setTimeout(r, 200));
    //    continue;
    //  }

    // now pool = exact matches only
    // const pool = exact;
    const pool = loose;

    // accumulate popularity
    for (const t of pool) {
      if (!tagMap[t.id]) {
        tagMap[t.id] = { name: t.name, popularity: 0 };
      }
      tagMap[t.id].popularity += t.popularity;
    }

    await new Promise(r => setTimeout(r, 200));
  }

  return Object.entries(tagMap)
    .map(([id, { name, popularity }]) => ({ id, name, popularity }))
    .sort((a, b) => b.popularity - a.popularity);
}

async function filterByMinTagMatches(films, tagIds, minMatches = 5) {
  const filmIds = films.map(f => f.id);
  const tagMap = await fetchFilmTags(filmIds);

  return films
    .map(f => {
      const matchedCount = (tagMap[f.id] || [])
        .filter(t => tagIds.includes(t))
        .length;
      return { ...f, matchedCount };
    })
    .filter(f => f.matchedCount >= minMatches)
    // optionally sort by matchedCount desc (then affinity score)
    .sort((a, b) => b.matchedCount - a.matchedCount || b.score - a.score);
}

app.get('/CueBeats', async (req, res) => {
  try {
    // LLM provides a set of json data based on the script/story.
    const data = require('./example-results-llm.json');

    const storyGenre = data.genre;

    const characters = data.characters;

    const storyGenreTags = await fetchUniqueTagsWithPopularity(storyGenre);
    const storyGenreTagsIds = storyGenreTags
      .filter(tag => tag.id.startsWith('urn:tag:genre:media:'))
      .map(tag => tag.id);

    const qlooCastingRecommendationslist = [];

    for (const character of characters) {
      const characteristic = character.tags;
      const minAge = character.minAge;
      const maxAge = character.maxAge;
      const gender = character.gender;

      const earliestDOB = birthDate(maxAge);
      const latestDOB = birthDate(minAge);

      const characteristicTags = await fetchUniqueTagsWithPopularity(characteristic);
      const characteristicTagsIds = characteristicTags
        .map(t => t.id);

      const qlooCastingRecommendations = await recommendArtistByTags(
        storyGenreTagsIds,
        characteristicTagsIds,
        earliestDOB,
        latestDOB,
        gender,
        take = 3
      )
      qlooCastingRecommendationslist.push({
        character_name: character.name,
        casting: qlooCastingRecommendations
      });
    }

    res.json(qlooCastingRecommendationslist);

  } catch (err) {
    const status = err.response?.status || 500;
    const body = err.response?.data || err.message;
    res.status(status).json({ error: body });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});