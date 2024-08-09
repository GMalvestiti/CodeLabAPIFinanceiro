FROM node:20.11.1-alpine3.19

RUN apk add --no-cache bash

ENV NODE_ENV=development

WORKDIR /home/node/app

RUN npm install -g npm@10.7.0

RUN npm install -g @nestjs/cli

USER node

COPY . .