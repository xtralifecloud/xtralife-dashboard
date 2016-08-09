module.exports.UserService = ($http) ->

	# list and find users
	findUser: (game, user_id) ->
		$http.get "/game/#{game}/users/find/#{user_id}"

	getUsers: (game, skip, limit) ->
		$http.get "/game/#{game}/users?skip=#{skip}&limit=#{limit}"

	searchUsers: (game, q, skip, limit) ->
		$http.get "/game/#{game}/users/search?q=#{q}&skip=#{skip}&limit=#{limit}"

	getFriends : (game, domain, userId)->
		$http.get "/game/#{game}/user/#{userId}/friends/#{domain}"

	removeFriend: (game, domain, userId, friendId)->
		$http.delete "/game/#{game}/user/#{userId}/friend/#{domain}/#{friendId}"

	getGod : (game, domain, userId)->
		$http.get "/game/#{game}/user/#{userId}/friends/#{domain}/god"

	# Other functions
	sendMessage: (game, user, eventObject, domain="private")->
		$http.post "/game/#{game}/user/#{user._id}/message/#{domain}", JSON.stringify eventObject

	deleteUser: (game, user_id) ->
		$http.delete "/game/#{game}/user/#{user_id}"


	# User profile & properties
	getUserOutline: (game, user_id)->
		$http.get "/game/#{game}/user/#{user_id}/outline"

	getUserProfile: (game, user_id)->
		$http.get "/game/#{game}/user/#{user_id}/profile"

	updateUserProfile: (game, user_id, profile)->
		$http.post "/game/#{game}/user/#{user_id}/profile", JSON.stringify profile

	updateUserProperties: (game, domain, user_id, properties)->
		$http.post "/game/#{game}/user/#{user_id}/domain/#{domain}/properties", JSON.stringify properties

	getUserProperties: (game, domain, user_id) ->
		$http.get("/game/#{game}/user/#{user_id}/domain/#{domain}/properties")

	# KVstore user
	getUserKVStore: (game, user_id, domain="private") ->
		$http.get("/game/#{game}/user/#{user_id}/kvstore/#{domain}")

	updateUserKVStore: (game, user_id, kvstore, domain="private")->
		$http.post "/game/#{game}/user/#{user_id}/kvstore/#{domain}", JSON.stringify kvstore

	# Virtual FS user
	getUserStorage: (game, user_id, domain="private") ->
		$http.get("/game/#{game}/user/#{user_id}/storage/#{domain}")

	updateUserStorage: (game, user_id, storage, domain="private")->
		$http.post "/game/#{game}/user/#{user_id}/storage/#{domain}", JSON.stringify storage


	# Transactions
	balance: (game, user_id, domain="private")->
		$http.get "/game/#{game}/user/#{user_id}/balance/#{domain}"

	newTransaction: (game, user_id, tx, description, domain="private")->
		$http.post "/game/#{game}/user/#{user_id}/transaction/#{domain}", JSON.stringify(tx: tx, description:description)

	txHistory: (game, user_id, domain="private", skip=0, limit=0)->
		$http.get "/game/#{game}/user/#{user_id}/txHistory/#{domain}?skip=#{skip}&limit=#{limit}"

	# Scores
	bestScores: (game, domain, user_id)->
		$http.get "/game/#{game}/user/#{user_id}/domain/#{domain}/bestscores"

	deleteScore: (game, domain, user_id, lb)->
		$http.delete "/#{game}/user/#{user_id}/domain/#{domain}/#{lb}"

module.exports.GameService = ($http) ->
	getSignedUrl: (game, domain, key)->
		$http.get "/game/#{game}/signedurl/#{domain}/#{key}"

	getGameStorage: (game, domain) ->
		$http.get "/game/#{game}/storage/#{domain}"

	updateGameStorage: (game, domain, storage) ->
		$http.post "/game/#{game}/storage/#{domain}", JSON.stringify storage

	getGame: (game, domain)->
		$http.get "/game/#{game}/domain/#{domain}"

	getLeaderboard: (game, domain, leaderboard, page, count)->
		$http.get "/game/#{game}/domain/#{domain}/leaderboard/#{leaderboard}?page=#{page}&count=#{count}"

	rebuildLeaderboard: (game, domain, leaderboard, page, count)->
		$http.post "/game/#{game}/domain/#{domain}/leaderboard/#{leaderboard}"

	deleteLeaderboard: (game, domain, leaderboard)->
		$http.delete "/game/#{game}/domain/#{domain}/leaderboard/#{leaderboard}"


	getAchievements: (game, domain)->
		$http.get "/game/#{game}/achievements/#{domain}"
		.then (res)->
			definitions = res.data
			({name: name, type: ach.type, config: ach.config, gameData: ach.gameData} for name, ach of definitions)

	saveAchievements: (game, domain, achievements)->
		definitions = {}
		(definitions[each.name] = {type: each.type, config: each.config, gameData: each.gameData}) for each in achievements
		$http.post "/game/#{game}/achievements/#{domain}", JSON.stringify definitions

	saveRawAchievements: (game, domain, achievements)->
		$http.post "/game/#{game}/achievements/#{domain}", JSON.stringify achievements

	exportData: (game)->
		$http.post "/job/company/userexport", {data:{}}


module.exports.AuthService = ($http, $rootScope) ->
	userName = null
	games = null

	setUserName: (aUserName)->
		if userName isnt aUserName
			userName = aUserName
			$rootScope.$broadcast 'userChanged'

	userName: ()->
		userName

	games: ()->
		games

	setGames: (gamesArray)->
		if JSON.stringify(gamesArray) isnt JSON.stringify(games)
			games = gamesArray
			$rootScope.$broadcast 'gamesChanged'

module.exports.MatchService = ($http) ->

	# list matches
	getMatches: (game, domain, hideFinished, gamer_id, customProperties, skip, limit)->
		url = "/game/#{game}/matches/domain/#{domain}?skip=#{skip}&limit=#{limit}&hideFinished=#{hideFinished}"
		url = url + "&gamerId=#{gamer_id}" if gamer_id?
		url = url + "&customProperties=" + encodeURIComponent(customProperties) if customProperties? and customProperties.length > 0
		$http.get url

	getMatch: (game, matchId)->
		$http.get "/game/#{game}/matches/#{matchId}"

	deleteMatch: (game, matchId)->
		$http.delete "/game/#{game}/matches/#{matchId}"

	updateMatch: (game, matchId, match)->
		$http.put "/game/#{game}/matches/#{matchId}", match


module.exports.StoreService = ($http) ->

	addProduct: (game, product)->
		$http.post "/game/#{game}/store/products", product

	deleteProduct: (game, productId)->
		$http.delete "/game/#{game}/store/products/#{productId}"

	listProducts: (game, skip, limit)->
		$http.get "/game/#{game}/store/products"

	setProducts: (game, products)->
		$http.put "/game/#{game}/store/products", products

	updateProduct: (game, product)->
		$http.put "/game/#{game}/store/products/#{product.productId}", product

module.exports.ExportService = ($http) ->

	checkFileName: (filename, expectedType, expectedDomain, action="replace")->
		extension = (filename.split('.'))[(filename.split('.')).length-1]
		env = filename.split('-')[0]
		domain = filename.split('-')[1]
		type = filename.split('-')[2]

		if extension.toLowerCase() isnt 'json'
			alert "Incorrect file type. Found: #{extension} but expected .json"
			return false

		if type isnt expectedType
			alert "Wrong export type. Found: #{type} but expected #{expectedType}"
			return false

		if domain isnt expectedDomain
			unless confirm("Are you sure you want to import into #{domain} your configuration from #{expectedDomain} ?")
				return false

		if confirm("Are you sure you want to #{action} this data with data from #{env}? ")
			return true
		else return false

	readFileAsJson: (file, cb)->
		filereader = new FileReader()
		filereader.onloadend = ->
			jsonContents = JSON.parse filereader.result
			cb jsonContents

		filereader.readAsText file
