
express = require("express")
http = require("http")
middleware = require('./middleware.coffee')
path = require("path")
passport = require("passport")
LocalStrategy = require("passport-local").Strategy
BasicStrategy = require("passport-http").BasicStrategy
_ = require "underscore"

async = require 'async'

bodyParser = require('body-parser')
cookieParser = require('cookie-parser')
session = require('express-session')
RedisStore = require('connect-redis')(session)
morgan = require 'morgan'
speakeasy = require 'speakeasy'

cors = require 'cors'
fs = require "fs"

http = require 'http'
http.globalAgent.maxSockets = 50

require "coffee-script/register"

global.xlenv = require "xtralife-env"

# one of dev, sandbox or production
env = process.env.NODE_ENV or "dev"

xlenv.override null, xlenv.Log
xlenv.override null, require '../configDashboard/config.coffee'
xlenv.override null, require "../configDashboard/config.#{env}.coffee"

if fs.statSync("#{process.env.HOME}/.xtralife/xtralife-dashboard/config.#{env}.coffee").isFile()
	xlenv.override null, require "#{process.env.HOME}/.xtralife/xtralife-dashboard/config.#{env}.coffee" 

global.logger = xlenv.createLogger xlenv.logs

xlenv.env = env

xtralife = require 'xtralife-api'

# TODO use another redis server
redis = xlenv.redisClientSync()
limiter = require('express-limiter')(null, redis)

process.on 'uncaughtException', (err)->
	logger.fatal err.message, {stack: err.stack}, (err)->
		process.exit 1

_getGames = (gameNames)->
	_addPrivateDomain = (domains)->
		res = ['private']
		res.concat (if domains? then domains else [])

	({
		name: gameName,
		domains: _addPrivateDomain(game.config.domains),
		eventedDomains: _addPrivateDomain(game.config.eventedDomains)} for gameName, game of xtralife.api.game.dynGames when gameNames.indexOf(gameName) isnt -1)

# in xtralife/game.coffee, we replicate hooks configuration from cotc-rocket configuration...
unless xlenv.hooks?.definitions? then xlenv.hooks = { definitions: {} }


global.logger = xlenv.createLogger xlenv.logs

#==================================================================
# Define the strategy to be used by PassportJS

_loadUser = (username, cb)->
	unless xlenv.dashboard.users[username]? then return cb new Error('Incorrect username.')

	ident = _.extend {}, xlenv.dashboard.users[username]
	ident.name = username
	ident.games = _getGames ident.games

	cb null, ident

checkauth = (username, password, done) ->
	sha1 = require('crypto').createHash('sha1')
	sha1.update(password)
	hash = sha1.digest('hex')

	_loadUser username, (err, ident)->
		if err?
			return done null, false, message: "Incorrect username."

		if hash is ident.password
			return done null, ident
		else
			return done null, false, message: "Incorrect username."

# Serialized and deserialized methods when got from session
passport.serializeUser (user, done) ->
	done null, user.name

passport.deserializeUser (user, done) ->
	_loadUser user, (err, ident)->
		done null, ident or null

# for the backoffice, we'll first check the user/password, then the 2FA
passport.use new LocalStrategy {passReqToCallback: true}, (req, username, password, done) ->
	checkauth username, password, (err, ident, params)->
		if !ident.ggauth? or (req.body.ggcode is speakeasy.time key: ident.ggauth)
			done err, ident, params
		else
			done null, false, message: "Incorrect username."

# for the backoffice API, only the user/password is checked
passport.use new BasicStrategy checkauth

#==================================================================

# Start express application
app = express()

# all environments
app.set "port", process.env.PORT or 3000
#app.use morgan 'combined', {}
app.use bodyParser.json({strict : false, limit: 4096000})

redisForSessionStore = xlenv.redisClientSync()

app.use session
	name: xlenv.dashboard.session.name
	store: new RedisStore(client: redisForSessionStore)
	secret: xlenv.dashboard.session.secret
	saveUninitialized: true
	resave: false
	proxy: true
	cookie: { path: '/', httpOnly: true, secure: false, maxAge: null }
app.use passport.initialize() # Add passport initialization
app.use passport.session() # Add passport initialization

app.disable('etag')

#==================================================================
# routes
app.use express.static(path.join(__dirname, "../public"))

app.get "/*", (req, res, next)->
	res.set
		"Cache-Control": "no-cache, no-store, must-revalidate"
		Pragma: "no-cache"
		Expires: 0
	next()

app.get "/env", (req, res) ->
	version = require("../package.json").version
	options =
		removeUser: xlenv.options.removeUser
		removeLeaderboard : xlenv.options.removeLeaderboard
		showHookLog : xlenv.options.showHookLog
		
	res.send {env, version, options}

#==================================================================
# route to test if the user is logged in or not
app.get "/loggedin", (req, res) ->
	res.send (if req.isAuthenticated() then req.user else "0")

# route to log in
app.post "/login", passport.authenticate("local"), (req, res) ->
	res.send req.user

# route to log out
app.post "/logout", (req, res) ->
	req.logOut()
	res.status 200
	.end()

requestLogger = middleware.requestLogger
routes = require './routes.coffee'

app.use '/', requestLogger, routes

# options does not use auth I think...
app.options '/api/:version/*', cors(xlenv.http.cors)

app.use '/api', cors(xlenv.http.cors), passport.authenticate("basic", session: false ), limiter(xlenv.http.limiter), (req, res, next) ->
	next()

app.use '/api/:version', routes

app.use middleware.errorHandler

#==================================================================
Q = require 'bluebird'
def = Q.defer()

xtralife.configure (err)->
	throw err if err? # fail fast, we don't want a zombie backoffice
	server = http.createServer(app).listen app.get("port"), ->
		console.log "Dashboard listening on port " + app.get("port")
		console.log "http://localhost:3000"
		xlenv.xtralife = xtralife
		def.resolve(app)

module.exports = def.promise
