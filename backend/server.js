require("dotenv").config();

const express = require("express");
const axios = require("axios");
const { searchQloo } = require("./qlooClient");
const app = express();
app.use(express.json());
app.use(cors());
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

if (!GEMINI_API_KEY) {
  console.error("Error: GEMINI_API_KEY environment variable is not set.");
  process.exit(1); // Exit if API key is missing
}

const ai = new GoogleGenerativeAI(GEMINI_API_KEY);

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

app.get("/cate-blanchett", async (req, res) => {
  const q = req.query.q || "cate-blanchett";
  try {
    const data = await searchQloo(q);
    res.json(data);
  } catch (err) {
    const status = err.response?.status || 500;
    const body = err.response?.data || err.message;
    res.status(status).json({ error: body });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
