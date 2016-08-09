###
    This controller runs a modal
###
UserBestScoresCtrl = ($rootScope, $scope, $routeParams, UserService, ngTableParams, notificationService)->

	game = $scope.$parent.game
	domain = $scope.$parent.domain
	$scope.userId = $routeParams.userId

	$scope.scoresTable = new ngTableParams(
		page: 1 # show first page
		count: 100
	,
		getData: ($defer, params) ->
			UserService.bestScores(game.name, domain, $scope.userId)
			.success (res)->
				result = []
				for s of res
					result.push {leaderboard : s, score : res[s].score, rank: res[s].rank, info : res[s].info}
				params.total(result.length)
				$defer.resolve result

			.catch (err)->
				notificationService.error JSON.strigify(err)
	)


	$scope.deleteScore = (lb)->
		UserService.deleteScore(game.name, domain, $scope.userId, lb)
		.success ()->
			$scope.scoresTable.reload()
		.catch (err)->
			notificationService.error JSON.strigify(err)

module.exports = UserBestScoresCtrl