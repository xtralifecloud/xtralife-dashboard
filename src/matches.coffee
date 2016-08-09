module.exports = ($scope, $q, MatchService, ngTableParams)->
	game = $scope.$parent.game
	domain = $scope.$parent.domain

	$scope.selectedMatches = [] # Will contain one or more matches
	$scope.hideFinished = false

	$scope.$on 'domainChanged', (event, value)->
		domain = value
		$scope.selectedMatches = []
		$scope.matchesTable.reload()

	$scope.$on 'gameChanged', (event, value)->
		game = value
		$scope.selectedMatches = []
		$scope.matchesTable.reload()

	$scope.onFilterChanged = (value)->
		$scope.matchesTable.reload()

	$scope.changeSelection = (match)->
		$scope.selectedMatches[0]?.$selected=false
		match.$selected = true
		$scope.selectedMatches = [match]

	$scope.deleteSelectedMatch = (match)->
		$q.all(MatchService.deleteMatch(game.name, each._id) for each in $scope.selectedMatches)
		.then ()->
			alert "Match deleted"
			$scope.matchesTable.reload()

		.catch (err)->
			alert("Couldn't delete the selected match")
			console.error err

	$scope.matchesTable = new ngTableParams(
		page: 1 # show first page
		count: 10
	,
		getData: ($defer, params) ->
			skip = ()-> (params.page() - 1) * params.count()
			limit = ()-> params.count()

			# Unused: params.filter().match_id
			listMatches = ()->
				MatchService.getMatches(game.name, domain, $scope.hideFinished, $scope.gamer_id, $scope.customProperties, skip(), limit())

			$scope.selectedMatches = []
			listMatches().success (matches)-> # data is {list: [], total: int}
				params.total(matches.total)
				$defer.resolve matches.list
			.catch (err)->
				alert("Can't load match list. See Console for more details")
				console.error err
	)

