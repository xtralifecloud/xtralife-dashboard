###
    This controller runs a modal, with template user.html / editProfile.html
###
EditUserProfileCtrl = ($rootScope, $scope, $q, $routeParams, UserService, notificationService)->

	game = $scope.$parent.game
	domain = $scope.$parent.domain
	$scope.userId = $routeParams.userId

	UserService.getUserProfile(game.name, $scope.userId).success (profile)->
		$scope.profile = profile 
	.catch (err)->
		alert('Cannot load profile for user. Try reloading page.')
		console.log err
		$scope.profile = {}

	cleanupProfile = (profile)->
		(delete profile[key] for key in ["displayName", "lang", "firstName", "lastName", "addr1", "addr2", "addr3", "avatar"] when profile[key] == '')
		profile

	$scope.ok = ()-> # send all the key-value pairs for update
		UserService.updateUserProfile(game.name, $scope.userId, cleanupProfile($scope.profile)).success ()->
			notificationService.success 'profile saved!'
		.catch (err)->
			alert('Error while saving profile. See console for more details.')
			console.error err

	$scope.cancel = ()->

module.exports = EditUserProfileCtrl