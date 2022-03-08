/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

const express = require("express");
let http = require("http");
const middleware = require('./middleware.js');
const path = require("path");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const { BasicStrategy } = require("passport-http");
const _ = require("underscore");

const async = require('async');

const bodyParser = require('body-parser');
//const cookieParser = require('cookie-parser');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const speakeasy = require('speakeasy');

const cors = require('cors');
const fs = require("fs");

http = require('http');
http.globalAgent.maxSockets = 50;

const Q = require('bluebird');

global.xlenv = require("xtralife-env");

// one of dev, sandbox or production
const env = process.env.NODE_ENV || "dev";

xlenv.override(null, xlenv.Log);
xlenv.override(null, require('../configDashboard/config.js'));
xlenv.override(null, require(`../configDashboard/config.${env}.js`));

try {
	if (fs.statSync(`${process.env.HOME}/.xtralife/xtralife-dashboard/config.${env}.js`).isFile()) {
		xlenv.override(null, require(`${process.env.HOME}/.xtralife/xtralife-dashboard/config.${env}.js`));
	}
} catch (error) { }

global.logger = xlenv.createLogger(xlenv.logs);

xlenv.env = env;

const xtralife = require('xtralife-api');

// TODO use another redis server
const redis = xlenv.redisClientSync();
const limiter = require('express-limiter')(null, redis);

process.on('uncaughtException', err =>
	logger.fatal(err.message, { stack: err.stack }, err => process.exit(1))
);

const _getGames = function (gameNames) {
	const _addPrivateDomain = function (domains) {
		const res = ['private'];
		return res.concat(((domains != null) ? domains : []));
	};

	const result = [];
	for (let gameName in xtralife.api.game.dynGames) {
		const game = xtralife.api.game.dynGames[gameName];
		if (gameNames.indexOf(gameName) !== -1) {
			result.push({
				name: gameName,
				domains: _addPrivateDomain(game.config.domains),
				eventedDomains: _addPrivateDomain(game.config.eventedDomains)
			});
		}
	}
	return result;
};

// in xtralife/game.js, we replicate hooks configuration from cotc-rocket configuration...
if ((xlenv.hooks != null ? xlenv.hooks.definitions : undefined) == null) { xlenv.hooks = { definitions: {} }; }


global.logger = xlenv.createLogger(xlenv.logs);

//==================================================================
// Define the strategy to be used by PassportJS

const _loadUser = function (username, cb) {
	if (xlenv.dashboard.users[username] == null) { 
		process.nextTick( ()=> cb(new Error('Incorrect username.')) );
		return 
	}

	const ident = _.extend({}, xlenv.dashboard.users[username]);
	ident.name = username;
	ident.games = _getGames(ident.games);

	process.nextTick( ()=> cb(null, ident) );
};

const checkauth = function (username, password, done) {
	const sha1 = require('crypto').createHash('sha1');
	sha1.update(password);
	const hash = sha1.digest('hex');

	return _loadUser(username, function (err, ident) {
		if (err != null) {
			return done(null, false, { message: "Incorrect username." });
		}

		if (hash === ident.password) {
			return done(null, ident);
		} else {
			return done(null, false, { message: "Incorrect username." });
		}
	});
};

// Serialized and deserialized methods when got from session
passport.serializeUser((user, done) => done(null, user.name));

passport.deserializeUser((user, done) =>
	_loadUser(user, (err, ident) => process.nextTick( ()=> done(null, ident || null) ) ));

// for the backoffice, we'll first check the user/password, then the 2FA
passport.use(new LocalStrategy({ passReqToCallback: true }, (req, username, password, done) => checkauth(username, password, function (err, ident, params) {
	if ((ident.ggauth == null) || (req.body.ggcode === speakeasy.time({ key: ident.ggauth }))) {
		return done(err, ident, params);
	} else {
		return done(null, false, { message: "Incorrect username." });
	}
}))
);

// for the backoffice API, only the user/password is checked
passport.use(new BasicStrategy(checkauth));

//==================================================================
// Start express application
const app = express();
const ready = Q.defer();

if(env != "production"){
	app.use(cors({origin:"http://localhost:8080"}))
}

// all environments
app.set("port", process.env.PORT || 3000);

// this /v1/ping should avoid creating web sessions in redis for a simple health check
app.get('/v1/ping', (req, res, next) => {
	return ready.promise.then(app => res.status(200)
		.json({ backend: true, version: require("../package.json").version, utc: new Date() })
		.end());
});

app.use(bodyParser.json({ strict: false, limit: 4096000 }));

const redisForSessionStore = xlenv.redisClientSync();

app.use(session({
	name: xlenv.dashboard.session.name,
	store: new RedisStore({ client: redisForSessionStore }),
	secret: xlenv.dashboard.session.secret,
	saveUninitialized: true,
	resave: false,
	proxy: true,
	cookie: { path: '/', httpOnly: true, secure: false, maxAge: null }
}));
app.use(passport.initialize()); // Add passport initialization
app.use(passport.session()); // Add passport initialization

//app.disable('etag');

//==================================================================
// routes

app.get("/*", function (req, res, next) {
	res.set({
		"Cache-Control": "no-cache, no-store, must-revalidate",
		Pragma: "no-cache",
		Expires: 0
	});
	return next();
});

app.get("/env", function (req, res) {
	const { version } = require("../package.json");
	const options = {
		removeUser: xlenv.options.removeUser,
		removeLeaderboard: xlenv.options.removeLeaderboard,
		showHookLog: xlenv.options.showHookLog
	};

	return res.send({ env, version, options });
});

//==================================================================
// route to test if the user is logged in or not
app.get("/loggedin", (req, res) => res.send((req.isAuthenticated() ? req.user : "0")));

// route to log in
app.post("/login", passport.authenticate("local"), (req, res) => res.send(req.user));

// route to log out
app.post("/logout", function (req, res) {
	req.logOut();
	return res.status(200)
		.end();
});

const {
	requestLogger
} = middleware;
const routes = require('./routes.js');

app.use('/', requestLogger, routes);

// options does not use auth I think...
app.options('/api/:version/*', cors(xlenv.http.cors));

app.use('/api', cors(xlenv.http.cors), passport.authenticate("basic", { session: false }), limiter(xlenv.http.limiter), (req, res, next) => next());

app.use('/api/:version', routes);

app.use(middleware.errorHandler);

app.use(express.static(path.join(__dirname, "../client/build")));
app.get('/login', (req, res) => res.sendFile(path.resolve('client', 'build', 'index.html')));
app.get('/status', (req, res) => res.sendFile(path.resolve('client', 'build', 'index.html')));
app.get('/store', (req, res) => res.sendFile(path.resolve('client', 'build', 'index.html')));
app.get('/users', (req, res) => res.sendFile(path.resolve('client', 'build', 'index.html')));
app.get('/leaderboards', (req, res) => res.sendFile(path.resolve('client', 'build', 'index.html')));
app.get('/matches', (req, res) => res.sendFile(path.resolve('client', 'build', 'index.html')));
app.get('/gamer/*', (req, res) => res.sendFile(path.resolve('client', 'build', 'index.html')));

//==================================================================

xtralife.configure(function (err) {
	let server;
	if (err != null) { throw err; } // fail fast, we don't want a zombie backoffice
	return server = http.createServer(app).listen(app.get("port"), function () {
		console.log("Dashboard listening on port " + app.get("port"));
		console.log("http://localhost:3000");
		xlenv.xtralife = xtralife;
		return ready.resolve(app);
	});
});

require('./metrics-server.js')

module.exports = ready.promise;
