
request = require "supertest"
mocha = require "mocha"
should = require "should"
util = require "util"

server = null
serverPromise = require '../server/dashboard.coffee'

# ------------------------------------------------
# ------------------------------------------------
print = (obj)->
	return
	console.log util.inspect(obj, { showHidden: false, depth: 8, colors: true })

#endpoint = "https://sandbox-backoffice.clanofthecloud.com"
endpoint = "https://localhost:3000"


authapi =
	user: 'user'
	password: 'password'

game = 'com.clanofthecloud.cloudbuilder'
user_id = null
gamer_id = "57ac42c017c50ad25bbb1604"
gamers_id = null
domain = 'private'
friend_id = "57ac42dc17c50ad25bbb1605"


describe "BO API tests", ()->

	before 'should wait for initialisation', ->
		serverPromise.then (_server)->
			server = _server


	describe "basic requests", ()->
		
		it "/api/v1/company should fail is bad ident are passed", (done)->
			request(server)
			.get '/api/v1/company'
			.auth("xxxx", "xxxx")
			.set('Content-Type', 'application/json')
			.expect 401
			.end (err, res)->
				res.status.should.eql 401
				done(err)
			return null

		it "/api/v1/company should success", (done)->
			request(server)
			.get '/api/v1/company'
			.auth(authapi.user, authapi.password)
			.set('Content-Type', 'application/json')
			.expect 200
			.end (err, res)->
				res.status.should.eql 200
				should(err).be.undefined
				should.exist(res.body.name)
				should.exist(res.body.games)
				done(err)
			return null

	describe "users", ()->

		it "get profile should success", (done)->
			request(server)
			.get "/api/v1/game/#{game}/user/#{gamer_id}/profile"
			.auth(authapi.user, authapi.password)
			.set('Content-Type', 'application/json')
			.expect 200
			.end (err, res)->
				res.status.should.eql 200
				should(err).be.undefined
				should.exist(res.body.displayName)
				print res.body
				done(err)
			return null

		it "list users should success", (done)->
			request(server)
			.get "/api/v1/game/#{game}/users?skip=0&limit=3"
			.auth(authapi.user, authapi.password)
			.set('Content-Type', 'application/json')
			.expect 200
			.end (err, res)->
				res.status.should.eql 200
				should(err).be.undefined
				#print res.body
				user_id = res.body.list[0]._id
				gamers_id = (u._id for u in res.body.list)
				gamers_id.push gamer_id
				#print {user_id}
				done(err)
			return null


		it "list balance on user should success", (done)->
			request(server)
			.get "/api/v1/game/#{game}/user/#{gamer_id}/balance/private"
			.auth(authapi.user, authapi.password)
			.set('Content-Type', 'application/json')
			.expect 200
			.end (err, res)->
				res.status.should.eql 200
				should(err).be.undefined
				#print res.body
				done(err)
			return null

		it "list transaction on user should success", (done)->
			request(server)
			.get "/api/v1/game/#{game}/user/#{gamer_id}/txHistory/private?skip=0&limit=10"
			.auth(authapi.user, authapi.password)
			.set('Content-Type', 'application/json')
			.expect 200
			.end (err, res)->
				res.status.should.eql 200
				should(err).be.undefined
				#print res.body
				should.exist(res.body.transactions)
				should.exist(res.body.count)
				done(err)
			return null

		it "push event should success", (done)->
			request(server)
			.post "/api/v1/game/#{game}/user/#{gamer_id}/message/private"
			.auth(authapi.user, authapi.password)
			.set('Content-Type', 'application/json')
			.send {type : 'backoffice', message :'you win the contest!'} 
			.expect 200
			.end (err, res)->
				res.status.should.eql 200
				should(err).be.undefined
				#print res.body
				done(err)
			return null

	describe "bulk", ()->
		it "should send bulk event", (done)->
			request(server)
			.post "/api/v1/game/#{game}/push/bulk/private"
			.auth(authapi.user, authapi.password)
			.set('Content-Type', 'application/json')
			.send 
				userids: [gamer_id,friend_id]
				notification:
					fr : "Salut!"
					en : "hi!"
			.expect 200
			.end (err, res)->
				res.status.should.eql 200
				should(err).be.undefined
				#print res.body
				done(err)
			return null

		it "should wait", (done)->
			this.timeout 0
			setTimeout ()->
				done()
			, 40000
			return null



	describe "keyvalue", ()->

		it "all keys should success", (done)->
			request(server)
			.get "/api/v1/game/#{game}/storage/#{domain}"
			.auth(authapi.user, authapi.password)
			.set('Content-Type', 'application/json')
			.expect 200
			.end (err, res)->
				res.status.should.eql 200
				done(err)
			return null

		it "should write one key", (done)->
			request(server)
			.put "/api/v1/game/#{game}/storage/#{domain}/key1"
			.auth(authapi.user, authapi.password)
			.set('Content-Type', 'application/json')
			.send { content : "test write one key" }
			.expect 200
			.end (err, res)->
				res.status.should.eql 200
				done(err)
			return null

		it "should read one key", (done)->
			request(server)
			.get "/api/v1/game/#{game}/storage/#{domain}/key1"
			.auth(authapi.user, authapi.password)
			.set('Content-Type', 'application/json')
			.expect 200
			.end (err, res)->
				res.status.should.eql 200
				done(err)
			return null

	describe "game", ()->

		it "game should success", (done)->
			request(server)
			.get "/api/v1/game/#{game}/domain/private"
			.auth(authapi.user, authapi.password)
			.set('Content-Type', 'application/json')
			.expect 200
			.end (err, res)->
				res.status.should.eql 200
				should.exist(res.body.appid)
				should.exist(res.body.config)
				done(err)
			return null

