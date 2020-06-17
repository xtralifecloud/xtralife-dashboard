/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const {
	ObjectID
} = require('mongodb');
const async = require('async');
const xtralife = require('xtralife-api');
const _ = require('underscore');


const cargo = async.cargo((tasks, cb) => Array.from(tasks).map((task) =>
	xtralife.api.notify.send(task.app, task.domain, task.os, task.tokens, task.alert, function (err, count) {
		if (err != null) { logger.error(err.message, { stack: err.stack }); }
		return cb(null);
	}))
	, 1);


const sendbulk = function (domain, users, message) {

	let app;
	users = _.map(users, u => Array.from(u.tokens).filter((t) => t.domain === domain).map((t) => (
		{ _id: u._id, os: t.os, token: t.token, lang: (u.profile.lang != null ? u.profile.lang.substring(0, 2) : undefined) })));

	users = _.flatten(users);
	const usersByOs = _.groupBy(users, "os");

	return app = xtralife.api.game.getAppsWithDomain(domain, function (err, app) {
		if (err != null) { return logger.error(err.message, { stack: err.stack }); }

		return (() => {
			const result = [];
			for (var os in usersByOs) {
				usersByOs[os] = _.groupBy(usersByOs[os], "lang");
				result.push((() => {
					const result1 = [];
					for (let lang in usersByOs[os]) {

						var alert = {
							message: message[lang] || message.en,
							user: "backoffice",
							data: message.data
						};

						if (alert.message != null) {
							var tokens = _.map(usersByOs[os][lang], 'token');
							console.log(tokens);

							result1.push((() => {
								const result2 = [];
								while (tokens.length) {
									const ts = tokens.splice(0, 1000);
									console.log(ts);
									const task = { app, domain, os, tokens: ts, alert };
									result2.push(cargo.push(task));
								}
								return result2;
							})());
						} else {
							result1.push(undefined);
						}
					}
					return result1;
				})());
			}
			return result;
		})();
	});
};

module.exports = {
	pushBulk(appid, domain, usersids, message, cb) {
		if (!xtralife.api.game.hasListener(domain)) {
			return cb(new Error(`No listener on domain ${domain}!`));
		}
		const objids = _.map(usersids, id => new ObjectID(id));

		return xtralife.api.collections.coll("users").find({ _id: { $in: objids }, 'games.appid': appid, 'tokens.domain': domain }, { "profile.lang": 1, tokens: 1 }).toArray((err, users) => {
			if (err != null) { return cb(err); }
			sendbulk(domain, users, message);
			return cb(null, users.length);
		});
	}
};
