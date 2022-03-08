## Xtralife Dashboard

The dashboard works hand in hand with xtralife-server to show your data.
The `./configDashboard/config.dev.js` must be modified just like your xtralife-server's configuration to include
your games, keys, etc...

defaults :

	listening on port 3000
	default user: user
	default password: password
	
## Running with Docker	

With the same database containers as xtralife-server :
	
`docker run --rm -it --link redis:redis --link mongo:mongodb --link elastic:elastic -e NODE_ENV=production -p 3000:3000 xtralife/xtralife-dashboard`	
	
#User Guide

First install server

    npm install

Then install client

    cd client && npm install

Then build client

    cd client && npm run build

Finally run with

    npm start
