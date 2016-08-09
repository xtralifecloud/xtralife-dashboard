util = require 'util'

module.exports =

	errorHandler : (err, req, res, next)->
		logger.fatal err.message, {stack: err.stack}, (err)->
		res.status 500
		.json {message: err.message}
		.end()

	requestLogger : (req, res, next)->
		res_end = res.end
		res_json = res.json
		startTime = Date.now()
		savedJson = null
		res.end = ()->
			duration = Date.now() - startTime
			info =
				user: req.user? or ''
				duration: duration

			if logger.level is 'debug'
				info.jsonReq = util.inspect req.body
				info.jsonRes = util.inspect savedJson
				info.headers = req.headers

			logger.info "#{req.method} #{res.statusCode} #{req.originalUrl} - #{duration}ms", info

			res.end = res_end
			res_end.apply(res, arguments)

		if logger.level is 'debug'
			res.json = (json)->
				savedJson = json
				res.json = res_json
				res_json.apply(res,arguments)
		next()

	downloadable: (type)->
		(req, res, next)->
			if req.query.dl?
				env = process.env.NODE_ENV or 'dev'
				date = new Date()
				d = (int)->
					if int<=9 then '0'+int else int
				timestamp = [date.getFullYear(), d(date.getMonth()+1), d(date.getDate())].join '.'
				timestamp += '-'+ [d(date.getHours()), d(date.getMinutes()), d(date.getSeconds())].join ''
				res.header "Content-Disposition": "attachment; filename=#{env}-#{req.params.domain or req.game.appid}-#{type}-#{timestamp}.json;"
			next()