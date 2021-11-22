/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
module.exports = function($rootScope, $scope, $modal, $route, $q, $routeParams, UserService, ngTableParams) {
	let {
        game
    } = $scope.$parent;
	let {
        domain
    } = $scope.$parent;
	
	$scope.userId = $routeParams.userId;

	UserService.getUserProfile(game.name, $scope.userId).success(profile => $scope.name = profile.displayName).catch(err => $scope.name = "undefined");

	$scope.$on('domainChanged', function(event, value){
		if(value.fromGameChange) {
			domain = value.domain;
		}else{
			domain = value.domain;
			$route.reload()
		}
		return;
	});

	return $scope.$on('gameChanged', function(event, value){
		game = value;
		return $route.reload();
	});
};

