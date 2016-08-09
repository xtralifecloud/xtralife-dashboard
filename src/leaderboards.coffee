module.exports = ($rootScope, $scope, $modal, $log, $q, UserService, GameService, ngTableParams, notificationService) ->
	game = $scope.$parent.game
	domain = $scope.$parent.domain

	$scope.leaderboards = []
	$scope.leaderboard = null
	$scope.inDev = process.env.NODE_ENV isnt "production"

	_loadLeaderboards = ()->
		GameService.getGame game.name, domain
		.success (gameObject)->
			$scope.leaderboards = ({name: name, leaderboard: value} for name, value of gameObject.leaderboards)
			$scope.leaderboard = if $scope.leaderboards? then $scope.leaderboards[0] else null

	_loadLeaderboards()

	$scope.$watch 'leaderboard', (value)->
		if value? and $scope.leaderboard? then $scope.scoresTable.reload()

	$scope.$on 'gameChanged', (event, value)->
		game = value
		$scope.scoresTable.reload()
		_loadLeaderboards()

	$scope.$on 'domainChanged', (event, value)->
		domain = value
		$scope.scoresTable.reload()
		_loadLeaderboards()

	$scope.scoresTable = new ngTableParams(
		page: 1 # show first page
		count: 10
	,
		getData: ($defer, params) ->
			unless $scope.leaderboard? then return $defer.resolve null

			GameService.getLeaderboard(game.name, domain, $scope.leaderboard.name, params.page(), params.count())
			.success (scores)-> # data is {list: [], total: int}
				unless scores[$scope.leaderboard.name]? then return $defer.resolve []
				params.total(scores[$scope.leaderboard.name].maxpage*params.count())
				$defer.resolve scores[$scope.leaderboard.name].scores
			.error (data, status)->
				alert("Can't load scores (#{status}). See Console for more details")
				console.error "Can't load scores (#{status}). See Console for more details"
				console.log data
			.catch (err)->
				alert("Can't load scores. See Console for more details")
				console.error err
	)

	$scope.changeSelection = (user) ->
		modalInstance = $modal.open
			templateUrl: 'leaderboards.best.html'
			controller: require './leaderboards.best.coffee'
			resolve:
				selectedUser: ()-> user
				UserService: ()-> UserService
				game: -> game
				domain: -> domain

		modalInstance.result.then ()->
			$scope.scoresTable.reload()

	$scope.rebuildLeaderboard = () ->
		if confirm "Rebuilding the leaderboard can take a long time during which some scores may be invisible to your users. Are you sure?"
			GameService.rebuildLeaderboard(game.name, domain, $scope.leaderboard.name).then ()->
				notificationService.success "The leaderboard has been rebuilt."
				$scope.scoresTable.reload()
				_loadLeaderboards()

	$scope.deleteLeaderboard = () ->
		if confirm "Please confirm the deletion of the board #{$scope.leaderboard.name}."
			GameService.deleteLeaderboard(game.name, domain, $scope.leaderboard.name).then ()->
				notificationService.success "The leaderboard has been deleted."
				$scope.scoresTable.reload()
				_loadLeaderboards()
