/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
module.exports = function($rootScope, $scope, $modal, $log, $q, UserService, GameService, ngTableParams, notificationService) {
	let {
        game
    } = $scope.$parent;
	let {
        domain
    } = $scope.$parent;

	$scope.leaderboards = [];
	$scope.leaderboard = null;
	$scope.inDev = process.env.NODE_ENV !== "production";

	const _loadLeaderboards = () => GameService.getGame(game.name, domain)
    .success(function(gameObject){
        $scope.leaderboards = ((() => {
            const result = [];
            for (let name in gameObject.leaderboards) {
                const value = gameObject.leaderboards[name];
                result.push({name, leaderboard: value});
            }
            return result;
        })());
        return $scope.leaderboard = ($scope.leaderboards != null) ? $scope.leaderboards[0] : null;
    });

	_loadLeaderboards();

	$scope.$watch('leaderboard', function(value){
		if ((value != null) && ($scope.leaderboard != null)) { return $scope.scoresTable.reload(); }
	});

	$scope.$on('gameChanged', function(event, value){
		game = value;
		$scope.scoresTable.reload();
		return _loadLeaderboards();
	});

	$scope.$on('domainChanged', function(event, value){
		domain = value;
		$scope.scoresTable.reload();
		return _loadLeaderboards();
	});

	$scope.scoresTable = new ngTableParams({
		page: 1, // show first page
		count: 10
	}
	, {
		getData($defer, params) {
			if ($scope.leaderboard == null) { return $defer.resolve(null); }

			return GameService.getLeaderboard(game.name, domain, $scope.leaderboard.name, params.page(), params.count())
			.success(function(scores){ // data is {list: [], total: int}
				if (scores[$scope.leaderboard.name] == null) { return $defer.resolve([]); }
				params.total(scores[$scope.leaderboard.name].maxpage*params.count());
				return $defer.resolve(scores[$scope.leaderboard.name].scores);}).error(function(data, status){
				alert(`Can't load scores (${status}). See Console for more details`);
				console.error(`Can't load scores (${status}). See Console for more details`);
				return console.log(data);}).catch(function(err){
				alert("Can't load scores. See Console for more details");
				return console.error(err);});
		}
	}
	);

	$scope.changeSelection = function(user) {
		const modalInstance = $modal.open({
			templateUrl: 'leaderboards.best.html',
			controller: require('./leaderboards.best.js'),
			resolve: {
				selectedUser(){ return user; },
				UserService(){ return UserService; },
				game() { return game; },
				domain() { return domain; }
			}
		});

		return modalInstance.result.then(() => $scope.scoresTable.reload());
	};

	$scope.rebuildLeaderboard = function() {
		if (confirm("Rebuilding the leaderboard can take a long time during which some scores may be invisible to your users. Are you sure?")) {
			return GameService.rebuildLeaderboard(game.name, domain, $scope.leaderboard.name).then(function(){
				notificationService.success("The leaderboard has been rebuilt.");
				$scope.scoresTable.reload();
				return _loadLeaderboards();
			});
		}
	};

	return $scope.deleteLeaderboard = function() {
		if (confirm(`Please confirm the deletion of the board ${$scope.leaderboard.name}.`)) {
			return GameService.deleteLeaderboard(game.name, domain, $scope.leaderboard.name).then(function(){
				notificationService.success("The leaderboard has been deleted.");
				$scope.scoresTable.reload();
				return _loadLeaderboards();
			});
		}
	};
};
