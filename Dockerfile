FROM node:12

RUN npm install -g browserify
RUN mkdir -p /server
WORKDIR /server

COPY package*.json /server/

RUN npm ci

COPY . /server

EXPOSE 3000
EXPOSE 10254

VOLUME ["/server/configDashboard", "/server/logs"]

CMD [ "npm", "start" ]