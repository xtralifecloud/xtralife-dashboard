/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
module.exports = function($rootScope, $scope, $q, $routeParams, UserService, ngTableParams, notificationService){

	const {
        game
    } = $scope.$parent;
	const {
        domain
    } = $scope.$parent;
	$scope.userId = $routeParams.userId;

	$scope.godfather = null;

	return $scope.godchildrenTable = new ngTableParams({
		page: 1, // show first page
		count: 10
	}
	, {
		getData($defer, params) {
			const skip = () => (params.page() - 1) * params.count();
			const limit = () => params.count();

			return UserService.getGod(game.name, domain, $scope.userId)
			.success(function(data){
				$scope.godfather = data.godfather;
				const result = data.godchildren.slice(skip(), skip()+limit());
				params.total(data.godchildren.length);
				return $defer.resolve(result);}).catch(function(err){
				alert("Can't load user list. See Console for more details");
				return console.error(err);});
		}
	}

	);
};

