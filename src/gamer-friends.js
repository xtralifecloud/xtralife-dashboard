/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
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

	$scope.usersTable = new ngTableParams({
		page: 1, // show first page
		count: 10
	}
	, {
		getData($defer, params) {
			const skip = () => (params.page() - 1) * params.count();
			const limit = () => params.count();
			const isSearch = () => (params.filter().q != null) && (params.filter().q !== '');

			return UserService.getFriends(game.name, domain, $scope.userId).success(function(friends){
				let each;
				for (each of Array.from(friends.friends)) { each.blacklisted = false; }
				for (each of Array.from(friends.blackList)) { each.blacklisted = true; }

				const result = friends.friends;
				for (each of Array.from(friends.blackList)) { result.push(each); }

				params.total(result.length);
				return $defer.resolve(result);}).catch(function(err){
				alert("Can't load user list. See Console for more details");
				return console.error(err);});
		}
	}

	);

	return $scope.removeFriend = friend => UserService.removeFriend(game.name, domain, $scope.userId, friend.gamer_id)
    .success(function() {
        notificationService.success('friend removed!');
        return $scope.usersTable.reload();}).catch(function(err){
        alert("Can't remove friend. See Console for more details");
        return console.error(err);
    });
};

