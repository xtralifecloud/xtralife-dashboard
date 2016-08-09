## Quick documentation for BO API

**Note** : all routes should be preceded by the endpoint, currrently **https://sandbox-backoffice.clanofthecloud.com**

### authentification

We use basic authentication, and the credentials are the same that you are using to login on the BO website

Coffee code looks like :

 		request
			.get '/api/v1/company'
			.auth "xxxx", "xxxx"
			.set 'Content-Type', 'application/json'
			.end (err, res)->
				console.log err if err?
				console.log res.body if res?


### Company games

GET /api/v1/company

returns the list of games owned by the company identified by the credentials


### Game Users

GET /api/v1/game/:game/users?skip=n&limit=p

where:

- :game is the id of the game
- n is a numbers of result to skip
- p is the number of result to return


### Balance for a user

GET /api/v1/game/:game/user/:user_id/balance

where:

- :game is the id of the game
- :user-id is the id of the user


### Transactions for a user

GET /api/v1/game/:game/user/:user_id/txHistory/:domain?skip=n&limit=p

where:

- :game is the id of the game
- :user-id is the id of the user
- :domain where the transactions were made
- n is a numbers of result to skip
- p is the number of result to return


---

GET /game/:game/storage/:domain

POST /game/:game/storage/:domain

GET /game/:game/users/search

GET /game/:game/users


POST /game/:game/user/:userid/profile

GET /game/:game/user/:userid/properties

POST /game/:game/user/:userid/properties


GET /game/:game/user/:userid/friends

POST /job/game/:game/user/:userid/message/:domain


GET /game/:game/user/:userid/storage/:domain

POST /game/:game/user/:userid/storage/:domain

GET /game/:game/user/:userid/balance/:domain

POST /game/:game/user/:userid/transaction/:domain

GET /game/:game/user/:userid/txHistory/:domain

GET /game/:game/leaderboard/:leaderboard


GET /game/:game/user/:userid/bestscores

GET /game/:game/certs

PUT /game/:game/certs


GET /game/:game/achievements/:domain

POST /game/:game/achievements/:domain

GET /game/:game/mau

GET /company


