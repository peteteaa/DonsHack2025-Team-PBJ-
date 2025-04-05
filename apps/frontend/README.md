# Frontend Documentation

## Development Setup

### Prerequisites

- Node.js (v18 or higher)
- pnpm (package manager)

### Why pnpm?

pnpm is a fast, disk space efficient, and secure package manager that provides a more efficient way to manage dependencies in a monorepo. It uses a single global store for all dependencies, which reduces the amount of disk space used and speeds up the installation process. pnpm also provides features like deduplication and zero-installs, which can improve the performance of your development workflow.

Also, this project uses pnpm workspace, which allows you to manage dependencies across multiple packages in a monorepo. for more information, check the [pnpm workspace documentation](https://pnpm.io/workspaces).

### Environment Setup

1. **Important:** Install dependencies in the root directory:

   ```bash
   pnpm install
   ```

2. Enter the frontend directory:

   ```bash
   cd apps/frontend
   ```

### Running the Application

- Start the application in frontend directory:

  ```bash
  pnpm run dev
  ```

- Start the application in root directory:

  ```bash
  pnpm run dev:frontend
  ```

### Linter, formatter, and type checker

This project uses biome for linting and formatting.

- To **fix** fixable errors and **show details** of not fixable errors you can use (in frontend directory):

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
