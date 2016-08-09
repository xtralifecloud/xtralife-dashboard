module.exports = ($rootScope, $scope, $modal, $location, $q, UserService, ngTableParams) ->
	game = $scope.$parent.game
	domain = $scope.$parent.domain

	$scope.multiSelect = false
	$scope.selectedUsers = [] # Will contain one or more users

	$scope.usersTable = new ngTableParams(
		page: 1 # show first page
		count: 10
	,
		getData: ($defer, params) ->
			skip = ()-> (params.page() - 1) * params.count()
			limit = ()-> params.count()
			isSearch = ()-> params.filter().q? and params.filter().q isnt ''
			isID = ()-> params.filter().id? and params.filter().id isnt ''

			listUsers = ()->
				if isID()
					UserService.findUser(game.name, params.filter().id)
				else if isSearch()
					UserService.searchUsers(game.name, params.filter().q, skip() , limit())
				else
					UserService.getUsers(game.name, skip() , limit())

			$scope.selectedUsers = []
			listUsers().success (users)-> # data is {list: [], total: int}
				params.total(users.total)
				$defer.resolve users.list
			.catch (err)->
				alert("Can't load user list. See Console for more details")
				console.error err
	)

	$scope.$on 'domainChanged', (event, value)->
		domain = value
		$scope.usersTable.reload()

	$scope.$on 'gameChanged', (event, value)->
		game = value
		$scope.usersTable.reload()

	$scope.changeSelection = (user)->
		singleSelect = ()->
			$scope.selectedUsers[0]?.$selected=false
			user.$selected = true
			$scope.selectedUsers = [user]

		multiSelect = ()->
			user.$selected = !user.$selected # inverse selection
			if user.$selected
				$scope.selectedUsers.push(user)
			else
				$scope.selectedUsers = $scope.selectedUsers.filter (each)->each isnt user

		if $scope.multiSelect then multiSelect() else singleSelect()

	$scope.deleteSelectedUsers = ()->
		$q.all(UserService.deleteUser(game.name, each._id) for each in $scope.selectedUsers)
		.then ()->
			alert "#{$scope.selectedUsers.length} users deleted"
			$scope.usersTable.reload()

		.catch (err)->
			alert("Couldn't delete selected users")
			console.error err

	modalForSingleSelection = (templateUrl, controller)->
		$modal.open
			templateUrl: templateUrl
			controller: controller
			resolve:
				selectedUser: ()-> $scope.selectedUsers[0]
				UserService: ()-> UserService
				domain: -> domain
				game: -> game

		.result

	$scope.sendMessage = ()->
		modalInstance = $modal.open
			templateUrl: 'users.sendMessage.html'
			controller: require './users.sendMessage.coffee'
			resolve:
				selectedUsers: -> $scope.selectedUsers
				UserService: -> UserService
				domain: -> domain
				game: -> game

		modalInstance.result.then ()->
			$scope.usersTable.reload()
