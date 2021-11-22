/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
module.exports = function($rootScope, $scope, $modal, $location, $q, UserService, ngTableParams) {
	let {
        game
    } = $scope.$parent;
	let {
        domain
    } = $scope.$parent;

	$scope.multiSelect = false;
	$scope.selectedUsers = []; // Will contain one or more users

	$scope.usersTable = new ngTableParams({
		page: 1, // show first page
		count: 10
	}
	, {
		getData($defer, params) {
			const skip = () => (params.page() - 1) * params.count();
			const limit = () => params.count();
			const isSearch = () => (params.filter().q != null) && (params.filter().q !== '');
			const isID = () => (params.filter().id != null) && (params.filter().id !== '');

			const listUsers = function(){
				if (isID()) {
					return UserService.findUser(game.name, params.filter().id);
				} else if (isSearch()) {
					return UserService.searchUsers(game.name, params.filter().q, skip() , limit());
				} else {
					return UserService.getUsers(game.name, skip() , limit());
				}
			};

			$scope.selectedUsers = [];
			return listUsers().success(function(users){ // data is {list: [], total: int}
				params.total(users.total);
				return $defer.resolve(users.list);}).catch(function(err){
				alert("Can't load user list. See Console for more details");
				return console.error(err);});
		}
	}
	);

	$scope.$on('domainChanged', function(event, value){
		if(value.fromGameChange) {
			domain = value.domain;
		}else{
			domain = value.domain;
			$scope.usersTable.reload()
		}
		return;
	});

	$scope.$on('gameChanged', function(event, value){
		game = value;
		return $scope.usersTable.reload();
	});

	$scope.changeSelection = function(user){
		const singleSelect = function(){
			if ($scope.selectedUsers[0] != null) {
				$scope.selectedUsers[0].$selected=false;
			}
			user.$selected = true;
			return $scope.selectedUsers = [user];
		};

		const multiSelect = function(){
			user.$selected = !user.$selected; // inverse selection
			if (user.$selected) {
				return $scope.selectedUsers.push(user);
			} else {
				return $scope.selectedUsers = $scope.selectedUsers.filter(each => each !== user);
			}
		};

		if ($scope.multiSelect) { return multiSelect(); } else { return singleSelect(); }
	};

	$scope.deleteSelectedUsers = () => $q.all(Array.from($scope.selectedUsers).map((each) => UserService.deleteUser(game.name, each._id)))
    .then(function(){
        alert(`${$scope.selectedUsers.length} users deleted`);
        return $scope.usersTable.reload();}).catch(function(err){
        alert("Couldn't delete selected users");
        return console.error(err);
    });

	const modalForSingleSelection = (templateUrl, controller) => $modal.open({
        templateUrl,
        controller,
        resolve: {
            selectedUser(){ return $scope.selectedUsers[0]; },
            UserService(){ return UserService; },
            domain() { return domain; },
            game() { return game; }
        }}).result;

	return $scope.sendMessage = function(){
		const modalInstance = $modal.open({
			templateUrl: 'users.sendMessage.html',
			controller: require('./users.sendMessage.js'),
			resolve: {
				selectedUsers() { return $scope.selectedUsers; },
				UserService() { return UserService; },
				domain() { return domain; },
				game() { return game; }
			}
		});

		return modalInstance.result.then(() => $scope.usersTable.reload());
	};
};
