/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
module.exports = function($scope, $routeParams, $modal, MatchService, ngTableParams){
	const {
        game
    } = $scope.$parent;
	const {
        domain
    } = $scope.$parent;

	const useMatchForForm = function(match){
		$scope.match = match;
		$scope.matchForm = {
			_id: $scope.matchId,
			description: match.description,
			globalState: JSON.stringify(match.globalState),
			customProperties: JSON.stringify(match.customProperties),
			players: match.players
		};
		return delete match._id;
	};

	$scope.matchId = $routeParams.matchId;

	MatchService.getMatch(game.name, $scope.matchId).success(match => useMatchForForm(match));

	$scope.ok = function(){
		let err;
		const updated = {description: $scope.matchForm.description};
		try {
			updated.globalState = JSON.parse($scope.matchForm.globalState);
		} catch (error) {
			err = error;
			alert('Invalid JSON global state');
			return;
		}

		try {
			updated.customProperties = JSON.parse($scope.matchForm.customProperties);
		} catch (error1) {
			err = error1;
			alert('Invalid JSON custom properties');
			return;
		}

		return MatchService.updateMatch(game.name, $scope.matchId, updated).success(match => alert('Updated match successfully')).catch(function(err){
			alert("Can't update match. See Console for more details");
			return console.error(err);
		});
	};

	return $scope.changeSelection = function(event) {
		let modalInstance;
		return modalInstance = $modal.open({
			templateUrl: 'showMatch.event.html',
			controller: require('./showMatch.event.js'),
			resolve: {
				event() { return event; }
			}
		});
	};
};
