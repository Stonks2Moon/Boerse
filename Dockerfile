FROM node:latest as build

WORKDIR /app

COPY *.json ./
COPY yarn.lock .
RUN yarn install --link-duplicates --ignore-optional


COPY ./ ./
RUN yarn build
RUN yarn install --production --link-duplicates --ignore-optional


FROM node:alpine as prod
EXPOSE 3000

ARG MONGO_CONNECTION_ARG
ARG JWT_SECRET_ARG
ARG REDIS_HOST_ARG
ARG REDIS_PORT_ARG
ARG REDIS_PW_ARG

ENV MONGO_CONNECTION=$MONGO_CONNECTION_ARG
ENV JWT_SECRET=$JWT_SECRET_ARG
ENV REDIS_HOST=$REDIS_HOST_ARG
ENV REDIS_PORT=$REDIS_PORT_ARG
ENV REDIS_PW=$REDIS_PW_ARG

WORKDIR /app
USER node
ENV NODE_ENV production

COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist
COPY ./*.json /app/

CMD ["node", "--expose-gc", "dist/main.js" ]
