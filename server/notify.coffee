async = require 'async'
xtralife = require 'xtralife-api'
_ = require 'underscore'


cargo = async.cargo((tasks, cb)->
	for task in tasks
		xtralife.notify.send task.app, task.domain, task.os, task.tokens, task.alert, (err, count)->
			console.log 'doing cargo task'
			if err? then logger.error err.message, {stack: err.stack}
			cb null
, 1)


sendbulk = (domain, users, message)->

	users = _.map users, (u)->
		for t in u.tokens when t.domain is domain
			{ _id : u._id, os: t.os, token: t.token, lang: u.profile.lang?.substring(0,2) }

	users = _.flatten users
	usersByOs = _.groupBy users, "os"

	app = xtralife.api.game.getAppsWithDomain domain, (err, app)->
		if err? then return logger.error err.message, {stack: err.stack}

		for os of usersByOs
			usersByOs[os] = _.groupBy usersByOs[os], "lang"
			for lang of usersByOs[os]
							
				alert =
					message : message[lang] or message.en
					user :  "backoffice"
					data :  message.data

				if alert.message?
					tokens = _.map usersByOs[os][lang], 'token'
					console.log tokens
	
					while tokens.length
						ts = tokens.splice 0, 1000
						console.log ts
						task = {app, domain, os, tokens:ts, alert}
						cargo.push task
	
module.exports = 
	pushBulk: (appid, domain, usersids, message, cb)->
		unless xtralife.api.game.hasListener(domain)
			return cb(new Error "No listener on domain #{domain}!")
		objids = _.map job.data.userids, (id)->
			new ObjectID(id)
		
		collusers().find({_id: {$in:objids}, 'games.appid': appid, 'tokens.domain': domain}, {"profile.lang": 1, tokens:1}).toArray (err, users)=>
			if err? then return cb err
			sendbulk domain, users, message
			cb null, users.length
