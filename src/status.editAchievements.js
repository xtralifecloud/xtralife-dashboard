/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
/*
    This controller runs a modal, with template user.html / editUser.html
*/
const EditAchievementsCtrl = function($rootScope, $scope, $modalInstance, game, domain, achievements, GameService) {
	$scope.achievements = achievements;
	$scope.selected = [];
	$scope.achGrid = {
		data: 'achievements',

		enableCellSelection: true,
		enableRowSelection: true,
		enableCellEditOnFocus: true,

		selectedItems: $scope.selected,
		multiSelect: false,

		columnDefs: [{
			field: 'name',
			displayName: 'Name',
			enableCellEdit: false
		}
		, {
			field: 'config.unit',
			displayName: 'Unit',
			enableCellEdit: true
		}
		, {
			field: 'config.maxValue',
			displayName: 'Trigger value',
			enableCellEdit: true
		}
		]
	};

	$scope.addNew = function(name){
		let existsAlready;
		for (let each of Array.from($scope.achievements)) { if (each.name === name) { existsAlready = each; } }
		if (existsAlready != null) {
			return alert(`Duplicate achievement name : '${name}'`);
		} else {
			return $scope.achievements.push({name, type: "limit", config: {unit: "default", maxValue: 0}});
		}
	};

	$scope.delete = function(ach){
		$scope.achGrid.selectAll(false); // deselect all rows
		return $scope.achievements = $scope.achievements.filter(each => each.name !== ach.name);
	};

	$scope.ok = () => // send all the key-value pairs for update
    GameService.saveAchievements(game.name, domain, $scope.achievements)
    .success(() => $modalInstance.close($scope.achievements)).catch(function(err){
        alert('Error while saving data. See console for more details.');
        return console.log(err);
    });

	return $scope.cancel = () => $modalInstance.dismiss('cancel');
};

module.exports = EditAchievementsCtrl;