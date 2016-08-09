module.exports = ($rootScope, $scope, $q, $routeParams, UserService, ngTableParams, notificationService)->

	game = $scope.$parent.game
	domain = $scope.$parent.domain
	$scope.userId = $routeParams.userId

	$scope.godfather = null

	$scope.godchildrenTable = new ngTableParams(
		page: 1 # show first page
		count: 10
	,
		getData: ($defer, params) ->
			skip = ()-> (params.page() - 1) * params.count()
			limit = ()-> params.count()

			UserService.getGod(game.name, domain, $scope.userId)
			.success (data)->
				$scope.godfather = data.godfather
				result = data.godchildren.slice skip(), skip()+limit()
				params.total(data.godchildren.length)
				$defer.resolve result

			.catch (err)->
				alert("Can't load user list. See Console for more details")
				console.error err

	)

