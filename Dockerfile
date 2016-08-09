FROM node:6

RUN mkdir -p /server
WORKDIR /server

COPY package.json /server/
COPY npm-shrinkwrap.json /server/

RUN npm install

COPY . /server

EXPOSE 3000

VOLUME ["/server/configDashboard", "/server/logs"]

CMD [ "npm", "start" ]
