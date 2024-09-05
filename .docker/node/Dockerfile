FROM node:20.11.1-alpine3.19

RUN ls -la

RUN apk add --no-cache bash

ENV NODE_ENV=development

WORKDIR /home/node/app

RUN chmod -R u+rwx .

RUN npm i -g npm@10.8.3

RUN npm i -g @nestjs/cli

USER node

COPY . .