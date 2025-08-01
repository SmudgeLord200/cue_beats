# Cue + Beats

### Cue the Vision. Beat to Life.

Cue + Beats is a smart web application designed for screenwriters, producers, and filmmakers. It leverages the power of Google's Gemini AI to instantly analyze a film script or treatment from a PDF and generates a concise "Cue Beats" document. This document breaks down the core narrative elements, providing a clear and structured overview of your project.

## ✨ Features

-   **AI-Powered Analysis**: Upload your script in PDF format and let the AI generate key story elements.
-   **Comprehensive Breakdown**: Automatically extracts:
    -   Title (from the filename)
    -   Logline
    -   Synopsis
    -   Target Audience
    -   Key Themes
    -   Visual & Mood Direction
    -   Music & Sound Direction
-   **Iterative Refinement**: Use the "Cue the beats!" button to get a more polished and refined version of the initial analysis.
-   **PDF Export**: Generate a clean, professional-looking PDF of your Cue Beats document, dynamically titled with your project's name.
-   **Responsive UI**: A sleek, user-friendly interface that provides clear feedback during processing.

## 🛠️ Tech Stack

### Frontend

-   **Framework**: React with Vite
-   **Language**: TypeScript
-   **UI Library**: Material-UI (MUI)
-   **State Management**: React Context API
-   **PDF Generation**: jsPDF

### Backend

-   **Framework**: Node.js with Express
-   **Language**: TypeScript
-   **AI Integration**: Google Gemini API (`@google/genai`)
-   **Environment Management**: dotenv

## 🚀 Getting Started

Follow these instructions to get a local copy of the project up and running.

### Prerequisites

-   Node.js (v20 or later recommended)
-   npm (or your preferred package manager)
-   A Google Gemini API Key. You can get one from Google AI Studio.

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/SmudgeLord200/cue_beats.git
    cd cue_beats
    ```

2.  **Setup the Backend:**
    -   Navigate to the backend directory:
        ```sh
        cd backend
        ```
    -   Install dependencies:
        ```sh
        npm install
        ```
    -   Create a `.env` file in the `backend` directory and add your Gemini API key:
        ```env
        GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
        ```
    -   Start the backend server:
        ```sh
        npm run dev
        ```
    -   The backend will be running on `http://localhost:3001`.

3.  **Setup the Frontend:**
    -   In a new terminal, navigate to the frontend directory from the root:
        ```sh
        cd frontend
        ```
    -   Install dependencies:
        ```sh
        npm install
        ```
    -   Start the frontend development server:
        ```sh
        npm run dev
        ```
    -   The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

## 📋 Usage

1.  Open your web browser and go to the frontend URL (e.g., `http://localhost:5173`).
2.  Click the cloud upload icon to select and upload a PDF file of your script or treatment.
3.  Wait for the initial analysis to complete. The extracted "Cue Beats" will be displayed on the screen.
4.  To improve the generated text, click the **"Cue the beats!"** button for a refined version.
5.  Once you are satisfied with the content, click **"Generate PDF"** to download a formatted PDF summary.
