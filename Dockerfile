# taken from https://pnpm.io/docker#example-1-build-a-bundle-in-a-docker-container
FROM node:lts-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /app
WORKDIR /app

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

FROM base
# get node_modules
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=prod-deps /app/apps/frontend/node_modules /app/apps/frontend/node_modules
COPY --from=prod-deps /app/apps/backend/node_modules /app/apps/backend/node_modules

# frontend artifacts
COPY --from=build /app/apps/frontend/public /app/apps/frontend/public
COPY --from=build /app/apps/frontend/.next /app/apps/frontend/.next

# backend artifacts
COPY --from=build /app/apps/backend/dist /app/apps/backend/dist

EXPOSE 8000
CMD [ "pnpm", "start" ]