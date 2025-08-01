require("dotenv").config();

const express = require("express");
const axios = require("axios");
const { qlooRecommendation, qlooTags } = require("./qlooClient");
const app = express();
app.use(express.json());
// app.use(cors());
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

// if (!GEMINI_API_KEY) {
//   console.error("Error: GEMINI_API_KEY environment variable is not set.");
//   process.exit(1); // Exit if API key is missing
// }

// const ai = new GoogleGenerativeAI(GEMINI_API_KEY);

// File upload endpoint
app.post("/file-upload", async (req, res) => {
  try {
    const file = req.files.file;
    // Convert the file data Buffer to a Base64 string
    const base64File = file.data.toString("base64");

    const prompt = `Based on the provided file content ${base64File}, generate a detailed set of cue beats for a film.
    The response must be in JSON format and contain the following fields:
    logline: A single sentence logline for the story.
    synopsis: A short paragraph summarizing the plot.
    targetAudience: A brief description of the target demographic.
    keyThemes: A list of the central themes in the film.
    moodVisualDirection: A paragraph describing the overall mood and visual style.
    musicSoundtrackDirection: A paragraph on the style and feel of the music.
    soundDesignDirection: A paragraph on the specific sound design elements.
    
    Do not include any text outside of the JSON object.`;

    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" }); // Using a more modern model that handles this better

    const response = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: file.mimetype, // Use the correct MIME type from the file
                data: base64File,
              },
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            logline: { type: "STRING" },
            synopsis: { type: "STRING" },
            targetAudience: { type: "STRING" },
            // keyThemes: {
            //   type: "ARRAY",
            //   items: { type: "STRING" }, // keyThemes should be an array of strings
            // },
            keyThemes: {type: "STRING"},
            moodVisualDirection: { type: "STRING" },
            musicSoundtrackDirection: { type: "STRING" },
            soundDesignDirection: { type: "STRING" },
          },
        },
      },
    });

    const jsonText = response.candidates[0].content.parts[0].text;
    const cueBeatsObject = JSON.parse(jsonText);

    res.json(cueBeatsObject);
  } catch (err) {
    console.error("Error generating content:", err);
    res.status(500).json({ error: "Failed to generate content" });
  }
});

// Secondary updates endpoint
app.post("/secondary-updates", async (req, res) => {
  try {
    const cueBeats = req.body;

    const prompt = `Based on the provided CueBeats object, generate a detailed set of secondary updates.
    The response must be in JSON format and contain the following fields:
    logline: A single sentence logline for the story.
    synopsis: A short paragraph summarizing the plot.
    targetAudience: A brief description of the target demographic.
    keyThemes: A list of the central themes in the film.
    moodVisualDirection: A paragraph describing the overall mood and visual style.
    musicSoundtrackDirection: A paragraph on the style and feel of the music.
    soundDesignDirection: A paragraph on the specific sound design elements.`;

    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

    const response = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            logline: { type: "STRING" },
            synopsis: { type: "STRING" },
            targetAudience: { type: "STRING" },
            keyThemes: { type: "STRING" },
            moodVisualDirection: { type: "STRING" },
            musicSoundtrackDirection: { type: "STRING" },
            soundDesignDirection: { type: "STRING" },
          },
        },
      },
    });

    const jsonText = response.candidates[0].content.parts[0].text;
    const secondaryUpdatesObject = JSON.parse(jsonText);

    res.json(secondaryUpdatesObject);
  } catch (err) {
    console.error("Error generating secondary updates:", err);
    res.status(500).json({ error: "Failed to generate secondary updates" });
  }
});

app.get('/qloo-recommendation', async (req, res) => {
  try {
    // LLM provides a set of json data based on the script/story.
    const data = require('./example-results-llm.json');

    const storyGenre = data.genre;

    const characters = data.characters;

    const storyGenreTags = await fetchUniqueTagsWithPopularity(storyGenre);
    const storyGenreTagsIds = storyGenreTags
      .filter(tag => tag.id.startsWith('urn:tag:genre:media:'))
      .map(tag => tag.id);

    const qlooCastingRecommendationlist = [];

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

      const qlooCastingRecommendation = await qlooRecommendation(
        storyGenreTagsIds,
        characteristicTagsIds,
        earliestDOB,
        latestDOB,
        gender,
        take = 3
      )
      qlooCastingRecommendationlist.push({
        character_name: character.name,
        casting: qlooCastingRecommendation
      });
    }

    res.json(qlooCastingRecommendationlist);

  } catch (err) {
    const status = err.response?.status || 500;
    const body = err.response?.data || err.message;
    res.status(status).json({ error: body });
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
      tags = await qlooTags(kw);
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

    const loose = matched.length
      ? matched
      : [tags.reduce((best, t) => t.popularity > best.popularity ? t : best, tags[0])];

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
