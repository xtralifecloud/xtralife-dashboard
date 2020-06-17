/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
/*
    This controller runs a modal
*/
const UserBestScoresCtrl = function($rootScope, $scope, $routeParams, UserService, ngTableParams, notificationService){

	const {
        game
    } = $scope.$parent;
	const {
        domain
    } = $scope.$parent;
	$scope.userId = $routeParams.userId;

	$scope.scoresTable = new ngTableParams({
		page: 1, // show first page
		count: 100
	}
	, {
		getData($defer, params) {
			return UserService.bestScores(game.name, domain, $scope.userId)
			.success(function(res){
				const result = [];
				for (let s in res) {
					result.push({leaderboard : s, score : res[s].score, rank: res[s].rank, info : res[s].info});
				}
				params.total(result.length);
				return $defer.resolve(result);}).catch(err => notificationService.error(JSON.strigify(err)));
		}
	}
	);


	return $scope.deleteScore = lb => UserService.deleteScore(game.name, domain, $scope.userId, lb)
    .success(() => $scope.scoresTable.reload()).catch(err => notificationService.error(JSON.strigify(err)));
};

module.exports = UserBestScoresCtrl;