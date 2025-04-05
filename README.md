# DonsHack2025-Team-PBJ-

## Team Members

- Pete Thambundit
- Jose Aceves Gonzales
- Benjamin Puhani

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

   - Create `.env` files in `/apps/backend` :

     ```
     PORT= (number of the port to use, this is optional, by default 4000)
     ```

   - Create `.env` files in `/apps/frontend` :

     ```
     NEXT_PUBLIC_API_URL= (URL of the backend API)
     ```
  
  - Create `.env` files in the root directory:
    by copying the `.env.example` file

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

This repos is using a git workflow for deployment to Heroku.

### Secrets in GitHub Repo:

- HEROKU_API_KEY
- HEROKU_APP_NAME

### Config Vars in Heroku:

- MONGODB_URL
