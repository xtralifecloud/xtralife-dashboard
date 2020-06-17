/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const util = require('util');

module.exports = {

	errorHandler(err, req, res, next) {
		logger.fatal(err.message, { stack: err.stack }, function (err) { });
		return res.status(500)
			.json({ message: err.message })
			.end();
	},

	requestLogger(req, res, next) {
		const res_end = res.end;
		const res_json = res.json;
		const startTime = Date.now();
		let savedJson = null;
		res.end = function () {
			const duration = Date.now() - startTime;
			const info = {
				user: (req.user != null) || '',
				duration
			};

			if (logger.level === 'debug') {
				info.jsonReq = util.inspect(req.body);
				info.jsonRes = util.inspect(savedJson);
				info.headers = req.headers;
			}

			logger.info(`${req.method} ${res.statusCode} ${req.originalUrl} - ${duration}ms`, info);

			res.end = res_end;
			return res_end.apply(res, arguments);
		};

		if (logger.level === 'debug') {
			res.json = function (json) {
				savedJson = json;
				res.json = res_json;
				return res_json.apply(res, arguments);
			};
		}
		return next();
	},

	downloadable(type) {
		return function (req, res, next) {
			if (req.query.dl != null) {
				const env = process.env.NODE_ENV || 'dev';
				const date = new Date();
				const d = function (int) {
					if (int <= 9) { return '0' + int; } else { return int; }
				};
				let timestamp = [date.getFullYear(), d(date.getMonth() + 1), d(date.getDate())].join('.');
				timestamp += '-' + [d(date.getHours()), d(date.getMinutes()), d(date.getSeconds())].join('');
				res.header({ "Content-Disposition": `attachment; filename=${env}-${req.params.domain || req.game.appid}-${type}-${timestamp}.json;` });
			}
			return next();
		};
	}
};