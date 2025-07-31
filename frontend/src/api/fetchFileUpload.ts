import type { CueBeats } from "../type";
import api from "./api";

interface FileResponse {
    response: CueBeats |null;
    error: string | null;
}

export async function fetchFileUpload(file: File): Promise<FileResponse> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    // Axios automatically handles JSON parsing.
    // The actual response data is available in `response.data`.
    const response = await api.post("/file-upload", formData, {
      headers: {
        // The browser will set the correct Content-Type for FormData automatically.
        "Content-Type": "multipart/form-data",
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