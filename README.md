🛡️ SpamLens AI
=================

An intelligent, hybrid ML & Rule-based spam, phishing, and fraud detection engine with a sleek React frontend.

React Vite FastAPI Python Machine Learning

✨ Features
----------

*   **Hybrid Analysis:** Combines traditional heuristic rules with advanced Machine Learning for high-accuracy spam detection.
*   **Single & Batch Processing:** Analyze pasted text directly or upload \`.txt\`/\`.eml\` files in bulk.
*   **Smart Cold-Start Handling:** Gracefully detects when the backend server is sleeping (e.g., on Render/Heroku free tiers) and shows a specialized "waking up" UI.
*   **Cinematic Loaders:** Features a roulette-style analysis loader that decelerates smoothly before resting on "almost there...".
*   **Dark/Light Mode:** Seamless theme switching.
*   **Client-Side Parsing:** File text extraction happens instantly in the browser before hitting the API.

🏗️ Architecture
----------------

The application is split into two distinct parts to ensure security and performance:

*   **Frontend (React + Vite):** Handles UI, state management, file parsing, and theme toggling. Completely public-facing.
*   **Backend (Python API):** Hosts the ML model, executes the rule engine, and processes the text. Secret API keys and model weights live safely here.

**⚠️ Security Note:** API keys are **never** stored in frontend `.env` files. The React app only knows the base URL of the backend API.

🚀 Getting Started
------------------

### 1\. Prerequisites

*   Node.js (v18 or higher)
*   Python 3.9+ (if running the backend locally)

### 2\. Install Frontend Dependencies

    git clone https://github.com/your-username/spam-shield-ai.git
    cd spam-shield-ai/frontend
    npm install

### 3\. Environment Variables

Create a `.env` file in the root of the `frontend` folder (do not put it in `src`):

    # .env
    VITE_API_URL=http://localhost:8000

**💡 Note:** For production, change this to your deployed backend URL (e.g., `https://my-api.onrender.com`). Variables prefixed with `VITE_` are injected by Vite at build time.

### 4\. Run the App

    npm run dev

🔌 API Endpoints
----------------

The React frontend expects the following endpoints on your backend:

Method

Endpoint

Description

`POST`

`/analyze`

Analyzes a single email string. Expects `{ "text": "..." }`

`POST`

`/analyze/batch`

Analyzes an array of emails. Expects `{ "texts": ["...", "..."] }`

📁 Project Structure
--------------------

    frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── ColdStartLoader/   # Snowflake timer for server wake-up
    │   │   ├── Loader.jsx         # Cinematic roulette analysis loader
    │   │   ├── InputSection.jsx   # Textarea and file upload UI
    │   │   ├── Results.jsx        # Single email output display
    │   │   └── BatchResults.jsx   # Table for batch output
    │   ├── hooks/
    │   │   └── useTheme.js        # Dark/Light mode logic
    │   ├── services/
    │   │   └── api.js             # Fetch calls and client-side file parsing
    │   ├── App.jsx                # Main state machine & UI orchestrator
    │   └── App.css
    ├── .env                       # VITE_API_URL goes here
    ├── index.html
    ├── package.json
    └── vite.config.js

Built with React and Machine Learning. Documentation generated as HTML.