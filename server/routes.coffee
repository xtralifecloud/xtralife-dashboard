ObjectID = require('mongodb').ObjectID
async = require 'async'
_ = require 'underscore'
xtralife = require 'xtralife-api'
notify = require './notify.coffee'

route = require('express').Router caseSensitive: true
downloadable = require('./middleware.coffee').downloadable

route.param 'game', (req, res, next, game)->
	game = each for each in req.user?.games when each?.name is req.params.game
	if game?
		req.game = xtralife.api.game.dynGames[game.name]
		req.context = {game: req.game, skipHooks:true}
		next()
	else
		logger.warn "Illegal access blocked, user #{req.user.name} for #{req.params.game}"
		res.status(401)
		res.json
			Error: 'Unauthorized'
			Message: "You don't have privileged access to this game"
		res.end()

route.param 'userid', (req, res, next, userid)->
	req.user_id = new ObjectID userid
	next()

route.param 'friendid', (req, res, next, friendid)->
	req.friend_id = new ObjectID friendid
	next()

route.param 'matchid', (req, res, next, matchid)->
	req.match_id = new ObjectID matchid
	next()

route.param 'key', (req, res, next, key)->
	req.key = key
	next()

route.param 'domain', (req, res, next, domain)->

	_isValidDomain = (aDomain)->
		return aDomain is 'private' or req.game? and req.game.config.domains? and req.game.config.domains.indexOf(aDomain) isnt -1

	if _isValidDomain(req.params.domain)
			req.domain = if req.params.domain is "private" then "#{req.game.appid}.#{req.game.apisecret}" else req.params.domain
			next()
	else
		logger.warn "Illegal access blocked, user #{req.user.name} for #{req.params.game} domain #{req.params.domain}"
		res.status(401)
		.json
			Error: 'Unauthorized'
			Message: "Access not granted"
		.end()

to_string  = (value)->
	if _.isObject value
		JSON.stringify value
	else if _.isNumber value
		value
	else
		'"'+value+'"'

from_string  = (value)->
	if _.indexOf(value, '"') == 0
		value = value.substring 1, value.lastIndexOf('"')
	else
		JSON.parse(value)

route.route "/game/:game/signedurl/:domain/:key"
.get (req, res)->
	xtralife.api.gamevfs.createSignedURL req.domain, req.key, (err, signedURL, getURL)->
		if err?
			return res.status 400
			.json err
			.end()
		res.json {signedURL, getURL}
		.end()


route.route "/game/:game/storage/:domain"
.get downloadable("gamekv"), (req, res)->

	xtralife.api.gamevfs.read req.domain, null, (err, data)->
		if err?
			return res.status 400
			.json err
			.end()

		res.json ({fskey: key, fsvalue: to_string(value)} for key, value of data)
		.end()

.post (req, res)->
	try
		obj={}
		(obj[each.fskey] = from_string(each.fsvalue) for each in req.body)
		xtralife.api.gamevfs.write req.domain, null, obj, (err)->
			if err?
				return res.send 500
				.end()
			res.send 200
			.end()
	catch ex
		res.status 400
		.json ex.stack.split("\n")[0]
		.end()

route.route "/game/:game/storage/:domain/:key"
.get (req, res)->
	key = req.params.key
	xtralife.api.gamevfs.read req.domain, key, (err, data)->
		if err?
			return res.json 400, err
		res.json data
		.end()

.put (req, res)->
	key = req.params.key
	xtralife.api.gamevfs.write req.domain, key, req.body, (err)->
		if err?
			return res.send 500
		res.json {done:1}
		.end()

.delete (req, res)->
	key = req.params.key
	xtralife.api.gamevfs.delete req.domain, key, (err)->
		if err?
			return res.send 500
		res.json {done:1}
		.end()


addMQlength = (domain, game, users)->

	broker = xlenv.broker
	id_list = (each._id for each in users)
	broker._getBroker(domain).pendingStats(id_list)
	.then (res)->
		(users[index].mqPending = each) for each, index in res

		broker._getBroker(domain).timedoutStats(id_list)
	.then (res)->
		(users[index].mqTimedout = each) for each, index in res
	.catch (err)->
		logger.error err.message, {stack: err.stack}
		logger.error "Can't compute broker MQ length"


# Route to find users by name
route.get "/game/:game/users/search", (req, res)->
	domain = "#{req.game.appid}.#{req.game.apisecret}"

	xtralife.api.user.search req.game.appid, req.query.q, parseInt(req.query.skip), parseInt(req.query.limit), (err, count, data)->

		addMQlength(domain, req.params.game, data).then ->
			res.json {list: data, total: count}
			.end()


# Route to list users for a game
# TODO add domain param
route.get "/game/:game/users", (req, res, next)->
	domain = "#{req.game.appid}.#{req.game.apisecret}"

	xtralife.api.user.list
		skip: parseInt(req.query.skip)
		limit : parseInt(req.query.limit)
		game : req.game.appid
	, (err, count, data)->
		if err?
			console.log err
		addMQlength(domain, req.game.appid, data)
		.then ->
			res.json {list: data, total: count}
			.end()
		.catch next
		.done()


route.get "/game/:game/users/find/:user_id", (req, res, next)->
	domain = "#{req.game.appid}.#{req.game.apisecret}"

	# doesn't use the route param userid to manage exceptions...
	try
		id = new ObjectID req.params.user_id
	catch
		id = null

	options = 
		skip: parseInt(req.query.skip)
		limit : parseInt(req.query.limit)
		game : req.game.appid
	
	if id? then options.id = id

	xtralife.api.user.list options
	, (err, count, data)->
		if err?
			console.log err
		addMQlength(domain, req.game.appid, data)
		.then ->
			res.json {list: data, total: count}
			.end()
		.catch next
		.done()


route.route "/game/:game/user/:userid/outline"
.get (req, res, next)->
	xtralife.api.outline.get req.game, req.user_id, [], (err, outline)=>
		if err? or outline==null
			return res.json 400, err		
		res.json outline
		.end()

route.route "/game/:game/user/:userid/profile"
.get (req, res, next)->
	#don't use req.user_id as connect.exist do the new ObjectID by itself
	xtralife.api.connect.exist req.params.userid, (err, result)->
		if err? or result==null then return res.json 400, err		
		res.json result.profile
		.end()

.post (req, res)->
	xtralife.api.user.updateProfile req.user_id, req.body, (err, result)->
		if err? then return res.json 400, err

		res.json result
		.end()


route.route "/game/:game/user/:userid/domain/:domain/properties"
.all (req, res, next)->
	next()
.post (req, res)->
	xtralife.api.user.write req.context,  req.domain, req.user_id, null, req.body
	.then (result)->
		res.json result
		.end()
	.catch (err)->
		return res.json 400, err

.get (req, res)->
	xtralife.api.user.read req.context,  req.domain, req.user_id, null
	.then (result)->
		res.json result
		.end()
	.catch (err)->
		return res.json 400, err


route.get "/game/:game/user/:userid/friends/:domain", (req, res)->

	xtralife.api.social.getFriends req.context, req.domain, req.user_id, (err, friends)->
		if err? then return res.json 400, err

		xtralife.api.social.getBlacklistedUsers req.context, req.domain, req.user_id, (err, blacklist)->
			if err? then return res.json 400, err
			res.json {friends: friends, blackList: blacklist}
			.end()


route.delete "/game/:game/user/:userid/friend/:domain/:friendid", (req, res)->

	xtralife.api.social.setFriendStatus req.domain, req.user_id, req.friend_id, "forget", null, (err, result)->
		if err? then return res.json 400, err
		res.json result
		.end()

route.get "/game/:game/user/:userid/friends/:domain/god", (req, res)->

	xtralife.api.social.getGodfather req.context, req.domain, req.user_id, (err, godfather)->
		xtralife.api.social.getGodchildren req.context, req.domain, req.user_id, (err, godchildren)->
			res.json {godfather, godchildren}
			.end()



# Route to GET kvstore  for a user
route
.route "/game/:game/user/:userid/kvstore/:domain"
.get (req, res, next)->

	query = {user_id : new ObjectID(req.user_id)}
	xtralife.api.kv.list req.context, req.domain, query, 0, 1000
	.then (data)->
		for kv in data
			kv.value = JSON.stringify(kv.value)
			kv.acl = JSON.stringify(kv.acl)
		res.json data
		.end()
	.catch next
	.done()

# Route to SET kvstore storage for a user
.post (req, res, next)->

	obj = {}
	res.json ({ok : 1})
	.end()



# Route to GET virtualfs storage for a user
route
.route "/game/:game/user/:userid/storage/:domain"
.get (req, res, next)->

	xtralife.api.virtualfs.read req.context, req.domain, req.user_id, null
	.then (data)->
		res.json ({fskey: key, fsvalue: to_string(value)} for key, value of data)
		.end()
	.catch next
	.done()

# Route to SET virtualfs storage for a user
.post (req, res, next)->

	obj={}
	(obj[each.fskey] = from_string(each.fsvalue) for each in req.body)

	xtralife.api.virtualfs.write req.context, req.domain, req.user_id, null, obj
	.then ->
		res.status 200
		.end()
	.catch next
	.done()


# Route to delete a user
route.delete "/game/:game/user/:userid", (req, res)->
	xtralife.api.onDeleteUser req.user_id, (err, data)->
		res.json err
		.end()
	, req.game.appid

# Route to get the balance for a user
route.get "/game/:game/user/:userid/balance/:domain", (req, res, next)->
	xtralife.api.transaction.balance req.context, req.domain, req.user_id
	.then (data)->
		res.json data
		.end()
	.catch next
	.done()

# Route to record a new transaction for a user
route.post "/game/:game/user/:userid/transaction/:domain", (req, res, next)->
	xtralife.api.transaction.transaction req.context, req.domain, req.user_id, req.body.tx, req.body.description
	.spread (data)->
		res.json data
		.end()
	.catch next
	.done()

route.get "/game/:game/user/:userid/txHistory/:domain", (req, res)->
	xtralife.api.transaction.txHistory req.domain, req.user_id, null, parseInt(req.query.skip), parseInt(req.query.limit), (err, data)->
		if err?
			res.set "Connection", "close" # otherwise error will not show immediately
			res.send 400, err
			return res.end()
		res.json data
		.end()

route.route "/game/:game/domain/:domain/leaderboard/:leaderboard"
.get (req, res, next)->
	# ?page=#{page}&count=#{count}
	count = parseInt(req.query.count) or 10
	page = parseInt(req.query.page) or 1

	# order is passed as null (the 2nd one)
	xtralife.api.leaderboard.gethighscore req.context, req.domain, null, req.params.leaderboard , page, count, (err, leaderboard)->
		if err?
			console.log err
		res.json leaderboard
		.end()

.post (req, res, next)->
	logger.warn "Rebuilding leaderboard #{req.params.leaderboard} for #{req.game.appid}"
	xtralife.api.leaderboard.rebuild req.domain, req.params.leaderboard, (err)->
		if err?
			console.log err
		res.end()

.delete (req, res, next)->
	logger.warn "Removing leaderboard #{req.params.leaderboard} for #{req.game.appid}"
	xtralife.api.leaderboard.deleteLeaderboard req.domain, req.params.leaderboard, (err)->
		console.log err if err?
		res.end()

route.get "/game/:game/user/:userid/domain/:domain/bestscores", (req, res, next)->

	xtralife.api.leaderboard.bestscores req.domain, req.user_id, (err, data)->
		res.status 200
		.json data
		.end()

route.delete "/:game/user/:userid/domain/:domain/:leaderboard", (req, res, next)->

	xtralife.api.leaderboard.deleteScore req.domain, req.user_id, req.params.leaderboard, (err, data)->
		res.status 200
		.json data
		.end()

# get whole game object
route.get "/game/:game/domain/:domain", (req, res, next)->
	xtralife.api.game.getGame req.game.appid, req.domain, (err, game)->
		res.json game
		.end()

route.route "/game/:game/achievements/:domain"
.get downloadable('achievements'), (req, res, next)->
	xtralife.api.achievement.loadAchievementsDefinitions req.domain
	.then (definitions)->
		res.json definitions
		.end()
	.catch next
	.done()

.post (req, res, next)->
	xtralife.api.achievement.saveAchievementsDefinitions req.domain, req.body
	.then (ach)->
		res.json ach
		.end()
	.catch next
	.done()


route.post "/game/:game/user/:userid/message/:domain", (req, res, next)->
	message = req.body
	xlenv.broker.send req.domain, req.user_id, message
	.then ()->
		res.status 200
		.json message # with .id field added
		.end()
	.catch (err)->
		next err


route.post "/game/:game/push/bulk/:domain", (req, res, next)->
	return next new Error('userids is missing') unless req.body.userids? 
	return next new Error('notification is missing') unless req.body.notification? 
	return next new Error('userids should be an array') unless _.isArray(req.body.userids) 

	notify.pushBulk req.game.appid, req.domain, req.body.userids, req.body.notification, (err, found)->
		return next err if err?
		res.status 200
		.json { found }
		.end()


route.get "/company", (req, res) ->
	result  = if req.isAuthenticated() then _.omit(req.user, "password") else "0"
	res.json result
	.end()

route.get "/game/:game/matches/domain/:domain", (req, res, next)->
	xtralife.api.match.list req.domain,
		parseInt(req.query.skip),
		parseInt(req.query.limit),
		req.query.hideFinished or false,
		req.query.gamerId,
		req.query.customProperties
	.spread (count, data)->
		res.json {list: data, total: count}
	.catch next
	.done()


route.get "/game/:game/matches/:matchid", (req, res, next)->
	xtralife.api.match.getMatch req.match_id
	.then (data)->
		res.json data
	.catch next
	.done()

route.delete "/game/:game/matches/:matchid", (req, res)->
	xtralife.api.match._forceDeleteMatch req.match_id, (err)->
		res.json {}

route.put "/game/:game/matches/:matchid", (req, res, next)->
	xtralife.api.match.updateMatch req.match_id, req.body
	.then (match)->
		res.json match
	.catch next
	.done()

# Store / products
route.get "/game/:game/store/products", downloadable('inapp'), (req, res, next)->
	xtralife.api.store.listProducts req.game, parseInt(req.query.skip), parseInt(req.query.limit),	(err, count, products)->
		return next err if err?
		res.json {total: count, list: products}

route.put "/game/:game/store/products", (req, res, next)->
	xtralife.api.store.setProducts req.game, req.body, (err, count)->
		return next err if err?
		res.json {total: count}

route.post "/game/:game/store/products", (req, res, next)->
	xtralife.api.store.addProduct req.game, req.body, (err, addedProduct)->
		return next err if err?
		res.json {product: addedProduct}

route.put "/game/:game/store/products/:productid", (req, res, next)->
	xtralife.api.store.updateProduct req.game, req.params.productid, req.body, (err, modifiedProduct)->
		return next err if err?
		res.json {product: modifiedProduct}

route.delete "/game/:game/store/products/:productid", (req, res, next)->
	xtralife.api.store.deleteProduct req.game, req.params.productid, (err, result)->
		return next err if err?
		res.json {ok: 1}

module.exports = route