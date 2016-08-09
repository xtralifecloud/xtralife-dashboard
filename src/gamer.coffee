module.exports = ($rootScope, $scope, $modal, $route, $q, $routeParams, UserService, ngTableParams) ->
	game = $scope.$parent.game
	domain = $scope.$parent.domain
	
	$scope.userId = $routeParams.userId

	UserService.getUserProfile(game.name, $scope.userId).success (profile)->
		$scope.name = profile.displayName 
	.catch (err)->
		$scope.name = "undefined"

	$scope.$on 'domainChanged', (event, value)->
		domain = value
		$route.reload()

	$scope.$on 'gameChanged', (event, value)->
		game = value
		$route.reload()

