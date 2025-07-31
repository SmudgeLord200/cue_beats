import type { CueBeats } from "../type";
import api from "./api";

interface SecondaryUpdatesResponse {
    response: CueBeats |null;
    error: string | null;
}

export async function fetchSecondaryUpdates(cueBeats: CueBeats): Promise<SecondaryUpdatesResponse> {

  try {
    // Axios automatically handles JSON parsing.
    // The actual response data is available in `response.data`.
    const response = await api.post("/secondary-updates", cueBeats, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return {
      response: response.data,
      error: null,
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    return {
      response: null,
      error: "Failed to generate response from chatbot.",
    };
  }
}