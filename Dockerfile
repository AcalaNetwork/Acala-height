FROM node:14-alpine

EXPOSE 1020

ADD . /usr/src/app
WORKDIR /usr/src/app

RUN npm install

COPY . .

RUN npm run build

CMD [ "npm", "start" ]