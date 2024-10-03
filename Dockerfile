FROM node:18.20.4

RUN mkdir -p /dashboard
WORKDIR /dashboard

COPY package*.json /dashboard/
RUN npm ci

COPY . /dashboard

WORKDIR /dashboard/client
RUN npm ci
RUN npm run build

WORKDIR /dashboard

EXPOSE 3000
EXPOSE 10254

VOLUME ["/dashboard/configDashboard", "/dashboard/logs"]

CMD [ "npm", "start" ]
