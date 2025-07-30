require('dotenv').config();

const express = require('express');
const axios = require('axios');
const { searchQloo, trendsQloo, insightsQloo, seedEntityForStory, getTags, recommendFilmsByTags } = require('./qlooClient');
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
  const logline = req.query.logline || 'career crossroads';
  try {
    const data = await getTags(logline);
    res.json(data);
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

app.get('/cueBeats', async (req, res) => {
  const logline = 'A renowned conductor at the height of her career faces internal struggles and external pressures, challenging her grip on reality, power, and artistic integrity.';
  const synopsis = 'TÁR follows the story of Lydia Tár, a celebrated classical music conductor and composer known globally for her musical brilliance and influential career. As Lydia prepares for a milestone live recording of Mahler’s Symphony No. 5 with the Berlin Philharmonic, she begins to confront mounting tensions within her personal and professional worlds. Haunted by unresolved relationships, unspoken rivalries, and internal battles with anxiety, Lydia struggles to maintain control over her meticulously curated life. Throughout the narrative, Lydia faces accusations, personal betrayals, and the resurfacing of past indiscretions, causing her carefully constructed world to slowly unravel. Her interactions with colleagues, students, her assistant Francesca, and her family, especially her partner Sharon and daughter Petra, amplify her internal crisis, ultimately questioning the balance between ambition and humanity, genius and morality. The film delves into the psychological complexity of an artist who simultaneously inspires awe and controversy, probing the intense demands of artistry, power dynamics, identity, and self-destruction.'

  const wholeStory = logline + ' ' + synopsis;

  // LLM provides a set of tags based on the logline and synopsis
  // For example: ['power imbalance', 'artistic integrity', 'personal crisis', '
  const setOfTags = [
    "renowned conductor",
    "classical music",
    "Berlin Philharmonic",
    "Mahler's Symphony No. 5",
    "power dynamics",
    "artistic integrity",
    "identity crisis",
    "psychological drama",
    "anxiety",
    "personal betrayal",
    "professional rivalry",
    "ambition vs. humanity",
    "family relationships",
    "career crossroads",
    "self-destruction"
  ];

  try {
    // Fetch unique tags from Qloo API based on the set of tags
    // Example: ['urn:tag:archetype:qloo:betrayal', 'urn:tag:keyword:qloo:psychological_drama', 'urn:tag:keyword:media:classical_music']
    const uniqueTags = await fetchUniqueTagsWithPopularity(setOfTags);
    const tagIds = uniqueTags
      .slice(2, 6) // Limit to top 5 tags
      .map(t => t.id);
    console.log('tagIds:', uniqueTags);
  
    // const data = await recommendFilmsByTags(test);
    return res.json(uniqueTags);
  } catch (err) {
    console.error('Error fetching tags:', err);
    return res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

app.get('/recommendFilmsByTags', async (req, res) => {

  // LLM provides a set of tags based on the logline and synopsis
  // For example: ['power imbalance', 'artistic integrity', 'personal crisis']
  const tagIds = [
    'urn:tag:archetype:qloo:betrayal',
    'urn:tag:keyword:qloo:psychological_drama',
    'urn:tag:keyword:media:classical_music',
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

   // **only** keep exact matches; if none, skip this keyword entirely
   if (exact.length === 0) {
     console.warn(`No exact matches for "${kw}", skipping.`);
     await new Promise(r => setTimeout(r, 200));
     continue;
   }

   // now pool = exact matches only
    const pool = exact;

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});