module.exports = ($rootScope, $scope, $q, $routeParams, UserService, ngTableParams, notificationService)->

	game = $scope.$parent.game
	domain = $scope.$parent.domain
	$scope.userId = $routeParams.userId

	$scope.usersTable = new ngTableParams(
		page: 1 # show first page
		count: 10
	,
		getData: ($defer, params) ->
			skip = ()-> (params.page() - 1) * params.count()
			limit = ()-> params.count()
			isSearch = ()-> params.filter().q? and params.filter().q isnt ''

			UserService.getFriends(game.name, domain, $scope.userId).success (friends)->
				(each.blacklisted = false) for each in friends.friends
				(each.blacklisted = true) for each in friends.blackList

				result = friends.friends
				result.push each for each in friends.blackList

				params.total(result.length)
				$defer.resolve result

			.catch (err)->
				alert("Can't load user list. See Console for more details")
				console.error err

	)

	$scope.removeFriend = (friend)->
		UserService.removeFriend(game.name, domain, $scope.userId, friend.gamer_id)
		.success ->
			notificationService.success 'friend removed!'
			$scope.usersTable.reload()
		.catch (err)->
			alert("Can't remove friend. See Console for more details")
			console.error err

