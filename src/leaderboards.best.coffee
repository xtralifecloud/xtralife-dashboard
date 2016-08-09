###
    This controller runs a modal
###
bestScoresCtrl = ($rootScope, $scope, $modalInstance, $q, selectedUser, UserService, game, domain)->

	$scope.user = selectedUser

	$scope.scores = []

	_loadScores = ()->
		UserService.bestScores(game.name, domain, selectedUser.gamer_id)
		.success (res)->
			$scope.scores = res
		.catch (err)->
			console.error err

	_loadScores()

	$scope.deleteScore = (lb)->
		UserService.deleteScore(game.name, domain, selectedUser.gamer_id, lb)
		.success ()->
			_loadScores()
		.catch (err)->
			console.error err

	$scope.close = ()->
		$modalInstance.close()

module.exports = bestScoresCtrl