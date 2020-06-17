/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
module.exports = function($rootScope, $scope, $routeParams, UserService, ngTableParams) {

	const {
        game
    } = $scope.$parent;
	const {
        domain
    } = $scope.$parent;
	$scope.userId = $routeParams.userId;
	$scope.totalPages = 0;

	return $scope.txTable = new ngTableParams({
		page: 1, // show first page
		count: 10
	}
	, {
		getData($defer, params) {
			const skip = () => (params.page() - 1) * params.count();
			const limit = () => params.count();

			return UserService.txHistory(game.name, $scope.userId, domain, skip() , limit()).success(function(history){
				params.total(history.count);
				return $defer.resolve(history.transactions);}).catch(function(err){
				alert("Can't load transactions. See Console for more details");
				return console.error(err);});
		}
	}

	);
};

