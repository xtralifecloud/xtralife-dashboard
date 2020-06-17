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
const EditUserStorageCtrl = function($rootScope, $scope, $q, $routeParams, UserService, notificationService){
	const {
        game
    } = $scope.$parent;
	const {
        domain
    } = $scope.$parent;
	$scope.domain = domain;
	$scope.userId = $routeParams.userId;
	$scope.storage = [];
	$scope.selectedKey = [];
	$scope.kvGrid = {
		data: 'storage',

		enableCellSelection: true,
		enableRowSelection: true,
		enableCellEditOnFocus: true,

		selectedItems: $scope.selectedKey,
		multiSelect: false,

		columnDefs: [{
			field: 'fskey',
			displayName: 'Key',
			enableCellEdit: false
		}
		, {
			field: 'fsvalue',
			displayName: 'Value',
			enableCellEdit: true
		}
		]
	};

	UserService.getUserStorage(game.name, $scope.userId, domain).success(storage => $scope.storage = (storage != null) ? storage : [])
	.catch(function(err){
		if ((err.status !== 400) || !(err.data.code="KeyNotFound")) {
			alert('Cannot load data for user. Try reloading page.');
			console.log(err);
			return $scope.storage = [];
		}});

	$scope.addNewKey = function(key){
		let exists;
		for (let each of Array.from($scope.storage)) { if (each.fskey === key) { exists = each; } }
		if (exists != null) {
			return alert(`Duplicate key : '${key}'`);
		} else if (key.indexOf(".")!==-1) {
			return alert("Forbidden character : . ");		
		} else {
			return $scope.storage.push({fskey: key, fsvalue: "default value, update me"});
		}
	};

	$scope.deleteKey = function(kv){
		$scope.kvGrid.selectAll(false); // deselect all rows
		return $scope.storage = $scope.storage.filter(each => each.fskey !== kv.fskey);
	};

	$scope.ok = () => // send all the key-value pairs for update
    UserService.updateUserStorage(game.name, $scope.userId, $scope.storage, domain).success(() => notificationService.success('key/value saved!')).catch(function(err){
        notificationService.error('Error while saving data. See console for more details.');
        return console.log(err);
    });

	return $scope.cancel = function(){};
};

module.exports = EditUserStorageCtrl;