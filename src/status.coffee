

module.exports = ($rootScope, $scope, $modal, $upload, $http, GameService, ExportService, notificationService)->
	$scope.storage = []
	$scope.achievements = []
	$scope.certs = {}
	$scope.socialSettings = {}

	$scope.statsDataDAU = [ {key: "DAU", values: [] }]
	$scope.statsDataMAU = [ {key: "MAU", values: [] }]
	$scope.statsDataCCU = [ {key: "CCU", values: [] }]

	$scope.domain = domain = $scope.$parent.domain
	$scope.game = game = $scope.$parent.game
	$scope.enablePullEvents = false

	updateEnablePullEvents = ->
		$scope.enablePullEvents = game.eventedDomains.indexOf(domain) isnt -1

	loadStorage = ->
		GameService.getGameStorage(game.name, domain).success (storage)->
			$scope.storage = storage
		, (err)->
			console.error "error"

	loadAchievements = ->
		GameService.getAchievements(game.name, domain)
		.then (achievements)->
			$scope.achievements = achievements
		, (err)->
			console.error err

	$scope.$on 'domainChanged', (event, value)->
		$scope.domain = domain = value
		loadStorage()
		loadAchievements()
		updateEnablePullEvents()

	$scope.$on 'gameChanged', (event, value)->
		game = value
		$scope.game = value
		loadStorage()
		$scope.saveCertsOK=false
		loadAchievements()
		updateEnablePullEvents()


	updateEnablePullEvents()
	loadStorage()
	loadAchievements()

	$scope.changePullEvent = (game, domain)->
		previouslyEnabled = $scope.enablePullEvents

		newEventedDomains = if previouslyEnabled
			(each for each in game.eventedDomains when each isnt domain)
		else
			[domain].concat game.eventedDomains

		newEventedDomainsWithoutPrivate = (each for each in newEventedDomains when each isnt 'private')
		GameService.setEventedDomains(game.name, newEventedDomainsWithoutPrivate).success ()->
			game.eventedDomains = newEventedDomains

	$scope.editGameStorage = ()->
		$modal.open
			templateUrl: 'status.editGameStorage.html'
			controller: require './status.editGameStorage.coffee'
			resolve:
				GameService: -> GameService
				storage: -> $scope.storage
				game: -> game
				domain: -> domain
			backdrop : false
		.result
		.then -> loadStorage()

	$scope.importGameStorage = (files)->
		if files?.length is 1

			unless ExportService.checkFileName files[0].name, "gamekv", domain then return

			ExportService.readFileAsJson files[0], (jsonContents)->

				GameService.updateGameStorage(game.name, domain, jsonContents)
				.success ()->
					alert 'Game K/V storage imported'
					loadStorage()
				.catch (err)->
					alert('Error while saving data. See console for more details.')

	$scope.editAchievements = ()->
		$modal.open
			templateUrl: 'status.editAchievements.html'
			controller: require './status.editAchievements.coffee'
			resolve:
				GameService: -> GameService
				achievements: -> $scope.achievements
				game: -> game
				domain: -> domain
			backdrop : false
		.result
		.then -> loadAchievements()

	$scope.importAchievements = (files)->
		if files?.length is 1

			unless ExportService.checkFileName files[0].name, "achievements", domain then return

			ExportService.readFileAsJson files[0], (jsonContents)->

				GameService.saveRawAchievements(game.name, domain, jsonContents)
				.success ()->
					alert 'Achievements imported'
					loadAchievements()
				.catch (err)->
					alert('Error while saving data. See console for more details.')


	$scope.xAxisCCUFormatFunction = ->
		(d) ->
			moment.unix(d).format("hh:mm")

	$scope.ccuToolTipContent = ->
		(key, x, y, e, graph) ->
			'<h1>' + key + '</h1>' + '<p>' +  y + ' at ' + moment.unix(x).format("hh:mm") + '</p>'

	$scope.xAxisDAUFormatFunction = ->
		(d) ->
			moment.unix(d).format("DD-MM-YY")

	$scope.dauToolTipContent = ->
		(key, x, y, e, graph) ->
			'<h1>' + key + '</h1>' + '<p>' +  y + ' at ' + moment.unix(x).format("DD-MM-YY") + '</p>'

	$scope.xAxisMAUFormatFunction = ->
		(d) ->
			moment.unix(d).format("MM-YYYY")

	$scope.mauToolTipContent = ->
		(key, x, y, e, graph) ->
			'<h1>' + key + '</h1>' + '<p>' +  y + ' at ' + moment.unix(x).format("MM-YYYY") + '</p>'

	$scope.exportData = ->
		GameService.exportData().success (data)->
			$scope.alerts.push({ type: 'success' , msg: "Exporting data...This could take a while, you'll receive an email when the job is done."});
		.error (err)->
			$scope.alerts.push({ type: 'danger' , msg: "Unable to export data : #{JSON.stringify(err)}"});

	$scope.alerts = []

	$scope.closeAlert = (index)->
		$scope.alerts.splice index, 1
