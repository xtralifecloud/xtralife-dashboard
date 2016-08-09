module.exports = ($rootScope, $scope, $q, $routeParams, UserService, notificationService)->

	game = $scope.$parent.game
	domain = $scope.$parent.domain
	$scope.userId = $routeParams.userId

	$scope.editorOptions =
		lineWrapping : true
		mode: { name: "javascript", json: true}
		readOnly : true

	$scope.source = ''

	UserService.getUserOutline(game.name, $scope.userId).success (outline)->
		console.log outline
		delete outline.profile
		delete outline.domains
		delete outline.servertime
		$scope.source = JSON.stringify outline, '', 2 
	.catch (err)->
		notificationService.error('Cannot load data for user. Try reloading page.')
		console.log err
		$scope.source = ''

