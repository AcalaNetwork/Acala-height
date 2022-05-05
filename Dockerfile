FROM node:14-alpine

EXPOSE 1020

ADD . /usr/src/app
WORKDIR /usr/src/app

RUN yarn

COPY . .

RUN yarn build

CMD [ "yarn", "start" ]