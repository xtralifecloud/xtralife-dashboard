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

const EditKVStoreCtrl = function($rootScope, $scope, $q, $routeParams, UserService, notificationService){
	const {
        game
    } = $scope.$parent;
	const {
        domain
    } = $scope.$parent;
	$scope.userId = $routeParams.userId;
	$scope.kvstore = [];
	$scope.selectedKey = [];
	$scope.kvstoreGrid = {
		data: 'kvstore',

		enableCellSelection: true,
		enableRowSelection: true,
		enableCellEditOnFocus: true,

		selectedItems: $scope.selectedKey,
		multiSelect: false,

		columnDefs: [{
			field: 'key',
			displayName: 'Key',
			enableCellEdit: false
		}
		, {
			field: 'value',
			displayName: 'Value',
			enableCellEdit: false
		}
		, {
			field: 'acl',
			displayName: 'ACL',
			enableCellEdit: false
		}
		]
	};

	UserService.getUserKVStore(game.name, $scope.userId, domain)
	.success(function(res){
		console.log(res);
		if (res == null) { res = {}; }
		return $scope.kvstore = res;}).catch(function(err){
		alert('Error while loading kv data. See console for more details.');
		return console.log(err);
	});

	$scope.addNewKey = function(key){
		let exists;
		for (let each of Array.from($scope.kvstore)) { if (each.key === key) { exists = each; } }
		if (exists != null) {
			return alert(`Duplicate key : '${key}'`);
		} else if (key.indexOf(".")!==-1) {
			return alert("Forbidden character : . ");		
		} else {
			return $scope.kvstore.push({key, value: "{}", acl: "{}"});
		}
	};

	$scope.deleteKey = function(kv){
		$scope.kvstoreGrid.selectAll(false); // deselect all rows
		return $scope.kvstore = $scope.kvstore.filter(each => each.key !== kv.key);
	};

	return $scope.ok = () => // send all the key-value pairs for update
    UserService.updateKVStore(game.name, $scope.userId, domain, $scope.kvstore)
    .success(() => notificationService.success('kvstore saved!')).catch(function(err){
        alert('Error while saving data. See console for more details.');
        return console.log(err);
    });
};

module.exports = EditKVStoreCtrl;