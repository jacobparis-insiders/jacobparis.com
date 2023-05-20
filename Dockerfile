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

ADD prisma ./prisma
RUN npx prisma@4.6.0 generate

ADD . .
RUN touch ./app/refresh.ignored.js
RUN npm run build

# Finally, build the production image with minimal footprint
FROM base as run

ENV LITEFS_DIR="/data/litefs"
ENV DATABASE_URL=file:/$LITEFS_DIR/sqlite.db
ENV PORT="8080"
ENV NODE_ENV="production"

# add shortcut for connecting to database CLI
RUN echo "#!/bin/sh\nset -x\nsqlite3 \$DATABASE_URL" > /usr/local/bin/database-cli && chmod +x /usr/local/bin/database-cli

WORKDIR /myapp

COPY --from=production-deps /myapp/node_modules /myapp/node_modules
COPY --from=build /myapp/node_modules/.prisma /myapp/node_modules/.prisma

COPY --from=build /myapp/build /myapp/build
COPY --from=build /myapp/app/_redirects /myapp/build/_redirects
COPY --from=build /myapp/public /myapp/public
COPY --from=build /myapp/package.json /myapp/package.json
COPY --from=build /myapp/start.sh /myapp/start.sh
COPY --from=build /myapp/server.js /myapp/server.js
COPY --from=build /myapp/prisma /myapp/prisma
COPY --from=flyio/litefs:0.4 /usr/local/bin/litefs /usr/local/bin/litefs
ADD litefs.yml /etc/litefs.yml

CMD [ "litefs", "mount", "--", "sh", "./start.sh" ]
