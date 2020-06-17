/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
module.exports = function($scope, $q, MatchService, ngTableParams){
	let {
        game
    } = $scope.$parent;
	let {
        domain
    } = $scope.$parent;

	$scope.selectedMatches = []; // Will contain one or more matches
	$scope.hideFinished = false;

	$scope.$on('domainChanged', function(event, value){
		domain = value;
		$scope.selectedMatches = [];
		return $scope.matchesTable.reload();
	});

	$scope.$on('gameChanged', function(event, value){
		game = value;
		$scope.selectedMatches = [];
		return $scope.matchesTable.reload();
	});

	$scope.onFilterChanged = value => $scope.matchesTable.reload();

	$scope.changeSelection = function(match){
		if ($scope.selectedMatches[0] != null) {
			$scope.selectedMatches[0].$selected=false;
		}
		match.$selected = true;
		return $scope.selectedMatches = [match];
	};

	$scope.deleteSelectedMatch = match => $q.all(Array.from($scope.selectedMatches).map((each) => MatchService.deleteMatch(game.name, each._id)))
    .then(function(){
        alert("Match deleted");
        return $scope.matchesTable.reload();}).catch(function(err){
        alert("Couldn't delete the selected match");
        return console.error(err);
    });

	return $scope.matchesTable = new ngTableParams({
		page: 1, // show first page
		count: 10
	}
	, {
		getData($defer, params) {
			const skip = () => (params.page() - 1) * params.count();
			const limit = () => params.count();

			// Unused: params.filter().match_id
			const listMatches = () => MatchService.getMatches(game.name, domain, $scope.hideFinished, $scope.gamer_id, $scope.customProperties, skip(), limit());

			$scope.selectedMatches = [];
			return listMatches().success(function(matches){ // data is {list: [], total: int}
				params.total(matches.total);
				return $defer.resolve(matches.list);}).catch(function(err){
				alert("Can't load match list. See Console for more details");
				return console.error(err);});
		}
	}
	);
};

