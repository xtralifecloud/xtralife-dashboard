FROM node:16.14.0

RUN mkdir -p /server
WORKDIR /server

COPY package*.json /server/
RUN npm ci

COPY . /server

WORKDIR /server/client
RUN npm ci
RUN npm run build

WORKDIR /server

EXPOSE 3000
EXPOSE 10254

VOLUME ["/server/configDashboard", "/server/logs"]

CMD [ "npm", "start" ]