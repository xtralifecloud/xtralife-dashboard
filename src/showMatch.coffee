module.exports = ($scope, $routeParams, $modal, MatchService, ngTableParams)->
	game = $scope.$parent.game
	domain = $scope.$parent.domain

	useMatchForForm = (match)->
		$scope.match = match
		$scope.matchForm =
			_id: $scope.matchId
			description: match.description
			globalState: JSON.stringify(match.globalState)
			customProperties: JSON.stringify(match.customProperties)
			players: match.players
		delete match._id

	$scope.matchId = $routeParams.matchId

	MatchService.getMatch(game.name, $scope.matchId).success (match)->
		useMatchForForm match

	$scope.ok = ()->
		updated = {description: $scope.matchForm.description}
		try
			updated.globalState = JSON.parse $scope.matchForm.globalState
		catch err
			alert('Invalid JSON global state')
			return

		try
			updated.customProperties = JSON.parse $scope.matchForm.customProperties
		catch err
			alert('Invalid JSON custom properties')
			return

		MatchService.updateMatch(game.name, $scope.matchId, updated).success (match)->
			alert('Updated match successfully')
		.catch (err)->
			alert("Can't update match. See Console for more details")
			console.error err

	$scope.changeSelection = (event) ->
		modalInstance = $modal.open
			templateUrl: 'showMatch.event.html'
			controller: require './showMatch.event.coffee'
			resolve:
				event: -> event
