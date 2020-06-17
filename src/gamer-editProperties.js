/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
/*
    This controller runs a modal, with template user.html / editUser.html
*/
const EditUserPropertiesCtrl = function($rootScope, $scope, $q, $routeParams, UserService, notificationService){
	const {
        game
    } = $scope.$parent;
	const {
        domain
    } = $scope.$parent;
	$scope.userId = $routeParams.userId;
	$scope.properties = [];
	$scope.selectedKey = [];
	$scope.propertiesGrid = {
		data: 'properties',

		enableCellSelection: true,
		enableRowSelection: true,
		enableCellEditOnFocus: true,

		selectedItems: $scope.selectedKey,
		multiSelect: false,

		columnDefs: [{
			field: 'key',
			displayName: 'Property',
			enableCellEdit: false
		}
		, {
			field: 'value',
			displayName: 'Value',
			enableCellEdit: true
		}
		]
	};

	const PropertiesHash = function(properties){
		const obj = {};
		for (let each of Array.from(properties)) { obj[each.key]=each.value; }
		return obj;
	};

	UserService.getUserProperties(game.name, domain, $scope.userId)
	.success(function(res){
		if (res == null) { res = {}; }
		return $scope.properties = ((() => {
			const result = [];
			for (let key in res) {
				const value = res[key];
				result.push({key, value});
			}
			return result;
		})());}).catch(function(err){
		alert('Error while loading properties data. See console for more details.');
		return console.log(err);
	});

	$scope.addNewKey = function(key){
		let exists;
		for (let each of Array.from($scope.properties)) { if (each.key === key) { exists = each; } }
		if (exists != null) {
			return alert(`Duplicate key : '${key}'`);
		} else if (key.indexOf(".")!==-1) {
			return alert("Forbidden character : . ");		
		} else {
			return $scope.properties.push({key, value: "default value, update me"});
		}
	};

	$scope.deleteKey = function(kv){
		$scope.propertiesGrid.selectAll(false); // deselect all rows
		return $scope.properties = $scope.properties.filter(each => each.key !== kv.key);
	};

	return $scope.ok = () => // send all the key-value pairs for update
    UserService.updateUserProperties(game.name, domain, $scope.userId, PropertiesHash($scope.properties)).success(() => notificationService.success('properties saved!')).catch(function(err){
        alert('Error while saving data. See console for more details.');
        return console.log(err);
    });
};

module.exports = EditUserPropertiesCtrl;