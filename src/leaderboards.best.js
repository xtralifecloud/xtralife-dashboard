/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
/*
    This controller runs a modal
*/
const bestScoresCtrl = function($rootScope, $scope, $modalInstance, $q, selectedUser, UserService, game, domain){

	$scope.user = selectedUser;

	$scope.scores = [];

	const _loadScores = () => UserService.bestScores(game.name, domain, selectedUser.gamer_id)
    .success(res => $scope.scores = res).catch(err => console.error(err));

	_loadScores();

	$scope.deleteScore = lb => UserService.deleteScore(game.name, domain, selectedUser.gamer_id, lb)
    .success(() => _loadScores()).catch(err => console.error(err));

	return $scope.close = () => $modalInstance.close();
};

module.exports = bestScoresCtrl;