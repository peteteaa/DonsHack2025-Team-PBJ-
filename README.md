# DonsHack2025-Team-PBJ-

## Team Members

- Pete Thambundit
- Jose Aceves Gonzales
- Benjamin Puhani

---
**Summary**: Our project DonsFlow, designed for students who want to _actually understand_ the contents of a video, addresses the challenge of integrating video learning with keeping the focus. By providing a platform that allows you to watch YouTube videos alongside interactive quizzes (up until the point you watched), we enhance the learning experience. Key features include a custom YouTube player, AI-generated table of contents, interactive, time-stamped notes, and AI-generated quizzes, light-/darkmode.

---

We worked on the following prompt from the SDS:
```
Visual & Multi-Sensory Learning Tool
Allows students to watch YouTube videos alongside structured notes
AI-generated "table of contents" for lecture recordings
Interactive study guides with built-in quizzes and flashcards
```

### Key Features
- **YouTube Video Player**: Watch YouTube videos with a custom player that allows you to add notes.
- **YouTube Transcript**: View the transcript of the video in a structured format.
- **Interactive Notes**: Add notes to specific timestamps in the video, and view them in a structured format.
- **AI-Generated Table of Contents**: Automatically generate a table of contents for lecture recordings using AI.
- **AI-Generated Quizz and Questions**: Answer AI-generated open or multiple choice questions based on the video content.
- **User Authentication**: User signs up with SSO Email and all his videos / notes are saved.
- **Download the APP as a Docker Image**: Download the app as a Docker image and run it locally on your own.

### Limitations
- Sadly, the YouTube api we are using blocks big server providers. That means, that the app does not work deployed on a server like heroku.
- If the app was running in the university network, it would work. (Or if we could set up some form of a proxy)
- Token limit of Gemini.
- Some YouTube videos do not have transcripts. These videos will not work with the app.

### If we had more time
- Improve the UI
  - note-taking / updating / deleting (API Endpoints exist, but the frontend is not implemented yet)
  - positioning of the notes
  - improve the design
  - Responsiveness
- Find a way to get YouTube Transcripts without API limitations.
- Add the flashcards to the UI, that are currently implemented in the backend.
- Allow users to create their own quizzes.
- Save quizzes


## Development Setup

### Prerequisites

- Node.js (v18 or higher)
- pnpm (package manager)
- Gemini API key
- Stytch API key
- MongoDB URI

### Why pnpm?

pnpm is a fast, disk space efficient, and secure package manager that provides a more efficient way to manage dependencies in a monorepo. It uses a single global store for all dependencies, which reduces the amount of disk space used and speeds up the installation process. pnpm also provides features like deduplication and zero-installs, which can improve the performance of your development workflow.

Also, this project uses pnpm workspace, which allows you to manage dependencies across multiple packages in a monorepo. for more information, check the [pnpm workspace documentation](https://pnpm.io/workspaces).

### Environment Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Set up environment variables:

   - Create `.env` and `.env.docker` files in `/apps/backend` :

     ```
     BACKEND_PORT= (number of the port to use, this is optional, by default 4000)
     STYTCH_PROJECT_ID= (your stytch project id)
     STYTCH_SECRET= (your stytch secret)
     DB_URL= (URI of the database)
     TOKEN_KEY= (your token)
     GEMINI_API_KEY= (your gemini api key)
     API_URL= (URI of the API)
     ```

### Running the Application

- Start both applications:

  ```bash
  pnpm run dev
  ```

- Start backend:

  ```bash
  pnpm run dev:backend
  ```

- Start frontend:

  ```bash
  pnpm run dev:frontend
  ```

### Linter, formatter, and type checker

This project uses biome for linting and formatting.

- To **fix** fixable errors and **show details** of not fixable errors you can use:

  - Check (format and lint):

    ```bash
    pnpm run check
    ```

  - Format:

    ```bash
    pnpm run format
    ```

  - Lint:

    ```bash
    pnpm run lint
    ```

- To **show details** of errors you can use:

  - Check (format and lint):

    ```bash
    pnpm run check:detailed
    ```

  - Lint:

    ```bash
    pnpm run lint:detailed
    ```

  - Format:

    ```bash
    pnpm run format:detailed
    ```

- To run biome on the frontend or the backend add `:backend` or `:frontend` to the command:

  ```bash
  pnpm run check:detailed:backend
  pnpm run lint:frontend
  ```

## Deployment

This repo is deployed on Heroku using the heroku integrated GitHub deployment.

### Secrets in GitHub Repo:

#### Used for the deployment to heroku
- HEROKU_API_KEY
- HEROKU_APP_NAME
- HEROKU_EMAIL
#### Used for the "deployment" to docker hub
- DOCKERHUB_USERNAME
- DOCKERHUB_TOKEN

### Config Vars in Heroku:

- BACKEND_PORT
- STYTCH_PROJECT_ID
- STYTCH_SECRET
- DB_URL
- TOKEN_KEY
- API_URL
- GEMINI_API_KEY

### Docker Hub
- pull image from docker hub:

```bash
  docker pull sihingbenni/dons-flow:latest
```
- or run the demo.docker-compose.yml file:
- **(Make sure that the .env.docker file is set up correctly)**

```bash
  docker compose -f demo.docker-compose.yml --env-file apps/backend/.env.docker up
```