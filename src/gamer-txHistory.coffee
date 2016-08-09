module.exports = ($rootScope, $scope, $routeParams, UserService, ngTableParams) ->

	game = $scope.$parent.game
	domain = $scope.$parent.domain
	$scope.userId = $routeParams.userId
	$scope.totalPages = 0

	$scope.txTable = new ngTableParams(
		page: 1 # show first page
		count: 10
	,
		getData: ($defer, params) ->
			skip = ()-> (params.page() - 1) * params.count()
			limit = ()-> params.count()

			UserService.txHistory(game.name, $scope.userId, domain, skip() , limit()).success (history)->
				params.total(history.count)
				$defer.resolve history.transactions

			.catch (err)->
				alert("Can't load transactions. See Console for more details")
				console.error err

	)

