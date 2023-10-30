# base node image
FROM node:18-bullseye-slim as base

# set for base and all layer that inherit from it
ENV NODE_ENV production

# Install openssl for Prisma
RUN apt-get update && apt-get install -y openssl sqlite3 python3 make g++ git fuse3

WORKDIR /myapp

RUN npm install npm@9.1.1 && \
  rm -rf /usr/local/lib/node_modules/npm && \
  mv node_modules/npm /usr/local/lib/node_modules/npm

# Setup production node_modules
FROM base as deps

WORKDIR /myapp

ADD package.json package-lock.json ./

RUN npm install --production=false

FROM base as production-deps

WORKDIR /myapp

COPY --from=deps /myapp/node_modules /myapp/node_modules
ADD package.json package-lock.json ./
RUN npm prune --production

# Build the app
FROM base as build

WORKDIR /myapp

COPY --from=deps /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/npm
COPY --from=deps /myapp/package.json /myapp/package.json
COPY --from=deps /myapp/node_modules /myapp/node_modules

ADD . .
RUN touch ./app/refresh.ignored.js
RUN npm run build
# Finally, build the production image with minimal footprint
FROM base as run

ENV FLY="true"
ENV LITEFS_DIR="/litefs/data"
ENV DATABASE_FILENAME="sqlite.db"
ENV DATABASE_PATH="$LITEFS_DIR/$DATABASE_FILENAME"
ENV DATABASE_URL="file:$DATABASE_PATH"
ENV CACHE_DATABASE_FILENAME="cache.db"
ENV CACHE_DATABASE_PATH="/$LITEFS_DIR/$CACHE_DATABASE_FILENAME"
ENV INTERNAL_PORT="8080"
ENV PORT="8081"
ENV NODE_ENV="production"

# add shortcut for connecting to database CLI
RUN echo "#!/bin/sh\nset -x\nsqlite3 \$DATABASE_URL" > /usr/local/bin/database-cli && chmod +x /usr/local/bin/database-cli

WORKDIR /myapp

COPY --from=production-deps /myapp/node_modules /myapp/node_modules

COPY --from=build /myapp/build /myapp/build
COPY --from=build /myapp/app/_redirects /myapp/build/_redirects
COPY --from=build /myapp/public /myapp/public
COPY --from=build /myapp/package.json /myapp/package.json
COPY --from=build /myapp/other/setup-swap.js /myapp/other/setup-swap.js
COPY --from=build /myapp/server.ts /myapp/server.ts

COPY --from=flyio/litefs:0.5.8 /usr/local/bin/litefs /usr/local/bin/litefs
ADD litefs.yml /etc/litefs.yml
RUN mkdir -p /data ${LITEFS_DIR}

CMD [ "litefs", "mount" ]
