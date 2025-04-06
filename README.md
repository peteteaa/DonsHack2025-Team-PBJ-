# DonsHack2025-Team-PBJ-

## Team Members

- Pete Thambundit
- Jose Aceves Gonzales
- Benjamin Puhani

---
### Deployed at: [Heroku](https://dons-hack2025-57ef9c621153.herokuapp.com/)

---

## Development Setup

### Prerequisites

- Node.js (v18 or higher)
- pnpm (package manager)

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

- HEROKU_API_KEY
- HEROKU_APP_NAME

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