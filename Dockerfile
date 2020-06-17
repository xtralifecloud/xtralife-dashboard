FROM node:12

RUN mkdir -p /server
WORKDIR /server

COPY package.json /server/
COPY package-lock.json /server/

RUN npm install

COPY . /server
RUN npm run compile

EXPOSE 3000

VOLUME ["/server/configDashboard", "/server/logs"]

CMD [ "npm", "start" ]
