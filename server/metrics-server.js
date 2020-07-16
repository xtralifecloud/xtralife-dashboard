const http = require('http')
const express = require('express')
const xtralife = require("xtralife-api");
const Promise = require('bluebird')
const os = require('os')

const redis = xlenv.redisClientSync()

const CronJob = require('cron').CronJob;

const metrics = xtralife.api.game.getMetrics()

const collectDefaultMetrics = metrics.collectDefaultMetrics;
const prefix = 'xl_dashboard_';
collectDefaultMetrics({ prefix });

metrics.register.setDefaultLabels({ hostname: os.hostname() })

const app = express()

app.get('/metrics', async (req, res) => {
	res.set("Content-type", metrics.register.contentType)
	const content = await metrics.register.metrics()
	res.send(content)
})

const port = process.env.METRICS_PORT || 10254
const server = http.createServer(app).listen(port, 256, () => {
	console.log(`Metrics server running on port ${port}`)
})


// setup our metrics
const dailyActiveUsers = new metrics.Gauge({ labelNames: ["game"], name: "xl_backend_dau", help: "Daily active users" })
const monthlyActiveUsers = new metrics.Gauge({ labelNames: ["game"], name: "xl_backend_mau", help: "Monthly active users" })

// run job at 23:59:00 every day
// we just need the current day to be right
const dailyjob = new CronJob('00 59 23 * * *', function daily() {
	const day = new Date().getDate()
	// get day key for every game
	redis.keys('hll.dau:*', (err, dauKeys) => {
		if (err != null) {
			logger.error("Can't publish MAU and DAU statistics as redis is unavailable")
			return;
		};

		const dailyResults = Promise.mapSeries(dauKeys, (dauKey) => {
			// extract game name from dau key
			// starting here, we're processing one game at a time
			const game = dauKey.match(/^hll\.dau:(.*)$/)[1]

			return new Promise((resolve, reject) =>
				// count dau for game
				redis.pfcount(dauKey, (err, dailyCount) => {
					if (err) {
						console.error("Couln't count DAUs for ", game)
						return reject(err)
					}

					// move dau key to the mau counters
					redis.rename(dauKey, `hll.mau:${game}:${day}`, (err) => {
						if (err) {
							console.error("Couldn't rename DAU key to MAU for game ", game)
							return reject(err)
						}

						// set daily metrics
						dailyActiveUsers.set({ game }, dailyCount)

						// get all mau keys for game, one per day
						redis.keys(`hll.mau:${game}:*`, (err, mauKeys) => {
							if (err) {
								console.error("Couldn't get the MAU keys for ", game)
								return reject(err)
							}
							// keep only days <= today, ie. days of this month
							const validMauKeys = mauKeys.filter(key => {
								// extract day from mau key
								const [_, g, d] = key.match(/^hll\.mau:([^:]+):(.+)$/)
								return parseInt(d, 10) <= day
							})

							// count maus
							redis.pfcount(...validMauKeys, (err, monthlyCount) => {
								if (err) {
									console.error("Couldn't count the total MAU for ", game)
									return reject(err)
								}
								// set monthly gauge
								monthlyActiveUsers.set({ game }, monthlyCount)
								return resolve({game, dailyCount, monthlyCount})
							})
						})
					})
				})
			)
		})
		// nothing left to do but catch errors
		dailyResults.then((dailyStats) => {
			console.log(dailyStats)
		}).catch( console.error )
	})
});
dailyjob.start();

module.exports = metrics